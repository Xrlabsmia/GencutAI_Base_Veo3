'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clapperboard, Download, Loader2 } from 'lucide-react';

interface VideoPreviewProps {
  videoUri: string | null;
  isLoading: boolean;
}

export function VideoPreview({ videoUri, isLoading }: VideoPreviewProps) {
  const handleDownload = () => {
    if (!videoUri) return;
    const link = document.createElement('a');
    link.href = videoUri;
    link.download = 'gencut-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="h-full border-2 border-dashed border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle>Video Preview</CardTitle>
        <CardDescription>Your generated video will appear here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden ring-1 ring-inset ring-border/50">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 z-10 transition-opacity duration-300">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-semibold">Generating your masterpiece...</p>
              <p className="text-sm text-muted-foreground/80">This may take a minute.</p>
            </div>
          )}
          {videoUri && !isLoading ? (
            <video src={videoUri} controls className="w-full h-full object-contain" autoPlay loop/>
          ) : (
            !isLoading && (
                <div className="text-center text-muted-foreground p-8">
                <Clapperboard className="h-16 w-16 mx-auto mb-4 text-primary/70" />
                <p className="font-semibold">Ready to create magic?</p>
                <p className="text-sm">Fill out the form to generate your video.</p>
                </div>
            )
          )}
        </div>
        {videoUri && !isLoading && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleDownload} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
