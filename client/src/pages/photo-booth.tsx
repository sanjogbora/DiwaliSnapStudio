import { useState, useRef, useCallback } from "react";
import { Camera, Upload, ImagePlus, Download, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CanvasEditor } from "@/components/photo-booth/canvas-editor";
import { StickerDrawer } from "@/components/photo-booth/sticker-drawer";
import type { Sticker, StickerLibraryItem } from "@shared/schema";
import Konva from "konva";

export default function PhotoBooth() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoOrientation, setPhotoOrientation] = useState<"landscape" | "portrait">("portrait");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [polaroidMessage, setPolaroidMessage] = useState("");
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
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
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

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
      width: 80,
      height: 80,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setStickers((prev) => [...prev, newSticker]);
    setIsStickerDrawerOpen(false);
  }, []);

  const handleUpdateSticker = useCallback((id: string, updates: Partial<Sticker>) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.id === id ? { ...sticker, ...updates } : sticker))
    );
  }, []);

  const handleDeleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((sticker) => sticker.id !== id));
  }, []);

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
      } else {
        await handleExport();
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-saffron to-festival-orange p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Diwali Photo Booth</h1>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
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
            <div className="flex-1 min-h-0 overflow-auto bg-muted/30 flex items-center justify-center p-4">
              <CanvasEditor
                photoUrl={photoUrl}
                photoOrientation={photoOrientation}
                stickers={stickers}
                polaroidMessage={polaroidMessage}
                onUpdateSticker={handleUpdateSticker}
                onDeleteSticker={handleDeleteSticker}
                stageRef={stageRef}
              />
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-card border-t border-border p-3 safe-bottom space-y-3 flex-shrink-0">
              {/* Message Input */}
              <div className="px-2">
                <Input
                  type="text"
                  placeholder="Add your message or name..."
                  value={polaroidMessage}
                  onChange={(e) => setPolaroidMessage(e.target.value)}
                  className="text-center font-handwriting"
                  maxLength={50}
                  data-testid="input-polaroid-message"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsStickerDrawerOpen(true)}
                  className="flex flex-col items-center justify-center h-16 px-2"
                  data-testid="button-add-sticker"
                >
                  <ImagePlus className="w-5 h-5 mb-1" />
                  <span className="text-xs">Sticker</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center h-16 px-2"
                  data-testid="button-export"
                >
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs">Download</span>
                </Button>

                <Button
                  onClick={handleShare}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center h-16 px-2"
                  data-testid="button-share"
                >
                  <Share2 className="w-5 h-5 mb-1" />
                  <span className="text-xs">Share</span>
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
    </div>
  );
}
