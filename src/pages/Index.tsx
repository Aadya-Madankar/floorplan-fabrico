
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageDisplay } from "@/components/ImageDisplay";
import { ImageUpload } from "@/components/ImageUpload";
import { RunwareService, type GeneratedImage } from "@/services/RunwareService";
import { MessageSquarePlus, Image as ImageIcon, Box, Wand2, ThreeDCube, Share2, Download, Ruler } from "lucide-react";
import { toast } from "sonner";
import { ImageSegmentation } from "@/components/ImageSegmentation";
import { Interior3DView } from "@/components/Interior3DView";

interface Dimensions {
  width: number;
  length: number;
  height: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
}

const floorPlanTemplates: Template[] = [
  {
    id: "studio",
    name: "Studio Apartment",
    description: "An efficient studio apartment with smart space usage",
    basePrompt: "efficient studio apartment floor plan with smart space usage, open concept living"
  },
  {
    id: "luxury",
    name: "Luxury Home",
    description: "A spacious luxury home with multiple amenities",
    basePrompt: "spacious luxury home floor plan with multiple bedrooms, modern amenities, elegant design"
  },
  {
    id: "office",
    name: "Open Office",
    description: "An open office with collaborative workspaces",
    basePrompt: "open office floor plan with collaborative workspaces, meeting rooms, and break areas"
  },
  // ... Add more templates based on the provided list
];

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, length: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [runwareService, setRunwareService] = useState<RunwareService | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Runware API key");
      return;
    }
    setRunwareService(new RunwareService(apiKey));
    toast.success("API key saved successfully");
  };

  const handleDimensionsChange = (field: keyof Dimensions, value: string) => {
    setDimensions(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const generatePrompt = () => {
    const template = floorPlanTemplates.find(t => t.id === selectedTemplate);
    if (!template) return "";

    return `${template.basePrompt}, dimensions: ${dimensions.width}x${dimensions.length} meters, 
    architectural 2D floor plan blueprint, top-down view, detailed measurements, professional 
    architectural drawing style, clear room labels, furniture layout`;
  };

  const handleGenerate = async () => {
    if (!runwareService) {
      toast.error("Please enter your Runware API key first");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
    if (dimensions.width <= 0 || dimensions.length <= 0) {
      toast.error("Please enter valid dimensions");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await runwareService.generateImage({
        positivePrompt: generatePrompt(),
        negativePrompt: "blurry, unclear labels, distorted proportions",
        model: "runware:101@1",
        CFGScale: 10,
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

  const handleShare = async () => {
    if (!generatedImage?.imageURL) {
      toast.error("No floor plan to share");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedImage.imageURL);
      toast.success("Image URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleDownload = async () => {
    if (!generatedImage?.imageURL) {
      toast.error("No floor plan to download");
      return;
    }

    try {
      const response = await fetch(generatedImage.imageURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `floor-plan-${selectedTemplate}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Floor plan downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download floor plan");
    }
  };

  return (
    <div className="min-h-screen bg-architectural-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#9b87f5] mb-4">VAAR-AI Floor Plan Generator</h1>
        </div>

        {!runwareService ? (
          <Card className="p-6 max-w-md mx-auto">
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
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Design Your Floor Plan</h2>
              
              {/* Template Selection */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium">Select Template</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {floorPlanTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dimensions Input */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium">Dimensions (meters)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Width"
                      value={dimensions.width || ""}
                      onChange={(e) => handleDimensionsChange("width", e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Length"
                      value={dimensions.length || ""}
                      onChange={(e) => handleDimensionsChange("length", e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Height"
                      value={dimensions.height || ""}
                      onChange={(e) => handleDimensionsChange("height", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                Generate Floor Plan
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "2D" ? "3D" : "2D")}
                  >
                    {viewMode === "2D" ? <ThreeDCube className="h-4 w-4" /> : <Ruler className="h-4 w-4" />}
                    {viewMode === "2D" ? "View 3D" : "View 2D"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    disabled={!generatedImage}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!generatedImage}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              {generatedImage && (
                <div className="relative">
                  {viewMode === "2D" ? (
                    <ImageDisplay
                      imageUrl={generatedImage.imageURL}
                      isLoading={isGenerating}
                    />
                  ) : (
                    <Interior3DView imageUrl={generatedImage.imageURL} />
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
