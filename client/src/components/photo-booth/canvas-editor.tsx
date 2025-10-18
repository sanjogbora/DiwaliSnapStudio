import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import type { Sticker } from "@shared/schema";
import Konva from "konva";
import { StickerElement } from "@/components/photo-booth/sticker-element";
import { Trash2 } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const deleteZoneRef = useRef<HTMLDivElement>(null);
  const lastDist = useRef<number>(0);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
  }, []);

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

      // Add polaroid white space at bottom (8% of height)
      const polaroidSpace = Math.max(50, height * 0.08);
      setPolaroidHeight(polaroidSpace);
      setCanvasSize({ width, height: height + polaroidSpace });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [image]);

  useEffect(() => {
    if (!transformerRef.current || isMobile) return;

    const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, stageRef, isMobile]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      return;
    }
  };

  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touchEvent = e.evt;
    
    // If there are 2+ touches and a sticker is selected on mobile, enter pinch mode
    if (isMobile && touchEvent.touches.length >= 2 && selectedId) {
      setIsPinching(true);
      e.evt.preventDefault();
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2 && selectedId && isMobile && isPinching) {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const selectedNode = stage.findOne(`#${selectedId}`);
      if (!selectedNode) return;

      const p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      const p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      const newDist = getDistance(p1, p2);
      const newCenter = getCenter(p1, p2);

      if (lastDist.current === 0) {
        lastDist.current = newDist;
        lastCenter.current = newCenter;
        return;
      }

      const scale = newDist / lastDist.current;
      const currentWidth = selectedNode.width() * selectedNode.scaleX();
      const currentHeight = selectedNode.height() * selectedNode.scaleY();
      
      const newWidth = Math.max(50, currentWidth * scale);
      const newHeight = Math.max(50, currentHeight * scale);

      // Calculate position adjustment to keep center fixed
      const currentX = selectedNode.x();
      const currentY = selectedNode.y();
      const currentCenterX = currentX + currentWidth / 2;
      const currentCenterY = currentY + currentHeight / 2;
      
      const newX = currentCenterX - newWidth / 2;
      const newY = currentCenterY - newHeight / 2;

      onUpdateSticker(selectedId, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1,
      });

      lastDist.current = newDist;
      lastCenter.current = newCenter;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    lastCenter.current = null;
    setIsPinching(false);
  };

  if (!image) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  const photoHeight = canvasSize.height - polaroidHeight;

  const handleStickerDragStart = () => {
    setIsDragging(true);
  };

  const handleStickerDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    
    if (deleteZoneRef.current) {
      const deleteZoneRect = deleteZoneRef.current.getBoundingClientRect();
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      
      const stageRect = stage.container().getBoundingClientRect();
      const absoluteX = stageRect.left + pointerPos.x;
      const absoluteY = stageRect.top + pointerPos.y;
      
      if (
        absoluteX >= deleteZoneRect.left &&
        absoluteX <= deleteZoneRect.right &&
        absoluteY >= deleteZoneRect.top &&
        absoluteY <= deleteZoneRect.bottom
      ) {
        onDeleteSticker(id);
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
      {/* Delete zone - shows when dragging */}
      {isDragging && (
        <div
          ref={deleteZoneRef}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground rounded-full p-2 shadow-2xl animate-bounce"
          data-testid="delete-zone"
        >
          <Trash2 className="w-5 h-5" />
        </div>
      )}
      
      <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          ref={stageRef}
          onTouchStart={handleTouchStart}
          onClick={handleStageClick}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Layer>
            {/* Photo */}
            <KonvaImage
              image={image}
              width={canvasSize.width}
              height={photoHeight}
            />

            {/* Polaroid white space - rendered before stickers so stickers can be on top */}
            <Rect
              x={0}
              y={photoHeight}
              width={canvasSize.width}
              height={polaroidHeight}
              fill="white"
              listening={false}
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
                onDragStart={handleStickerDragStart}
                onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => handleStickerDragEnd(sticker.id, e)}
                draggable={!isPinching}
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
                x={30}
                y={photoHeight + polaroidHeight / 2 - 9}
                width={canvasSize.width - 60}
                text={polaroidMessage}
                fontSize={18}
                fontFamily="'Caveat', cursive"
                fill="#333"
                align="center"
                listening={false}
              />
            )}

            {/* Transformer for selected elements - desktop only */}
            {!isMobile && (
              <Transformer
                ref={transformerRef}
                keepRatio={true}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize
                  if (newBox.width < 50 || newBox.height < 50) {
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
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
