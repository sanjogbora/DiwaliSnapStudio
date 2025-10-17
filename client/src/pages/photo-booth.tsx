import { useState, useRef, useCallback } from "react";
import { Camera, Upload, ImagePlus, Type, Download, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CanvasEditor } from "@/components/photo-booth/canvas-editor";
import { StickerDrawer } from "@/components/photo-booth/sticker-drawer";
import { TextEditorModal } from "@/components/photo-booth/text-editor-modal";
import type { Sticker, TextElement, StickerLibraryItem } from "@shared/schema";
import Konva from "konva";

export default function PhotoBooth() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoOrientation, setPhotoOrientation] = useState<"landscape" | "portrait">("portrait");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const { toast } = useToast();

  // Diwali stickers library
  const stickerLibrary: StickerLibraryItem[] = [
    {
      id: "diya",
      name: "Diya",
      imageUrl: "/stickers/diya.png",
    },
    {
      id: "rangoli",
      name: "Rangoli",
      imageUrl: "/stickers/rangoli.png",
    },
    {
      id: "lantern",
      name: "Lantern",
      imageUrl: "/stickers/lantern.png",
    },
    {
      id: "sparkler",
      name: "Sparkler",
      imageUrl: "/stickers/sparkler.png",
    },
    {
      id: "firework",
      name: "Firework",
      imageUrl: "/stickers/firework.png",
    },
    {
      id: "firecracker",
      name: "Firecracker",
      imageUrl: "/stickers/firecracker.png",
    },
    {
      id: "jalebi",
      name: "Jalebi",
      imageUrl: "/stickers/jalebi.png",
    },
    {
      id: "samosa",
      name: "Samosa",
      imageUrl: "/stickers/samosa.png",
    },
    {
      id: "sweet",
      name: "Sweet",
      imageUrl: "/stickers/sweet.png",
    },
  ];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const orientation = img.width > img.height ? "landscape" : "portrait";
        setPhotoOrientation(orientation);
        setPhotoUrl(e.target?.result as string);
        setIsLoading(false);
        
        toast({
          title: "Photo loaded!",
          description: "Start adding stickers and text",
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleCameraCapture = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAddSticker = useCallback((sticker: StickerLibraryItem) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      imageUrl: sticker.imageUrl,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setStickers((prev) => [...prev, newSticker]);
    setIsStickerDrawerOpen(false);
    
    toast({
      title: "Sticker added!",
      description: "Drag and resize to position",
    });
  }, [toast]);

  const handleAddText = useCallback((text: string, backgroundColor: "red" | "yellow") => {
    const newTextElement: TextElement = {
      id: `text-${Date.now()}`,
      text,
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: "Inter",
      backgroundColor,
      rotation: 0,
    };
    setTextElements((prev) => [...prev, newTextElement]);
    setIsTextEditorOpen(false);
    
    toast({
      title: "Text added!",
      description: "Drag and resize to position",
    });
  }, [toast]);

  const handleUpdateSticker = useCallback((id: string, updates: Partial<Sticker>) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.id === id ? { ...sticker, ...updates } : sticker))
    );
  }, []);

  const handleUpdateText = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
    );
  }, []);

  const handleDeleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((sticker) => sticker.id !== id));
    toast({
      title: "Sticker removed",
    });
  }, [toast]);

  const handleDeleteText = useCallback((id: string) => {
    setTextElements((prev) => prev.filter((text) => text.id !== id));
    toast({
      title: "Text removed",
    });
  }, [toast]);

  const handleExport = useCallback(async () => {
    if (!stageRef.current) return;

    setIsExporting(true);
    try {
      const uri = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `diwali-greeting-${Date.now()}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Image downloaded!",
        description: "Your Diwali greeting is ready",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  const handleShare = useCallback(async () => {
    if (!stageRef.current) return;

    setIsExporting(true);
    try {
      const uri = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
        pixelRatio: 2,
      });

      const blob = await (await fetch(uri)).blob();
      const file = new File([blob], `diwali-greeting-${Date.now()}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Happy Diwali!",
          text: "Wishing you a joyous Diwali!",
        });
        
        toast({
          title: "Shared successfully!",
        });
      } else {
        await handleExport();
        toast({
          title: "Downloaded instead",
          description: "Sharing not supported on this device",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: "Share failed",
          description: "Please try downloading instead",
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  }, [handleExport, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-saffron to-festival-orange p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Diwali Photo Booth</h1>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!photoUrl ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Create Your Diwali Greeting</h2>
              <p className="text-muted-foreground">Upload a photo or take a new one to get started</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button
                size="lg"
                onClick={handleCameraCapture}
                className="flex-1 h-20 text-lg"
                data-testid="button-camera"
              >
                <Camera className="w-6 h-6 mr-2" />
                Take Photo
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleUploadClick}
                className="flex-1 h-20 text-lg"
                data-testid="button-upload"
              >
                <Upload className="w-6 h-6 mr-2" />
                Upload Photo
              </Button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-camera"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-upload"
            />

            {isLoading && (
              <div className="text-center text-muted-foreground">
                Loading your photo...
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Canvas Editor */}
            <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
              <CanvasEditor
                photoUrl={photoUrl}
                photoOrientation={photoOrientation}
                stickers={stickers}
                textElements={textElements}
                onUpdateSticker={handleUpdateSticker}
                onUpdateText={handleUpdateText}
                onDeleteSticker={handleDeleteSticker}
                onDeleteText={handleDeleteText}
                stageRef={stageRef}
              />
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-card border-t border-border p-4 safe-bottom">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsStickerDrawerOpen(true)}
                  className="flex-shrink-0"
                  data-testid="button-add-sticker"
                >
                  <ImagePlus className="w-5 h-5 mr-2" />
                  Add Sticker
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsTextEditorOpen(true)}
                  className="flex-shrink-0"
                  data-testid="button-add-text"
                >
                  <Type className="w-5 h-5 mr-2" />
                  Add Text
                </Button>

                <div className="flex-1" />

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-shrink-0"
                  data-testid="button-export"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>

                <Button
                  size="lg"
                  onClick={handleShare}
                  disabled={isExporting}
                  className="flex-shrink-0"
                  data-testid="button-share"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <StickerDrawer
        isOpen={isStickerDrawerOpen}
        onClose={() => setIsStickerDrawerOpen(false)}
        stickers={stickerLibrary}
        onSelectSticker={handleAddSticker}
      />

      <TextEditorModal
        isOpen={isTextEditorOpen}
        onClose={() => setIsTextEditorOpen(false)}
        onAddText={handleAddText}
      />
    </div>
  );
}
