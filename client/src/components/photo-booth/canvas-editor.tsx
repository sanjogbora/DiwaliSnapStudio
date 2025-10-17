import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import type { Sticker, TextElement } from "@shared/schema";
import Konva from "konva";
import { StickerElement } from "@/components/photo-booth/sticker-element";
import { TextElementComponent } from "@/components/photo-booth/text-element";

interface CanvasEditorProps {
  photoUrl: string;
  photoOrientation: "landscape" | "portrait";
  stickers: Sticker[];
  textElements: TextElement[];
  onUpdateSticker: (id: string, updates: Partial<Sticker>) => void;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onDeleteSticker: (id: string) => void;
  onDeleteText: (id: string) => void;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
}

export function CanvasEditor({
  photoUrl,
  photoOrientation,
  stickers,
  textElements,
  onUpdateSticker,
  onUpdateText,
  onDeleteSticker,
  onDeleteText,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !image) return;

      const container = containerRef.current;
      const maxWidth = Math.min(container.clientWidth - 32, 600);
      const maxHeight = window.innerHeight - 300;

      const imageAspect = image.width / image.height;
      let width = maxWidth;
      let height = width / imageAspect;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * imageAspect;
      }

      setCanvasSize({ width, height });
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
              height={canvasSize.height}
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

            {/* Text Elements */}
            {textElements.map((textElement) => (
              <TextElementComponent
                key={textElement.id}
                textElement={textElement}
                isSelected={selectedId === textElement.id}
                onSelect={handleSelect}
                onUpdate={onUpdateText}
                onDelete={onDeleteText}
              />
            ))}

            {/* Frame overlay */}
            {frameImage && (
              <KonvaImage
                image={frameImage}
                width={canvasSize.width}
                height={canvasSize.height}
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
