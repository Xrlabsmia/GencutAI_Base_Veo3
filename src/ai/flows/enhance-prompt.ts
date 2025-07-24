'use server';

/**
 * @fileOverview Enhances a text prompt using AI to optimize it for video generation with Veo.
 *
 * - enhancePrompt - A function that handles the prompt enhancement process.
 * - EnhancePromptInput - The input type for the enhancePrompt function.
 * - EnhancePromptOutput - The return type for the enhancePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePromptInputSchema = z.object({
  basicPrompt: z.string().describe('The original text prompt to be enhanced.'),
});
export type EnhancePromptInput = z.infer<typeof EnhancePromptInputSchema>;

const EnhancePromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The AI-enhanced text prompt optimized for Veo video generation.'),
});
export type EnhancePromptOutput = z.infer<typeof EnhancePromptOutputSchema>;

export async function enhancePrompt(input: EnhancePromptInput): Promise<EnhancePromptOutput> {
  return enhancePromptFlow(input);
}

const enhancePromptPrompt = ai.definePrompt({
  name: 'enhancePromptPrompt',
  input: {schema: EnhancePromptInputSchema},
  output: {schema: EnhancePromptOutputSchema},
  prompt: `You are an AI prompt enhancer specializing in optimizing text prompts for video generation with Google Veo.

  Given the following basic prompt, enhance it to be more effective for generating high-quality videos with Veo. Consider adding details about camera movement, style, and mood to achieve the best possible result.

  Basic Prompt: {{{basicPrompt}}}

  Enhanced Prompt:`, // The colon is important as the LLM will complete it to generate the enhanced prompt.
});

const enhancePromptFlow = ai.defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancePromptOutputSchema,
  },
  async input => {
    const {output} = await enhancePromptPrompt(input);
    return output!;
  }
);
