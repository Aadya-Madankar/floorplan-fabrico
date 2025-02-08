
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
  });

  const clearImage = () => {
    setPreview(null);
  };

  return (
    <Card className="w-full h-[300px] relative">
      <div
        {...getRootProps()}
        className={`w-full h-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
          isDragActive
            ? "border-architectural-400 bg-architectural-50"
            : "border-architectural-200 hover:border-architectural-300"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-full object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-architectural-500">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm">
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image here, or click to select"}
            </p>
            <p className="text-xs text-architectural-400">
              Supports PNG, JPG/JPEG
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
