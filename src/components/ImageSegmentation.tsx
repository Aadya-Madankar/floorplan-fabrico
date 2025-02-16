
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { env, pipeline } from '@huggingface/transformers';

interface ImageSegmentationProps {
  imageUrl: string;
  onSegmentSelect: (segment: string) => void;
}

export const ImageSegmentation = ({ imageUrl, onSegmentSelect }: ImageSegmentationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [segments, setSegments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    analyzeImage();
  }, [imageUrl]);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
      const result = await segmenter(imageUrl);
      
      // Get unique segments
      const uniqueSegments = Array.from(new Set(result.map((item: any) => item.label)));
      setSegments(uniqueSegments);
      
      if (canvasRef.current) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const canvas = canvasRef.current!;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
        };
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSegmentSelect = (segment: string) => {
    setSelectedSegment(segment);
    onSegmentSelect(segment);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-auto border rounded-lg"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-white">Analyzing image segments...</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {segments.map((segment) => (
            <Button
              key={segment}
              variant={selectedSegment === segment ? "default" : "outline"}
              onClick={() => handleSegmentSelect(segment)}
              className="text-sm"
            >
              {segment}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
