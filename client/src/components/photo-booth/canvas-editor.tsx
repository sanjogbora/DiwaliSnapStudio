import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import type { Sticker } from "@shared/schema";
import Konva from "konva";
import { StickerElement } from "@/components/photo-booth/sticker-element";

interface CanvasEditorProps {
  photoUrl: string;
  photoOrientation: "landscape" | "portrait";
  stickers: Sticker[];
  polaroidMessage: string;
  onUpdateSticker: (id: string, updates: Partial<Sticker>) => void;
  onDeleteSticker: (id: string) => void;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
}

export function CanvasEditor({
  photoUrl,
  photoOrientation,
  stickers,
  polaroidMessage,
  onUpdateSticker,
  onDeleteSticker,
  stageRef,
}: CanvasEditorProps) {
  const [image] = useImage(photoUrl);
  const [frameImage] = useImage(
    photoOrientation === "landscape"
      ? "/frames/landscape.png"
      : "/frames/portrait.png"
  );
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });
  const [polaroidHeight, setPolaroidHeight] = useState(80);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedIdRef = useRef<string | null>(null);

  // Keep ref in sync with state for export access
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !image) return;

      const container = containerRef.current;
      const maxWidth = Math.min(container.clientWidth - 32, 600);
      const maxHeight = window.innerHeight - 350;

      const imageAspect = image.width / image.height;
      let width = maxWidth;
      let height = width / imageAspect;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * imageAspect;
      }

      // Add polaroid white space at bottom (15% of height)
      const polaroidSpace = Math.max(60, height * 0.15);
      
      // Only update if dimensions actually changed (prevent unnecessary re-renders)
      setCanvasSize(prev => {
        const newWidth = Math.round(width);
        const newHeight = Math.round(height + polaroidSpace);
        const newPolaroidHeight = Math.round(polaroidSpace);
        
        if (Math.abs(prev.width - newWidth) > 1 || Math.abs(prev.height - newHeight) > 1) {
          setPolaroidHeight(newPolaroidHeight);
          return { width: newWidth, height: newHeight };
        }
        return prev;
      });
    };

    updateSize();
    
    // Use ResizeObserver instead of window resize to prevent scroll-triggered resizes
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [image]);

  useEffect(() => {
    if (!transformerRef.current) return;

    const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, stageRef]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Deselect if clicking on stage or any non-sticker element
    const targetId = e.target.id();
    const isSticker = targetId && targetId.startsWith('sticker-');
    const isTransformerAnchor = e.target.getParent()?.getClassName() === 'Transformer';
    
    const clickedOnEmpty = e.target === e.target.getStage() || 
                          (e.target.getType() === 'Image' && !isSticker) ||
                          (e.target.getType() === 'Rect' && !isTransformerAnchor) ||
                          e.target.getType() === 'Text';
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  if (!image) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  const photoHeight = canvasSize.height - polaroidHeight;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          ref={stageRef}
          onTouchStart={handleStageClick}
          onClick={handleStageClick}
        >
          <Layer>
            {/* Photo */}
            <KonvaImage
              image={image}
              width={canvasSize.width}
              height={photoHeight}
            />

            {/* Polaroid gradient strip - rendered before stickers so stickers can be on top */}
            <Rect
              x={0}
              y={photoHeight}
              width={canvasSize.width}
              height={polaroidHeight}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: polaroidHeight }}
              fillLinearGradientColorStops={[
                0, '#FFFDF7',      // 0% - Almost white, blends softly with the photo
                0.5, '#FFF4D9',    // 50% - Warm off-white, gentle transition
                1, '#FFFFC3'       // 100% - Muted cream-yellow base
              ]}
            />

            {/* Stickers - can now be placed anywhere including polaroid strip */}
            {stickers.map((sticker) => (
              <StickerElement
                key={sticker.id}
                sticker={sticker}
                isSelected={selectedId === sticker.id}
                onSelect={handleSelect}
                onUpdate={onUpdateSticker}
                onDelete={onDeleteSticker}
              />
            ))}

            {/* Frame overlay */}
            {frameImage && (
              <KonvaImage
                image={frameImage}
                width={canvasSize.width}
                height={photoHeight}
                listening={false}
              />
            )}

            {/* Handwritten message */}
            {polaroidMessage && (
              <KonvaText
                x={20}
                y={photoHeight + polaroidHeight / 2 - 10}
                width={canvasSize.width - 40}
                text={polaroidMessage}
                fontSize={19}
                fontFamily="'Caveat', cursive"
                fill="#333"
                align="center"
                listening={false}
              />
            )}

            {/* Transformer for selected elements */}
            <Transformer
              ref={transformerRef}
              keepRatio={true}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize to minimum 20px (allow smaller stickers)
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
              rotateEnabled={true}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
