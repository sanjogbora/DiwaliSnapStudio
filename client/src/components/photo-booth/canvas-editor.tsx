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
      setPolaroidHeight(polaroidSpace);
      setCanvasSize({ width, height: height + polaroidSpace });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
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
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      return;
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

            {/* Stickers */}
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

            {/* Polaroid white space */}
            <Rect
              x={0}
              y={photoHeight}
              width={canvasSize.width}
              height={polaroidHeight}
              fill="white"
              listening={false}
            />

            {/* Handwritten message */}
            {polaroidMessage && (
              <KonvaText
                x={20}
                y={photoHeight + polaroidHeight / 2 - 12}
                width={canvasSize.width - 40}
                text={polaroidMessage}
                fontSize={24}
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
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
