# Test Scripts

Puppeteer-based automated testing scripts for visual validation of the Artist Scene flip card interactions.

## Prerequisites

```bash
npm install puppeteer
```

## Scripts

### `test-different-positions.mjs`

**Purpose:** Comprehensive test of flip card behavior at different screen positions.

**What it tests:**
- Top-left cards (expand right and down)
- Top-right cards (expand left and down)
- Middle-left cards (expand right)
- Middle-right cards (expand left)

**Usage:**
```bash
node test/test-different-positions.mjs
```

**Output:**
- `/tmp/flip-top-left.png`
- `/tmp/flip-top-right.png`
- `/tmp/flip-middle-left.png`
- `/tmp/flip-middle-right.png`

**What to verify:**
- Cards are exactly 2x2 grid size (400px × 400px)
- Cards expand INTO the viewport (toward center), not away
- Text is readable and properly sized
- No cards are clipped off screen edges

---

### `test-simple.mjs`

**Purpose:** Basic page load and screenshot test.

**Usage:**
```bash
node test/test-simple.mjs
```

**Output:**
- `/tmp/page-initial.png` - Initial page load
- `/tmp/page-scrolled.png` - After scrolling down

---

### `test-artist-scene.mjs`

**Purpose:** Navigate to artist scene and test card flips.

**Usage:**
```bash
node test/test-artist-scene.mjs
```

**Output:**
- `/tmp/artist-scene.png` - Artist scene view
- `/tmp/artist-flip-left.png` - Left card flipped
- `/tmp/artist-flip-right.png` - Right card flipped

---

### `test-artist-flip.mjs`

**Purpose:** Original test script with data-artist-id selector (may need updating).

**Status:** Legacy - prefer `test-different-positions.mjs`

---

## Development Server

All tests require the development server to be running:

```bash
npm run dev
```

Server typically runs on `http://localhost:5179` (or next available port).

---

## Validation Checklist

When reviewing screenshots, verify:

1. **Size**: Flipped cards = 2x2 grid squares (400px × 400px)
2. **Direction**: Cards expand INTO viewport (toward screen center)
3. **Typography**:
   - Artist name: ~28px (text-sm scaled 2x)
   - "Seen X times": ~20px (text-[10px] scaled 2x)
   - Concert entries: ~18px (text-[9px] scaled 2x)
4. **Position**: No clipping at screen edges
5. **Transform origin**:
   - Left cards: anchor top-right, grow left
   - Right cards: anchor top-left, grow right

---

## Notes

- Screenshots saved to `/tmp/` directory
- Puppeteer runs in non-headless mode for easier debugging
- Each test includes 800-1000ms delays for animations to complete
- Browser viewport: 1920×1080
