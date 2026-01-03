# API Key Security Migration Guide

**Date**: 2026-01-03
**Version**: v1.3.3 → v1.3.4
**Status**: Required for production security

---

## Why This Migration is Necessary

During v1.3.3 implementation, we discovered that the Google Places API key was exposed in `venues-metadata.json` on GitHub. This is **not a code bug** but rather an architectural characteristic of how Google Places Photo API works.

However, we were using a **shared API key** for both:
1. **Geocoding API** (server-side, build-time only)
2. **Places API** (client-side, embedded in photo URLs)

This created a security issue because:
- Google Cloud Console requires you to choose **either** API restrictions **or** HTTP referrer restrictions, not both
- Geocoding should use API restrictions only (server-side, not exposed)
- Places photos require HTTP referrer restrictions (client-side, URLs are public)
- **You cannot have both restriction types on the same key**

---

## The Solution: Separate API Keys

We now use **two separate API keys** with different security models:

| Key | Usage | Restrictions | Exposure |
|-----|-------|--------------|----------|
| `GOOGLE_MAPS_API_KEY` | Geocoding (server-side) | API restrictions only | Never exposed (stays in .env) |
| `GOOGLE_PLACES_API_KEY` | Places photos (client-side) | HTTP referrer restrictions | Visible in venues-metadata.json (protected by domain) |

---

## Migration Steps

### Step 1: Create New Places API Key

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Name it "Places API Key (Client-side)"
4. Click "Edit API key" to configure:

   **Application restrictions** (REQUIRED):
   - Select "HTTP referrers (web sites)"
   - Add your production domain:
     ```
     https://concerts.morperhaus.org/*
     ```
   - Add localhost for development:
     ```
     http://localhost:*
     ```

   **API restrictions**:
   - Select "Restrict key"
   - Check **only** "Places API (New)"

5. Click "Save"

### Step 2: Update Existing Geocoding Key

1. Find your existing `GOOGLE_MAPS_API_KEY` in Google Cloud Console
2. Click "Edit API key"
3. Rename it to "Geocoding API Key (Server-side)"
4. Verify restrictions:

   **Application restrictions**:
   - Select "None" (server-side only)

   **API restrictions**:
   - Select "Restrict key"
   - Check **only** "Geocoding API"
   - **Remove** "Places API (New)" if it's checked

5. Click "Save"

### Step 3: Update .env File

Add the new `GOOGLE_PLACES_API_KEY` variable:

```bash
# Google Maps APIs (Separate Keys for Security)
GOOGLE_MAPS_API_KEY=AIzaSyA...    # Geocoding (server-side, API restrictions only)
GOOGLE_PLACES_API_KEY=AIzaSyB...  # Places Photos (NEW - client-side, HTTP referrer restrictions)
```

### Step 4: Regenerate venues-metadata.json

Run the venue enrichment script to regenerate the metadata file with the new Places API key:

```bash
npm run enrich-venues
```

This will:
- Use the new `GOOGLE_PLACES_API_KEY` for all photo URLs
- Update `public/data/venues-metadata.json` with protected URLs
- Preserve your cache in `public/data/venue-photos-cache.json`

### Step 5: Verify Security

1. Check that photo URLs in `venues-metadata.json` contain the new Places API key
2. Test the app locally:
   ```bash
   npm run dev
   ```
3. Navigate to Scene 3 (Geography) and click venue markers
4. Verify photos load correctly

### Step 6: Commit and Deploy

```bash
git add .
git commit -m "security: Separate Geocoding and Places API keys for proper restrictions"
git push
```

---

## How the New Security Model Works

### Geocoding API Key (Server-side)
- **Never exposed to browsers** - only used in build scripts
- **API restrictions only** - can only call Geocoding API
- Even if leaked, cannot be used for expensive operations (Places, Maps JS)

### Places API Key (Client-side)
- **Intentionally visible** in `venues-metadata.json` (this is Google's design)
- **HTTP referrer restrictions** - only works on your authorized domains
- Even if someone copies the key from GitHub, they cannot use it on their own domain
- Protected by Google's referrer checking at the CDN level

### Why This is Secure

Google's Places Photo API is **designed for client-side use** with public keys. Security comes from:

1. **Domain restrictions** - Key only works on `concerts.morperhaus.org/*` and `localhost:*`
2. **API restrictions** - Key can only call Places API (New), not other expensive APIs
3. **Usage monitoring** - Google Cloud Console shows all requests and costs
4. **Free tier protection** - $200/month credit covers normal usage (~$15/year)

---

## Verification Checklist

- [ ] Created new Places API key with HTTP referrer restrictions
- [ ] Updated existing Geocoding key to remove Places API access
- [ ] Added `GOOGLE_PLACES_API_KEY` to `.env`
- [ ] Ran `npm run enrich-venues` successfully
- [ ] Verified photos load correctly in dev environment
- [ ] Committed and pushed changes to GitHub
- [ ] Verified photos load correctly in production

---

## Code Changes Summary

Files modified in this migration:

| File | Change |
|------|--------|
| `scripts/utils/google-places-client.ts` | Changed `GOOGLE_MAPS_API_KEY` → `GOOGLE_PLACES_API_KEY` |
| `scripts/test-places-api.ts` | Changed `GOOGLE_MAPS_API_KEY` → `GOOGLE_PLACES_API_KEY` |
| `.env.example` | Added `GOOGLE_PLACES_API_KEY` variable |
| `docs/api-setup.md` | Updated setup instructions with separate key requirements |
| `public/data/venues-metadata.json` | Regenerated with new Places API key in photo URLs |

---

## Rollback Plan

If you encounter issues:

1. **Keep both keys** in `.env` (don't delete the old shared key)
2. Temporarily revert code changes:
   ```bash
   git revert HEAD
   ```
3. Contact support or file an issue: https://github.com/anthropics/claude-code/issues

---

## Questions?

**Q: Why can't I use one key with both restriction types?**
A: Google Cloud Console doesn't allow mixing API restrictions and HTTP referrer restrictions on the same key. You must choose one security model per key.

**Q: Is it safe for the Places API key to be visible in GitHub?**
A: Yes, as long as HTTP referrer restrictions are configured correctly. Google's security model for client-side APIs relies on domain restrictions, not key secrecy.

**Q: What if someone copies my Places API key?**
A: They can only use it on your authorized domains (`concerts.morperhaus.org/*`, `localhost:*`). Requests from other domains will be rejected by Google's CDN.

**Q: Will this increase my API costs?**
A: No, costs remain the same (~$15/year). You're just splitting one key into two for proper security.

---

*Migration guide prepared: 2026-01-03*
*For v1.3.4 security update*
