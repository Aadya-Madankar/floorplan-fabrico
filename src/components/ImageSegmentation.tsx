
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { env, pipeline } from '@huggingface/transformers';
import { toast } from "sonner";

interface ImageSegmentationProps {
  imageUrl: string;
  onSegmentSelect: (segment: string) => void;
}

export const ImageSegmentation = ({ imageUrl, onSegmentSelect }: ImageSegmentationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [segmentData, setSegmentData] = useState<any[]>([]);
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
      setSegmentData(result);
      
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
      toast.error("Error analyzing image segments");
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Scale coordinates to match original image dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const imgX = x * scaleX;
    const imgY = y * scaleY;

    // Find the segment at the clicked position
    const clickedSegment = segmentData.find(segment => {
      const mask = segment.mask;
      const maskData = mask.data;
      const width = mask.width;
      const index = Math.floor(imgY) * width + Math.floor(imgX);
      return maskData[index] > 0;
    });

    if (clickedSegment) {
      setSelectedSegment(clickedSegment.label);
      onSegmentSelect(clickedSegment.label);
      
      // Highlight selected segment
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw original image
      const img = new Image();
      img.src = imageUrl;
      ctx.drawImage(img, 0, 0);
      
      // Highlight selected segment
      ctx.fillStyle = 'rgba(155, 135, 245, 0.3)'; // Purple highlight with transparency
      const maskData = clickedSegment.mask.data;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < maskData.length; i++) {
        if (maskData[i] > 0) {
          const x = i % canvas.width;
          const y = Math.floor(i / canvas.width);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-auto border rounded-lg cursor-crosshair"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-white">Analyzing image segments...</div>
            </div>
          )}
        </div>
        {selectedSegment && (
          <div className="text-center text-sm text-architectural-600">
            Selected: <span className="font-medium">{selectedSegment}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => {
                setSelectedSegment(null);
                onSegmentSelect("");
                // Redraw original image without highlight
                const canvas = canvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext('2d')!;
                  const img = new Image();
                  img.src = imageUrl;
                  img.onload = () => ctx.drawImage(img, 0, 0);
                }
              }}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
