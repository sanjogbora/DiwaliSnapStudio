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

  useEffect(() => {
    if (image && sticker.width === 80 && sticker.height === 80) {
      const aspectRatio = image.width / image.height;
      const targetWidth = 80;
      const targetHeight = targetWidth / aspectRatio;
      
      // Only update if dimensions would actually change (prevents loops for square stickers)
      if (Math.abs(targetHeight - sticker.height) > 0.1) {
        onUpdate(sticker.id, {
          width: targetWidth,
          height: targetHeight,
        });
      }
    }
  }, [image, sticker.id, sticker.width, sticker.height, onUpdate]);

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
    const rotation = node.rotation();

    node.scaleX(1);
    node.scaleY(1);

    onUpdate(sticker.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleX),
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
