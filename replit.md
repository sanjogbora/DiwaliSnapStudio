# Diwali Photo Booth

A mobile-first web application for creating beautiful Diwali greetings with custom photos, festive stickers, frames, and personalized messages.

## Overview

This is a progressive web app (PWA) that allows users to:
- Capture photos with their camera or upload existing images
- Add festive stickers and decorations
- Apply custom frames (landscape/portrait auto-detection)
- Add personalized "From:" text with customizable backgrounds (red/yellow)
- Export and share greetings via WhatsApp and other platforms

## Tech Stack

### Frontend
- **React** with TypeScript
- **Konva.js** & React Konva for canvas-based image manipulation
- **Tailwind CSS** for styling with Diwali-themed design tokens
- **Wouter** for routing
- **TanStack Query** for data fetching (if needed)
- **Web Share API** for native mobile sharing

### Backend
- **Express.js** with TypeScript
- **Multer** for optional image uploads
- In-memory storage (app works primarily client-side)

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── photo-booth/
│   │   │       ├── canvas-editor.tsx       # Main canvas with Konva
│   │   │       ├── sticker-element.tsx     # Draggable sticker component
│   │   │       ├── text-element.tsx        # Custom text with background
│   │   │       ├── sticker-drawer.tsx      # Sticker selection drawer
│   │   │       └── text-editor-modal.tsx   # Text customization modal
│   │   ├── pages/
│   │   │   └── photo-booth.tsx             # Main application page
│   │   └── App.tsx
│   └── index.html
├── public/
│   ├── stickers/                           # User adds sticker PNGs here
│   ├── frames/                             # User adds frame PNGs here
│   │   ├── landscape.png                   # Frame for horizontal photos
│   │   └── portrait.png                    # Frame for vertical photos
│   └── manifest.json                       # PWA manifest
├── server/
│   ├── routes.ts                           # API routes
│   └── storage.ts                          # Storage interface
└── shared/
    └── schema.ts                           # TypeScript schemas
```

## Features Implementation

### Photo Capture/Upload
- Camera capture using `<input capture="environment">`
- File upload with drag-and-drop support
- Automatic orientation detection (landscape/portrait)

### Canvas Editing
- Touch-optimized drag, resize, and rotate gestures
- Pinch-to-zoom on elements
- Double-tap to delete elements
- Transform handles for precise control

### Stickers
- Sticker library drawer with grid layout
- Tap to add sticker at center
- Drag to reposition
- Pinch/handles to resize
- Rotate gesture support
- Double-tap to delete

### Text Elements
- Custom text input (no default prefix)
- Color picker (red/yellow backgrounds)
- Rounded rectangle background with proper contrast
- Inter Bold font family
- Drag, resize, rotate capabilities

### Export & Share
- Export as PNG with 2x pixel ratio for quality
- Native Web Share API integration
- Fallback to download for unsupported devices
- Share to WhatsApp, social media, etc.

### Frames
- Auto-applied based on photo orientation (landscape.png / portrait.png)
- Dynamically resizes to match photo dimensions
- Decorative Diwali-themed borders overlay on top of photo

## Mobile Optimizations

1. **Touch Gestures**: All interactions optimized for touch (no mouse required)
2. **Responsive Canvas**: Auto-sizes to fit mobile viewport
3. **Safe Areas**: Respects iOS notch and gesture areas
4. **PWA Support**: Installable on home screen
5. **Performance**: Canvas-based rendering, no DOM manipulation for elements
6. **Lightweight**: Minimal dependencies, fast loading

## Design System

### Colors
- **Primary (Saffron)**: `hsl(25 85% 55%)` - Main brand color
- **Festival Orange**: `hsl(15 90% 60%)` - Accent color
- **Gold**: `hsl(45 75% 50%)` - Highlights
- **Text Backgrounds**: Red `hsl(0 75% 45%)` and Yellow `hsl(45 90% 55%)`

### Typography
- **Font Family**: Inter (loaded from Google Fonts)
- **Text Elements**: Inter Bold for "From:" labels
- **Sizes**: Responsive with mobile-first approach

### Spacing
- Mobile-first with touch-friendly spacing
- Large tap targets (min 44x44px)
- Generous padding for comfort

## Current Assets

### Stickers (9 Total)
All stickers are located in `public/stickers/` and configured in `client/src/pages/photo-booth.tsx`:

1. **Diya** - Traditional oil lamp (`diya.png`)
2. **Rangoli** - Colorful mandala pattern (`rangoli.png`)
3. **Lantern** - Festive hanging lamp (`lantern.png`)
4. **Sparkler** - Firework sparkler (`sparkler.png`)
5. **Firework** - Colorful cone firework (`firework.png`)
6. **Firecracker** - Traditional firecracker (`firecracker.png`)
7. **Jalebi** - Sweet spiral dessert (`jalebi.png`)
8. **Samosa** - Delicious snack (`samosa.png`)
9. **Sweet** - Festival dessert (`sweet.png`)

To add more stickers:
1. Add PNG files to `public/stickers/`
2. Update `stickerLibrary` array in `client/src/pages/photo-booth.tsx`
3. Ensure file permissions are 644 (readable by web server)

### Frames
1. **Landscape Frame** - `public/frames/landscape.png` for horizontal photos
2. **Portrait Frame** - `public/frames/portrait.png` for vertical photos
3. Frames automatically resize to match photo dimensions
4. Frames use decorative Diwali-themed borders with transparent centers

## Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Future Enhancements
- Undo/redo functionality
- Layer management (bring forward/send backward)
- Photo filters and adjustments
- Gallery to save multiple creations
- More text customization (fonts, colors, sizes)
- Background patterns and effects
- Social media templates (Instagram Story, Facebook Post sizes)

## Recent Changes
- 2024-10-17: Initial implementation with canvas editor, sticker system, text customization, and mobile sharing
- 2024-10-17: Added 9 Diwali stickers (diya, rangoli, lantern, sparkler, firework, firecracker, jalebi, samosa, sweet)
- 2024-10-17: Added landscape and portrait frames with dynamic resizing
- 2024-10-17: Fixed sticker loading issue (file permissions)
- 2024-10-17: Improved toolbar UX - changed to grid layout, all buttons visible without scrolling
- 2024-10-17: Changed "Add Text" to "From" button, removed default "From:" prefix in text input
