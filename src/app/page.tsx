'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { VideoGeneratorForm, type VideoGeneratorFormValues } from '@/components/video-generator-form';
import { VideoPreview } from '@/components/video-preview';
import { generateVideo } from '@/ai/flows/generate-video';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (data: VideoGeneratorFormValues) => {
    setIsLoading(true);
    setVideoUri(null);
    try {
      const result = await generateVideo(data);
      setVideoUri(result.videoDataUri);
      toast({
        title: "Video Generated Successfully",
        description: "Your video is ready to be previewed and downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Video",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <VideoGeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-3">
            <VideoPreview videoUri={videoUri} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
