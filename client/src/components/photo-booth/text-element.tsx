import { useEffect, useRef } from "react";
import { Group, Text, Rect } from "react-konva";
import type { TextElement } from "@shared/schema";
import { textBackgroundColors } from "@shared/schema";
import Konva from "konva";

interface TextElementComponentProps {
  textElement: TextElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TextElement>) => void;
  onDelete: (id: string) => void;
}

export function TextElementComponent({
  textElement,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: TextElementComponentProps) {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const lastTap = useRef<number>(0);

  const bgColor = textBackgroundColors[textElement.backgroundColor];
  
  // Convert HSL to RGB for Konva
  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  };

  const parsedBg = bgColor.bg.split(" ").map(parseFloat);
  const [r, g, b] = hslToRgb(parsedBg[0], parsedBg[1], parsedBg[2]);
  const backgroundColor = `rgb(${r}, ${g}, ${b})`;

  const parsedFg = bgColor.fg.split(" ").map(parseFloat);
  const [fr, fg, fb] = hslToRgb(parsedFg[0], parsedFg[1], parsedFg[2]);
  const foregroundColor = `rgb(${fr}, ${fg}, ${fb})`;

  useEffect(() => {
    if (isSelected && groupRef.current) {
      groupRef.current.moveToTop();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onUpdate(textElement.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    node.scaleX(1);
    node.scaleY(1);

    onUpdate(textElement.id, {
      x: node.x(),
      y: node.y(),
      fontSize: Math.max(12, textElement.fontSize * Math.max(scaleX, scaleY)),
      rotation,
    });
  };

  const handleTap = () => {
    const currentTime = new Date().getTime();
    const tapGap = currentTime - lastTap.current;

    if (tapGap < 300 && tapGap > 0) {
      // Double tap detected
      onDelete(textElement.id);
    } else {
      // Single tap
      onSelect(textElement.id);
    }

    lastTap.current = currentTime;
  };

  const textWidth = textRef.current?.getTextWidth() || 100;
  const textHeight = textElement.fontSize * 1.2;
  const padding = 12;

  return (
    <Group
      ref={groupRef}
      id={textElement.id}
      x={textElement.x}
      y={textElement.y}
      rotation={textElement.rotation}
      draggable
      onClick={handleTap}
      onTap={handleTap}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      data-testid={`text-${textElement.id}`}
    >
      {/* Background rounded rectangle */}
      <Rect
        x={-padding}
        y={-padding}
        width={textWidth + padding * 2}
        height={textHeight + padding * 2}
        fill={backgroundColor}
        cornerRadius={8}
      />

      {/* Text */}
      <Text
        ref={textRef}
        text={textElement.text}
        fontSize={textElement.fontSize}
        fontFamily={textElement.fontFamily}
        fontStyle="bold"
        fill={foregroundColor}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}
