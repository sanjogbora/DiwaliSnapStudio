# Stickers Directory

Add your Diwali sticker PNG images here!

## Instructions:
1. Add your sticker PNG files to this directory
2. Include your "Happy Diwali" sticker
3. Add any other festive decorations (diyas, rangoli, fireworks, etc.)

## Format:
- File format: PNG with transparent background recommended
- File naming: Use descriptive names like `happy-diwali.png`, `diya.png`, `rangoli.png`
- Size: Any size works, but 200-500px works best for performance

Once you add stickers here, update the `stickerLibrary` array in `client/src/pages/photo-booth.tsx` to include them:

```typescript
const stickerLibrary: StickerLibraryItem[] = [
  {
    id: "happy-diwali",
    name: "Happy Diwali",
    imageUrl: "/stickers/happy-diwali.png",
  },
  {
    id: "diya",
    name: "Diya",
    imageUrl: "/stickers/diya.png",
  },
  // Add more stickers here...
];
```
