import { useEffect, useRef } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { Sticker } from "@shared/schema";
import Konva from "konva";

interface StickerElementProps {
  sticker: Sticker;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Sticker>) => void;
  onDelete: (id: string) => void;
}

export function StickerElement({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: StickerElementProps) {
  const [image] = useImage(sticker.imageUrl);
  const imageRef = useRef<Konva.Image>(null);
  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (isSelected && imageRef.current) {
      imageRef.current.moveToTop();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onUpdate(sticker.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Use the average scale to maintain aspect ratio
    const scale = Math.max(scaleX, scaleY);
    
    node.scaleX(1);
    node.scaleY(1);

    onUpdate(sticker.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(50, node.width() * scale),
      height: Math.max(50, node.height() * scale),
      rotation,
      scaleX: 1,
      scaleY: 1,
    });
  };

  const handleTap = () => {
    const currentTime = new Date().getTime();
    const tapGap = currentTime - lastTap.current;

    if (tapGap < 300 && tapGap > 0) {
      // Double tap detected
      onDelete(sticker.id);
    } else {
      // Single tap
      onSelect(sticker.id);
    }

    lastTap.current = currentTime;
  };

  if (!image) return null;

  return (
    <KonvaImage
      ref={imageRef}
      id={sticker.id}
      image={image}
      x={sticker.x}
      y={sticker.y}
      width={sticker.width}
      height={sticker.height}
      rotation={sticker.rotation}
      scaleX={sticker.scaleX}
      scaleY={sticker.scaleY}
      draggable
      onClick={handleTap}
      onTap={handleTap}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      data-testid={`sticker-${sticker.id}`}
    />
  );
}
