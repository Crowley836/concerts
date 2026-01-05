# Data Directory

This directory contains working data files used for venue classification and enrichment.

## Files

### `venue-status.csv`
**Purpose:** Tracks venue lifecycle status (active, demolished, closed) with dates and notes.

**Usage:** Referenced during venue enrichment to add status metadata to venue data.

**Columns:**
- `venue` - Venue name
- `city` - City location
- `state` - State/region
- `status` - Venue status (active, demolished, closed)
- `closed_date` - Date venue closed (if applicable)
- `notes` - Additional context about status

### `venues-to-classify.csv`
**Purpose:** Working file for venue classification tasks.

**Usage:** Temporary staging for venues that need manual review or classification.

**Note:** This file is excluded from git via `.gitignore`.

## Maintenance

These files are manually curated and updated as needed when adding or enriching concert data.
