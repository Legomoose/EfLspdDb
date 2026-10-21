# Lspd Db Interactive Map— starter prototype

A first working front-end prototype for the EverFall LSPD Detective Bureau investigation map.

## Included
- Interactive GTA V map with status-coloured investigation pins
- Add/edit investigation records
- Search and filter by status, case number, location, detective, suspect, and notes
- Case summary and records table
- Responsive dark LSPD-style interface

## Important limitation
This is **prototype mode**, not a secure multi-user database. Records are saved to the browser's `localStorage`, so they are only available in the browser/device where they were entered. There is no real login or admin system yet. Do not enter real sensitive case information. The next stage is to connect Supabase (authentication, shared database, and role-based admin permissions) before using this with detectives.
