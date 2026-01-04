# Setlist Liner Notes - Testing Cheat Sheet

Quick reference for testing the setlist.fm integration with concerts that are **most likely** to have setlists available.

---

## 🎯 Best Test Targets (Very High Probability)

These are major artists with recent shows - almost guaranteed to have setlists:

### 1. **The Cure** - Hollywood Bowl (May 24, 2023)
- **Why:** Major artist, iconic venue, recent tour
- **Expected:** Large setlist with multiple sets/encores
- **Location:** Hollywood, California

### 2. **David Byrne** - Dolby Theatre (Nov 20, 2025)
- **Why:** High-profile artist, prestigious venue
- **Expected:** Well-documented setlist
- **Location:** Hollywood, California
- **Note:** Future date, may not exist yet

### 3. **Devo** - YouTube Theatre (Nov 16, 2023)
- **Why:** Cult following with dedicated fans who document shows
- **Expected:** Complete setlist with classic hits
- **Location:** Inglewood, California

### 4. **The Black Keys** - MGM Music Hall (Aug 16, 2025)
- **Why:** Popular touring band, modern venue
- **Expected:** Full setlist documentation
- **Location:** Boston, Massachusetts
- **Note:** Future date, may not exist yet

### 5. **Crowded House** - The Wiltern (May 9, 2023)
- **Why:** Active touring, dedicated fanbase
- **Expected:** Complete setlist
- **Location:** Los Angeles, California

---

## 🎸 Good Test Targets (High Probability)

These should have setlists but may require fuzzy matching:

### 6. **Social Distortion** - The Belasco (Dec 5, 2024)
- **Why:** Punk band with active community
- **Expected:** Setlist likely available
- **Location:** Los Angeles, California

### 7. **Cold War Kids** - The Observatory (Nov 16, 2024)
- **Why:** Modern indie rock, active touring
- **Expected:** Recent tour, likely documented
- **Location:** Santa Ana, California

### 8. **Kasabian** - The Belasco (Nov 22, 2023)
- **Why:** UK band with international following
- **Expected:** Setlist available
- **Location:** Los Angeles, California

### 9. **Foals** - The Belasco (Jul 18, 2023)
- **Why:** Popular indie band, recent tour
- **Expected:** Setlist likely available
- **Location:** Los Angeles, California

### 10. **Streetlight Manifesto** - The Wiltern (Sep 23, 2023)
- **Why:** Ska punk with dedicated fans
- **Expected:** Complete setlist
- **Location:** Los Angeles, California

---

## 🎹 Moderate Probability

These might have setlists but could show "Not Found":

### 11. **Brian Setzer** - The Wiltern (Feb 27, 2024)
- **Location:** Los Angeles, California

### 12. **Howard Jones** - YouTube Theatre (Aug 20, 2024)
- **Location:** Inglewood, California

### 13. **The English Beat** - Pacific Amphitheatre (Jul 26, 2024)
- **Location:** Costa Mesa, California

### 14. **UB40** - Peacock Theater (Jul 21, 2023)
- **Location:** Los Angeles, California

---

## ⚠️ Edge Cases for Testing

### "Not Found" State
Try these older or obscure shows to test the "No setlist available" state:

- **Dr Sick** - 21st Amendment (Apr 12, 2023) - Small venue, likely no setlist
- **Klangphonics** - The Roxy (Mar 1, 2025) - Smaller artist

### Future Dates (Should show "Not Found")
- **Thompson Twins** - Pavilion Theatre (Sep 16, 2026) - Future date
- **David Byrne** - Dolby Theatre (Nov 20, 2025) - Future date
- **The Black Keys** - MGM Music Hall (Aug 16, 2025) - Future date

---

## 📝 Testing Workflow

### Quick Test Path
1. Open app → Navigate to **Artist Scene**
2. Click **The Cure** tile → Gatefold opens
3. Scroll to **"24 May 2023"** concert
4. Hover → Three-dot menu appears
5. Click three dots → Menu opens
6. Click **"View Setlist"** → Liner notes slides in
7. **Expected:** Large setlist with multiple sets, covers, encores

