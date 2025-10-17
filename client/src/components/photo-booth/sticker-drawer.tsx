import { X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StickerLibraryItem } from "@shared/schema";

interface StickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stickers: StickerLibraryItem[];
  onSelectSticker: (sticker: StickerLibraryItem) => void;
}

export function StickerDrawer({
  isOpen,
  onClose,
  stickers,
  onSelectSticker,
}: StickerDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        data-testid="sticker-drawer-backdrop"
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col animate-slide-up md:left-1/2 md:-translate-x-1/2 md:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Sticker</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-sticker-drawer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {stickers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Stickers Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Stickers will appear here once you add them to the public/stickers folder.
                Add your Happy Diwali sticker and other festive decorations!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => onSelectSticker(sticker)}
                  className="aspect-square bg-muted rounded-lg p-2 hover-elevate active-elevate-2 border border-border overflow-hidden"
                  data-testid={`sticker-option-${sticker.id}`}
                >
                  <img
                    src={sticker.thumbnailUrl || sticker.imageUrl}
                    alt={sticker.name}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
