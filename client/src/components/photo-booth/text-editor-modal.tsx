import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (text: string, backgroundColor: "red" | "yellow") => void;
}

export function TextEditorModal({
  isOpen,
  onClose,
  onAddText,
}: TextEditorModalProps) {
  const [text, setText] = useState("From: ");
  const [backgroundColor, setBackgroundColor] = useState<"red" | "yellow">("red");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (text.trim()) {
      onAddText(text.trim(), backgroundColor);
      setText("From: ");
      setBackgroundColor("red");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        data-testid="text-editor-backdrop"
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-xl shadow-2xl max-w-md mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Custom Text</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-text-editor"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="text-input" className="text-sm font-medium">
              Your Message
            </Label>
            <Input
              id="text-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="From: Your Family"
              className="text-base"
              autoFocus
              data-testid="input-text"
            />
            <p className="text-xs text-muted-foreground">
              Add your name or family name to personalize your greeting
            </p>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background Color</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setBackgroundColor("red")}
                className={`flex-1 h-20 rounded-lg border-2 transition-all ${
                  backgroundColor === "red"
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border"
                }`}
                style={{ backgroundColor: "hsl(0, 75%, 45%)" }}
                data-testid="color-option-red"
              >
                <span className="sr-only">Red background</span>
              </button>

              <button
                onClick={() => setBackgroundColor("yellow")}
                className={`flex-1 h-20 rounded-lg border-2 transition-all ${
                  backgroundColor === "yellow"
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border"
                }`}
                style={{ backgroundColor: "hsl(45, 90%, 55%)" }}
                data-testid="color-option-yellow"
              >
                <span className="sr-only">Yellow background</span>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
              <div
                className="px-4 py-2 rounded-lg font-bold text-xl"
                style={{
                  backgroundColor:
                    backgroundColor === "red"
                      ? "hsl(0, 75%, 45%)"
                      : "hsl(45, 90%, 55%)",
                  color: backgroundColor === "red" ? "white" : "hsl(240, 10%, 12%)",
                }}
              >
                {text || "From: Your Family"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-text"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="flex-1"
              disabled={!text.trim()}
              data-testid="button-add-text-confirm"
            >
              Add Text
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
