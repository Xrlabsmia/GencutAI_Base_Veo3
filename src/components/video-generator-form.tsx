'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2, Loader2, PlaySquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { enhancePrompt } from '@/ai/flows/enhance-prompt';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }).max(1000, {
    message: 'Prompt must not be longer than 1000 characters.',
  }),
  durationSeconds: z.number().min(5).max(8),
  aspectRatio: z.enum(['16:9', '9:16']),
  personGeneration: z.enum(['dont_allow', 'allow_adult', 'allow_all']),
});

export type VideoGeneratorFormValues = z.infer<typeof formSchema>;

interface VideoGeneratorFormProps {
  onGenerate: (values: VideoGeneratorFormValues) => void;
  isLoading: boolean;
}

export function VideoGeneratorForm({ onGenerate, isLoading }: VideoGeneratorFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const form = useForm<VideoGeneratorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      durationSeconds: 5,
      aspectRatio: '16:9',
      personGeneration: 'dont_allow',
    },
  });

  const durationValue = form.watch('durationSeconds');

  const handleEnhancePrompt = async () => {
    setIsEnhancing(true);
    const currentPrompt = form.getValues('prompt');
    if (!currentPrompt || currentPrompt.length < 10) {
      toast({
        title: 'Cannot Enhance Prompt',
        description: 'Please enter a prompt of at least 10 characters to enhance.',
        variant: 'destructive',
      });
      setIsEnhancing(false);
      return;
    }
    try {
      const { enhancedPrompt } = await enhancePrompt({ basicPrompt: currentPrompt });
      form.setValue('prompt', enhancedPrompt, { shouldValidate: true });
       toast({
        title: 'Prompt Enhanced',
        description: 'Your prompt has been optimized for video generation.',
      });
    } catch (e) {
      toast({
        title: 'Enhancement Failed',
        description: (e as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Video</CardTitle>
        <CardDescription>Describe the video you want to create. Be as descriptive as you can!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-8">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Prompt</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={handleEnhancePrompt} disabled={isEnhancing}>
                      {isEnhancing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Enhance
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A cinematic shot of a futuristic city at sunset, with flying cars."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="durationSeconds"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Duration: {durationValue} seconds</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[value]}
                      min={5}
                      max={8}
                      step={1}
                      onValueChange={(vals) => onChange(vals[0])}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aspectRatio"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Aspect Ratio</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="16:9" id="r1" />
                        <Label htmlFor="r1">16:9 (Landscape)</Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="9:16" id="r2" />
                        <Label htmlFor="r2">9:16 (Portrait)</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="personGeneration"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>People in Video</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="dont_allow" id="p1" />
                        <Label htmlFor="p1">Don't Allow People</Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="allow_adult" id="p2" />
                        <Label htmlFor="p2">Allow Adults Only</Label>
                      </FormItem>
                       <FormItem className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="allow_all" id="p3" />
                        <Label htmlFor="p3">Allow All People</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlaySquare className="mr-2 h-4 w-4" />
              )}
              Generate Video
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
