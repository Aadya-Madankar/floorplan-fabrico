
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageDisplay } from "@/components/ImageDisplay";
import { ImageUpload } from "@/components/ImageUpload";
import { Interior3DView } from "@/components/Interior3DView";
import { RunwareService, type GeneratedImage } from "@/services/RunwareService";
import { MessageSquarePlus, Image as ImageIcon, Download, Cube } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [runwareService, setRunwareService] = useState<RunwareService | null>(null);

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Runware API key");
      return;
    }
    setRunwareService(new RunwareService(apiKey));
    toast.success("API key saved successfully");
  };

  const handleGenerate = async () => {
    if (!runwareService) {
      toast.error("Please enter your Runware API key first");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await runwareService.generateImage({
        positivePrompt: `architectural 2D floor plan blueprint, top-down view, ${prompt}`,
      });
      setGeneratedImage(result);
      toast.success("Floor plan generated successfully!");
    } catch (error) {
      toast.error("Failed to generate floor plan. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    toast.info("Image-to-image generation coming soon!");
  };

  const handleDownload = async () => {
    if (!generatedImage?.imageURL) {
      toast.error("No floor plan available to download");
      return;
    }

    try {
      const response = await fetch(generatedImage.imageURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'floor-plan.webp';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Floor plan downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download floor plan");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-architectural-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#9b87f5]">
            VAAR-AI
          </h1>
          <p className="text-architectural-600 max-w-2xl mx-auto">
            Generate architectural 2D floor plan blueprints and 3D interiors using AI. Simply describe your vision
            or upload a reference image.
          </p>
        </div>

        {!runwareService && (
          <Card className="p-6 max-w-md mx-auto animate-slideUp">
            <h2 className="text-xl font-semibold mb-4">Enter your API Key</h2>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Your Runware API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={handleApiKeySubmit}>Save</Button>
            </div>
            <p className="text-sm text-architectural-500 mt-2">
              Don't have an API key? Visit{" "}
              <a
                href="https://runware.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Runware
              </a>
            </p>
          </Card>
        )}

        <Tabs defaultValue="text" className="animate-slideUp">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Text to Plan
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Image to Plan
            </TabsTrigger>
            <TabsTrigger value="interior3d" className="flex items-center gap-2">
              <Cube className="h-4 w-4" />
              3D Interior
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <TabsContent value="text" className="m-0 mx-auto max-w-md lg:col-span-2">
              <div className="space-y-4">
                <Input
                  placeholder="Describe your floor plan (e.g., '2-bedroom apartment with open kitchen and dining area')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="text-center"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !runwareService}
                  className="w-full"
                >
                  Generate Floor Plan
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="image" className="m-0 mx-auto max-w-md lg:col-span-2">
              <div className="space-y-4">
                <ImageUpload onImageSelect={handleImageUpload} />
                <Button
                  onClick={() => toast.info("Image-to-image generation coming soon!")}
                  disabled={true}
                  className="w-full"
                >
                  Generate from Image
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="interior3d" className="m-0 mx-auto max-w-md lg:col-span-2">
              <div className="space-y-4">
                <Input
                  placeholder="Describe your interior (e.g., 'modern living room with large windows')"
                  className="text-center"
                />
                <Button
                  onClick={() => toast.info("3D interior generation coming soon!")}
                  disabled={true}
                  className="w-full"
                >
                  Generate 3D Interior
                </Button>
                <Interior3DView isLoading={false} />
              </div>
            </TabsContent>

            <div className="lg:col-span-2">
              <ImageDisplay
                imageUrl={generatedImage?.imageURL}
                isLoading={isGenerating}
              />
              {generatedImage?.imageURL && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handleDownload}
                    className="gap-2"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                    Download Floor Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
