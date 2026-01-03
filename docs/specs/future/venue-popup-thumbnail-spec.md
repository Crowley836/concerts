# Venue Popup Thumbnail — Implementation Spec

## Overview

Add venue photos to the Geography scene map popups. When a user clicks a venue marker, the popup displays a thumbnail image above the existing venue name, location, and concert count.

**Component:** `src/components/scenes/Scene3Map.tsx`  
**Data Source:** `public/data/venues-metadata.json`

---

## Visual Design

### Current Popup
```
┌─────────────────────────────┐
│ The Coach House          ✕  │
│ San Juan Capistrano, CA     │
│ 10 concerts                 │
└──────────────┬──────────────┘
               ▼
```

### New Popup (with image)
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │    [Venue Photo]        │ │  ← 120px height, full width
│ │    object-fit: cover    │ │
│ │                         │ │
│ └─────────────────────────┘ │
│ The Coach House          ✕  │
│ San Juan Capistrano, CA     │
│ 10 concerts                 │
└──────────────┬──────────────┘
               ▼
```

### New Popup (no image available)
```
┌─────────────────────────────┐
│ The Coach House          ✕  │  ← Same as current, no image section
│ San Juan Capistrano, CA     │
│ 10 concerts                 │
└──────────────┬──────────────┘
               ▼
```

### New Popup (image loading)
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░ │ │  ← Skeleton shimmer
│ │ ░░░░░░░░░░░░░░░░░░░░░░░ │ │     animate-pulse bg-gray-700
│ │ ░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ └─────────────────────────┘ │
│ The Coach House          ✕  │
│ San Juan Capistrano, CA     │
│ 10 concerts                 │
└──────────────┬──────────────┘
               ▼
```

---

## Popup Specifications

| Property | Value |
|----------|-------|
| **Popup width** | 240px (current, unchanged) |
| **Image container height** | 120px fixed |
| **Image fit** | `object-fit: cover` (crop to fill, maintain aspect ratio) |
| **Image position** | `object-position: center` |
| **Border radius** | `rounded-t-lg` on image container (matches popup corners) |
| **Skeleton color** | `bg-gray-700` with `animate-pulse` |
| **Transition** | Fade in on load: `transition-opacity duration-300` |

---

## Data Flow

### Source File
`public/data/venues-metadata.json`

### Data Shape
```typescript
interface VenueMetadata {
  name: string
  normalizedName: string
  cityState: string
  photoUrls?: {
    thumbnail: string   // ← Use this (400px height from API)
    medium: string
    large: string
  }
  // ... other fields
}
```

### Lookup Strategy

The map currently stores venue data per marker. To get the photo URL:

1. **Build a lookup map** at component mount from `venues-metadata.json`
2. **Key format:** `normalizedName` (e.g., `"thecoachhouse"`)
3. **Normalize venue name** using the same logic as the enrichment script:
   ```typescript
   const normalizeVenueName = (name: string): string => {
     return name
       .toLowerCase()
       .replace(/[^a-z0-9]/g, '')
   }
   ```

### Data Loading

```typescript
// In Scene3Map.tsx or a new hook

const [venuesMetadata, setVenuesMetadata] = useState<Record<string, VenueMetadata>>({})

useEffect(() => {
  fetch('/data/venues-metadata.json')
    .then(res => res.json())
    .then(data => setVenuesMetadata(data))
    .catch(err => console.warn('Failed to load venue metadata:', err))
}, [])

// Lookup helper
const getVenueThumbnail = (venueName: string): string | null => {
  const normalized = normalizeVenueName(venueName)
  return venuesMetadata[normalized]?.photoUrls?.thumbnail ?? null
}
```

---

## Component Structure

### Option A: Inline in Popup Content (Simpler)

Update the popup content generation in `Scene3Map.tsx`:

