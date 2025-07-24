// src/ai/flows/generate-video.ts
'use server';
/**
 * @fileOverview A video generation AI agent using Google Veo models.
 *
 * - generateVideo - A function that handles the video generation process.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as fs from 'fs';
import {Readable} from 'stream';
import {MediaPart} from 'genkit';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('The text prompt to use for video generation.'),
  durationSeconds: z.number().min(5).max(8).default(5).describe('The length of the output video in seconds, between 5 and 8.'),
  aspectRatio: z
    .enum(['16:9', '9:16'])
    .default('16:9')
    .describe('The aspect ratio of the generated video. Supported values are "16:9" and "9:16".'),
  personGeneration:
    z.enum(['dont_allow', 'allow_adult', 'allow_all']).default('dont_allow').describe(
        'Allow the model to generate videos of people. "dont_allow": Don\'t allow the inclusion of people or faces.' +
        '"allow_adult": Generate videos that include adults, but not children.' +
        '"allow_all": Generate videos that include adults and children.'),
    startingImage: z
    .string()
    .optional()
    .describe(
      "An optional photo to use as reference for the video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});

export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
  return generateVideoFlow(input);
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async input => {
    let veoConfig: any = {
      durationSeconds: input.durationSeconds,
      aspectRatio: input.aspectRatio,
      personGeneration: input.personGeneration,
    };

    let veoPrompt: any = input.prompt;
    if (input.startingImage) {
      veoPrompt = [
        {
          text: 'make the subject in the photo move',
        },
        {
          media: {
            contentType: 'image/jpeg',
            url: input.startingImage,
          },
        },
      ];
    }

    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: veoPrompt,
      config: veoConfig,
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video) {
      throw new Error('Failed to find the generated video');
    }

    // const path = 'output.mp4';
    // await downloadVideo(video, path);

    const videoDataUri = await convertVideoToBase64DataUri(video);

    return {videoDataUri};
  }
);

async function convertVideoToBase64DataUri(video: MediaPart): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  // Add API key before fetching the video.
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  const buffer = await videoDownloadResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:video/mp4;base64,${base64}`;
}

// async function downloadVideo(video: MediaPart, path: string) {
//   const fetch = (await import('node-fetch')).default;
//   // Add API key before fetching the video.
//   const videoDownloadResponse = await fetch(
//     `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
//   );
//   if (
//     !videoDownloadResponse ||
//     videoDownloadResponse.status !== 200 ||
//     !videoDownloadResponse.body
//   ) {
//     throw new Error('Failed to fetch video');
//   }

//   Readable.from(videoDownloadResponse.body).pipe(fs.createWriteStream(path));
// }

