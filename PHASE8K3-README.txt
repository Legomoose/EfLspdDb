PHASE 8K-3 — Pin sync latency repair

Changes:
- Local pin edits now queue an immediate authenticated sync instead of waiting for the 60-second fallback.
- If a sync is already running, a follow-up pass is scheduled after completion.
- Realtime notifications explicitly trigger map refresh; existing module refresh events are retained.
- 60-second fallback remains; no 2-second Worker polling restored.
- No database migration or data deletion.

Test on PC and laptop: add a General pin and an Investigation pin; confirm each appears on the other device within seconds when Realtime is connected. If delayed, inspect the live-notification connection status.