```tsx
const popupContent = (venue: VenueMarkerData) => {
  const thumbnailUrl = getVenueThumbnail(venue.name)
  
  return `
    <div class="venue-popup">
      ${thumbnailUrl ? `
        <div class="venue-popup-image-container">
          <img 
            src="${thumbnailUrl}" 
            alt="${venue.name}"
            class="venue-popup-image"
            loading="lazy"
            onload="this.parentElement.classList.add('loaded')"
            onerror="this.parentElement.style.display='none'"
          />
          <div class="venue-popup-skeleton"></div>
        </div>
      ` : ''}
      <div class="venue-popup-content">
        <div class="venue-popup-name">${venue.name}</div>
        <div class="venue-popup-location">${venue.cityState}</div>
        <div class="venue-popup-count">${venue.concertCount} concert${venue.concertCount !== 1 ? 's' : ''}</div>
      </div>
    </div>
  `
}
```

### Option B: React Portal (More Complex)

If Leaflet popup rendering via React is already in use, extend that pattern. Check current implementation first.

---

## CSS Additions

Add to the component's styles or global CSS (depending on current pattern):

```css
/* Venue Popup Styles */
.venue-popup {
  min-width: 200px;
  max-width: 240px;
}

.venue-popup-image-container {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background-color: #374151; /* gray-700 */
}

.venue-popup-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.venue-popup-image-container.loaded .venue-popup-image {
  opacity: 1;
}

.venue-popup-image-container.loaded .venue-popup-skeleton {
  display: none;
}

.venue-popup-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #374151 25%,
    #4b5563 50%,
    #374151 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.venue-popup-content {
  padding: 12px;
}

.venue-popup-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 2px;
}

.venue-popup-location {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.venue-popup-count {
  font-size: 12px;
  color: #6b7280;
}
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `venues-metadata.json` fails to load | Log warning, popups render without images |
| Venue not found in metadata | Popup renders without image section |
| `photoUrls` is null/undefined | Popup renders without image section |
| Image URL fails to load (404, network) | Hide image container via `onerror` handler |
| Image loads slowly | Show skeleton until `onload` fires |

---

## Implementation Checklist

### Phase 1: Data Loading
- [ ] Add `useState` for venues metadata in `Scene3Map.tsx`
- [ ] Add `useEffect` to fetch `venues-metadata.json` on mount
- [ ] Create `normalizeVenueName()` utility function
- [ ] Create `getVenueThumbnail()` lookup helper

### Phase 2: Popup Update
- [ ] Locate current popup content generation code
- [ ] Add conditional image container to popup HTML
- [ ] Add `onload` handler to trigger loaded state
- [ ] Add `onerror` handler to hide broken images

### Phase 3: Styling
- [ ] Add CSS for `.venue-popup-image-container`
- [ ] Add CSS for `.venue-popup-image` with object-fit
- [ ] Add CSS for `.venue-popup-skeleton` with shimmer animation
- [ ] Add loaded state transitions
- [ ] Verify popup close button (✕) still visible and functional

### Phase 4: Testing
- [ ] Test venue with Google Places photo (e.g., Hollywood Bowl)
- [ ] Test venue with manual photo (e.g., Irvine Meadows)
- [ ] Test venue without photo (if any exist)
- [ ] Test slow network (throttle in DevTools) — verify skeleton shows
- [ ] Test broken image URL — verify graceful fallback
- [ ] Test popup positioning — ensure image doesn't cause overflow issues
- [ ] Test on California and DC Area filters

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/scenes/Scene3Map.tsx` | Add metadata fetch, update popup content |
| `src/index.css` OR component styles | Add popup image CSS |

---

## Future Enhancements (Out of Scope)

- **Cross-navigation:** Click thumbnail to navigate to Venues scene (see `venue-cross-navigation.md` spec)
- **Image gallery:** Multiple photos on hover/click
- **Attribution:** Display Google Maps photo credits (required by ToS for production)

---

## Reference: Existing Popup Pattern

Check `Scene3Map.tsx` for how popups are currently created. The implementation should follow the existing pattern for:
- Leaflet popup instantiation
- Content string generation vs React rendering
- Popup options (offset, className, maxWidth)
- Close button handling
