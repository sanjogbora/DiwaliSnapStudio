# Diwali Photo Booth - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based Design inspired by Instagram Stories/Canva mobile editing interfaces with festive Diwali aesthetics.

**Key References:**
- Instagram Stories editor: Touch-optimized editing controls, sticker management
- Canva mobile: Layer management, export functionality
- Festive design: Traditional Diwali color palettes with modern UI patterns

**Design Principles:**
1. Mobile-first touch interactions with generous tap targets
2. Festive yet clean interface that doesn't overwhelm the photo editing experience
3. Immediate visual feedback for all interactions
4. Minimal learning curve - intuitive gestures and controls

## Color Palette

**Primary Colors (Diwali Theme):**
- Deep Saffron: 25 85% 55% (primary brand color, CTAs)
- Festival Orange: 15 90% 60% (accents, active states)
- Rich Gold: 45 75% 50% (highlights, premium touches)

**Background Colors:**
- Dark mode primary: 240 10% 12% (main app background)
- Dark mode secondary: 240 8% 18% (toolbar, panels)
- Dark mode elevated: 240 6% 22% (modals, overlays)

**Text Background Options (for "From:" label):**
- Red variant: 0 75% 45% with white text
- Yellow variant: 45 90% 55% with dark text (900)
- Ensure contrast ratio minimum 4.5:1

**Functional Colors:**
- Success: 145 70% 45%
- Error: 0 70% 50%
- White text on dark: white with 95% opacity
- Muted text: white with 60% opacity

## Typography

**Font Families:**
- Primary UI: Inter (via Google Fonts CDN)
- Custom Text Labels: Inter Bold (for "From:" text as specified)
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Hero/Primary CTA: text-2xl (24px) font-bold
- Section headers: text-lg (18px) font-semibold
- Body/Controls: text-base (16px) font-medium
- Secondary text: text-sm (14px) font-normal
- "From:" text on photo: text-xl (20px) font-bold

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Micro spacing: p-2, gap-2 (8px)
- Standard spacing: p-4, gap-4 (16px)
- Section spacing: p-6, gap-6 (24px)
- Major sections: p-8 (32px)

**Canvas/Photo Area:**
- Full-width mobile viewport minus bottom toolbar (approx 60-80px)
- Centered with max-w-full aspect-ratio preserved
- Safe area padding: p-4 on all sides to prevent edge-cut on phones

**Bottom Toolbar:**
- Fixed position at bottom
- Height: h-20 (80px) minimum for easy thumb reach
- Background: backdrop-blur-xl with bg-gray-900/90
- Horizontal scroll for tool options with gap-4

## Component Library

### Core Editing Components

**Photo Canvas:**
- Canvas element with touch event handlers
- Pinch-to-zoom, drag stickers, rotate gestures
- Layered rendering: Photo → Frame → Stickers → Text
- Real-time visual feedback with transform animations

**Sticker Toolbar:**
- Horizontal scrollable strip with sticker thumbnails
- Size: w-16 h-16 rounded-xl with border-2
- Active state: border-orange-500 with shadow-lg
- Add via tap, instant placement at center

**Text Input Panel (From: Label):**
- Modal/sheet that slides up from bottom
- Text input with preview of rounded rectangle
- Color picker: Red/Yellow toggle buttons (w-12 h-12 rounded-full)
- Live preview shows text on canvas as typed
- Apply button: Full-width bg-saffron with text-white

**Frame Selector:**
- Auto-detects orientation (landscape/portrait)
- Subtle indicator showing applied frame
- Optional: Toggle to preview with/without frame

### Action Buttons

**Primary Actions (Bottom toolbar):**
- Camera/Upload: Icon button with bg-saffron rounded-xl p-4
- Add Sticker: Icon button, opens sticker drawer
- Add Text: Icon button, opens text panel
- Export: Prominent button w-full bg-gradient-to-r from-orange-500 to-saffron-600
- Share: Secondary button with outline variant

**Control Buttons (On selected sticker/text):**
- Delete: Floating × button (bg-red-500 rounded-full w-8 h-8)
- Resize handles: Corner dots (bg-white w-4 h-4 rounded-full)
- Rotate handle: Curved arrow icon at top

### Modals & Overlays

**Sticker Library Drawer:**
- Slides up from bottom, 70% viewport height
- Grid layout: grid-cols-4 gap-2
- Each sticker: p-2 bg-gray-800 rounded-lg hover:bg-gray-700
- Close via swipe down or × button

**Share Sheet:**
- Native browser share API integration
- Fallback: Modal with download + copy link options
- Success toast: "Ready to share!" with checkmark

**Loading States:**
- Photo upload: Spinner with "Loading photo..."
- Export: Progress bar with "Preparing image..."
- Share: Brief pulse animation

## Touch Interactions

**Gestures:**
- Single tap: Select sticker/text element
- Double tap: Quick delete selected element
- Drag: Move stickers/text freely
- Pinch: Resize selected element (minimum 50px, maximum canvas width)
- Two-finger rotate: Rotate element
- Long press: Show context menu (delete, duplicate, layer order)

**Visual Feedback:**
- Active element: border-4 border-white shadow-2xl
- Dragging: opacity-90 with scale-105
- All interactions: transition-transform duration-150

## Festive Design Touches

**Decorative Elements:**
- Diya (lamp) icon in header
- Sparkle particles on successful export (brief animation)
- Gradient overlays with Diwali colors on buttons
- Rangoli-inspired pattern as subtle background texture (10% opacity)

**Micro-interactions:**
- Confetti burst on share action (celebrate sharing)
- Gentle pulse on primary CTA
- Smooth slide-in animations for panels (300ms ease-out)
- Haptic feedback on supported devices (via Vibration API)

## Performance Optimizations

- Canvas-based rendering (no DOM manipulation for stickers)
- Lazy load sticker images with placeholder
- Debounce resize/rotate operations (100ms)
- Web Workers for image export processing
- Compress exported images: JPEG 85% quality
- Maximum export resolution: 1080px on longest side

## Accessibility

- All buttons minimum 44×44px tap target
- Focus indicators: ring-4 ring-saffron-500
- ARIA labels for all icon buttons
- Contrast ratio 4.5:1 minimum for all text
- Support for reduced motion preference (disable decorative animations)

## Mobile-Specific Considerations

- Prevent zoom on double-tap (viewport meta tag)
- Use `touch-action: none` on canvas for custom gestures
- iOS safe area insets respected (env(safe-area-inset-bottom))
- PWA manifest for "Add to Home Screen" capability
- Orientation lock to portrait for consistency (optional)