### Complete Test Path
1. **Test successful fetch:** The Cure → Should load setlist
2. **Test switching:** Click different concert while liner notes open
3. **Test not found:** Dr Sick → Should show "No setlist available"
4. **Test close methods:**
   - Click X button
   - Press ESC key
   - Click three-dot icon again (toggle)
5. **Test dimming:** Verify Spotify panel dims when liner notes open
6. **Test menu states:** Verify "Upcoming Shows" is disabled with "Soon" badge

### Visual Checks
- ✅ Liner notes slides in from right (400ms)
- ✅ Spotify panel dims to 0.3 opacity
- ✅ Three-dot icon appears on hover
- ✅ Menu has proper styling and hover states
- ✅ Loading skeleton shows while fetching
- ✅ Scrollbar is styled (dark theme)
- ✅ Close button changes color on hover

---

## 🐛 Known Behaviors

### Expected Behaviors
- **Caching:** Second click on same concert loads instantly (24-hour cache)
- **Fuzzy Matching:** Venue names may vary slightly between your data and setlist.fm
- **Coverage:** Expect ~40-60% hit rate across all concerts
- **Loading Time:** Initial fetch takes 500-1500ms depending on network

### What's Normal
- "No setlist available" for older shows (pre-2010)
- "No setlist available" for small venue shows
- Minor differences in venue names (fuzzy matching handles this)
- Setlists may be incomplete (community-contributed)

---

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:5173

# Check API key is configured
grep VITE_SETLISTFM_API_KEY .env
```

---

## 🔍 Debugging Tips

### Check Console for API Calls
Open DevTools → Console tab → Look for:
- `Fetching setlist...` logs (if you add console.logs)
- Network tab → Filter by "setlist.fm" to see API calls
- Check for 401 (bad API key) or 429 (rate limited)

### Common Issues
1. **All shows say "No setlist available"**
   - Check API key is correct in `.env`
   - Verify `VITE_SETLISTFM_API_KEY` is set
   - Restart dev server after changing `.env`

2. **Shows fail to load**
   - Check network connection
   - Verify API key is valid
   - Check browser console for errors

3. **Menu doesn't appear**
   - Hover over concert row (not just text)
   - Check CSS is loaded correctly
   - Verify TypeScript compiled without errors

---

## 📊 Expected Results Summary

| Artist | Venue | Date | Expected Result |
|--------|-------|------|----------------|
| The Cure | Hollywood Bowl | May 24, 2023 | ✅ Large setlist with encores |
| Devo | YouTube Theatre | Nov 16, 2023 | ✅ Complete setlist |
| Crowded House | The Wiltern | May 9, 2023 | ✅ Full setlist |
| Social Distortion | The Belasco | Dec 5, 2024 | ✅ Likely available |
| Dr Sick | 21st Amendment | Apr 12, 2023 | ❌ Not found (small show) |
| Thompson Twins | Pavilion Theatre | Sep 16, 2026 | ❌ Not found (future) |

---

## 🎉 Success Criteria

The feature is working correctly if you can:
- [x] Open artist gatefold
- [x] See three-dot menu on concert hover
- [x] Click menu and see "View Setlist" option
- [x] Liner notes slides in smoothly from right
- [x] Spotify panel dims while liner notes open
- [x] See loading skeleton while fetching
- [x] See complete setlist for The Cure (or similar)
- [x] See "No setlist available" for obscure shows
- [x] Close liner notes with X, ESC, or menu toggle
- [x] Switch between concerts smoothly
- [x] Cache works (instant load on second click)

---

## 📚 Additional Resources

- **setlist.fm Website:** https://www.setlist.fm
- **Search manually:** https://www.setlist.fm/search?query={artist}+{date}
- **API Docs:** https://api.setlist.fm/docs/1.0/index.html
- **Spec:** docs/specs/future/setlist-liner-notes.md
