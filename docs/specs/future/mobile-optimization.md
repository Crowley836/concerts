# Mobile Optimization Spec

**Status:** Deferred to v1.1
**Priority:** High
**Dependencies:** None

## Overview

Mobile-specific optimizations deferred from v1.0 release.

## Deferred Items

### Artist Scene - Mobile Bottom Sheet
- Replace gatefold animation with slide-up bottom sheet on viewports <768px
- 70vh initial height, draggable to 90vh
- Swipe down or tap backdrop to close
- Concert history + Spotify panels stacked vertically
- Reference: [artist-scene.md](../implemented/artist-scene.md) (Mobile Design section)

### Map Scene - Touch Refinements
- Touch interactions enabled in code (touchZoom, dragging)
- Needs testing on actual iOS and Android devices
- May need pinch gesture indicators
- Hint prominence adjustments for no-hover state

### General Mobile Testing
- Test all 5 scenes on iOS Safari and Android Chrome
- Verify snap scrolling behavior
- Ensure touch targets meet 44px minimum
- Test landscape orientation on phones

### iPad Support (Tablet Optimization)
- **iPad Portrait (768x1024)**: Optimize layouts for tablet-sized vertical viewing
  - Timeline Scene: Ensure comfortable timeline navigation with larger touch targets
  - Genre Scene: Sunburst chart scaling and touch interaction refinements
  - Artist Scene: Take advantage of larger screen real estate for gatefold layouts
  - Map Scene: Enhanced pinch-zoom and pan interactions for larger touch surface
- **iPad Horizontal (1024x768)**: Adapt layouts for landscape tablet viewing
  - Timeline Scene: Horizontal space utilization for decade navigation
  - Venue Scene: Network graph expansion and improved node interactions
  - Artist Scene: Side-by-side content layouts when space permits
  - Filter Bar: Expanded filter options presentation
- **Responsive Breakpoints**: Add iPad-specific breakpoints (768px-1024px range)
- **Touch Interactions**: Optimize for larger touch surfaces and multi-touch gestures
- **Safari iPad Quirks**: Address any iPad Safari-specific behavior differences

## Success Criteria

1. All scenes functional on mobile devices and tablets
2. Touch interactions feel native across phone and iPad form factors
3. No horizontal scroll or overflow issues
4. Readable text without zooming on all device sizes
5. Performant animations (no jank)
6. iPad portrait and landscape orientations fully supported
7. Responsive layouts adapt appropriately to tablet screen sizes

## References

- [Scene Design Guide](../../design/scene-design-guide.md)
- [Map Interaction Spec](../implemented/map-interaction.md)
