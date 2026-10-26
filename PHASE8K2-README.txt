PHASE 8K-2 — Targeted polling cleanup

Changes:
- Disabled obsolete Phase 8C shared-record test pilot (2-second polling).
- Changed active automatic map-pin fallback polling from 2 seconds to 60 seconds, only while tab is visible.
- Throttled Supabase Realtime-triggered refresh broadcasts to at most once every 2 seconds.
- Updated browser cache-busting script versions.

No Worker, database, accounts, permissions, records, or design changes.

Deploy: Upload the contents INSIDE EfLspdDb-main to your GitHub repository.
Test: one device for 10-15 minutes, then two devices; verify pin creation/edit/delete sync and browser responsiveness.
Realtime must be connected for prompt cross-device changes; fallback may take up to 60 seconds.
Cloudflare 24-hour request total is not a real-time rate metric.
