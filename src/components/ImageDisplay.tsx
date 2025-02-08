
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ImageDisplayProps {
  imageUrl?: string;
  isLoading?: boolean;
  alt?: string;
}

export const ImageDisplay = ({ imageUrl, isLoading, alt = "Generated floor plan" }: ImageDisplayProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <Card className="w-full h-[500px] flex items-center justify-center bg-architectural-50 overflow-hidden">
      {(isLoading || !imageUrl) ? (
        <div className="flex flex-col items-center gap-4 text-architectural-400">
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Generating your floor plan...</p>
            </>
          ) : (
            <p>Your generated floor plan will appear here</p>
          )}
        </div>
      ) : (
        <div className="relative w-full h-full">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-architectural-400" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={alt}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>
      )}
    </Card>
  );
};
