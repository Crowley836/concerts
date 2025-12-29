# Concert Archives - Project Context

## Current Status (December 29, 2025)

**Implementation Status:**

- Phases 0-9: ✅ Complete
- Phase 10: Artists Scene Enhancement (NEXT)

**Phase 8 Complete (Venue Scene Enhancements):**

- ✅ Fixed 9:30 Club parsing bug - Replaced `:` delimiters with `|` (pipe) in node IDs
- ✅ Resolved venue names with colons being incorrectly parsed in venue network
- ⚠️ Map interaction improvements deferred (enable zoom/pan without scroll hijacking)

**Phase 9 Complete (Venue-Level Geocoding):**

- ✅ Google Maps Geocoding API integration with cache-first approach
- ✅ 77 unique venues geocoded with accurate coordinates
- ✅ Cost optimization: $0.00 (within $200/month free tier)
- ✅ DC map adjustments: center [39.00, -77.03], zoom 10.5
- ✅ Popup z-index fix: z-index 9999 for top-most layer
- ✅ Removed jitter logic from Scene3Map.tsx (no longer needed)

**Recent Work (December 29):**

- ✅ Venue-level geocoding implementation
  - Created scripts/services/geocoding.ts with cache management
  - Integrated Google Maps Geocoding API
  - Geocoded 77 venues with venue-specific coordinates
  - Added dotenv for environment variable loading
- ✅ DC map positioning fixes (center, zoom, popup z-index)
- ✅ Phase 7 Complete: Geography Scene Enhancement
  - Tighter zoom levels, region filters, DC data quality fixes

**Architecture:**

- 5 full-viewport scenes (100vh each) with snap scrolling
- Scene order: Timeline → Venue Network → Map → Genres → Artists
- Design system: Playfair Display (serif titles) + Source Sans 3 (sans body)
- Scene backgrounds: LIGHT→DARK→DARK→LIGHT→DARK (target: LIGHT→DARK→DARK→LIGHT→LIGHT)
- D3.js visualizations with genre color palette

**Tech Stack:**

- Vite 6.0.7 + React 18.3.1 + TypeScript 5.7.2
- Tailwind CSS 4.1.18
- Framer Motion 11.18.2 (scroll animations)
- D3.js 7.9.0 (timeline, venue network, sunburst)
- React Leaflet 4.2.1 (map)
- Google Maps Geocoding API (venue coordinates)

**Data Source:**

- 175 concerts (1984-2026, 42 years)
- 77 unique venues (venue-specific coordinates via Google Maps API)
- Top venues: Irvine Meadows (14x), Pacific Amphitheatre (12x), 9:30 Club (11x)
- Top genres: New Wave (46), Punk (15), Alternative (14)
- Geographic: California ~65%, DC cluster, Boston, New Orleans, UK

**Last Commit:** ea67089 - "fix: Resolve 9:30 Club parsing bug and remove jitter logic"

---

## Primary Documentation

For comprehensive project details, see:

- **[docs/STATUS.md](../docs/STATUS.md)** - Current state & active work (SOURCE OF TRUTH)
- **[docs/planning.md](../docs/planning.md)** - Historical implementation plan (archive)
- **[README.md](../README.md)** - Project overview
- **[docs/api-setup.md](../docs/api-setup.md)** - API configuration (includes Google Maps setup)

**Design Framework:**

- **[docs/design/Morperhaus-Scene-Design-Guide.md](../docs/design/Morperhaus-Scene-Design-Guide.md)** - Scene flow, typography, spacing, animation
- **[docs/design/Morperhaus-Color-Specification-Guide.md](../docs/design/Morperhaus-Color-Specification-Guide.md)** - Genre colors, backgrounds, CSS variables

Always check STATUS.md for latest status before beginning work.
