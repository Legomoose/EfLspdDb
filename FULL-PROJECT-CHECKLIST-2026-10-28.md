# EFLSPDDB — Full Project Checklist
Updated 28 October 2026. Checked means explicitly confirmed by the user; unchecked means still requires testing, verification or implementation. Some features may exist in code but have not been confirmed end-to-end.

## Phase 1 — Map and sidebar
- [x] Left Pins sidebar scrolls properly (user-confirmed)
- [x] Filters sidebar scrolls properly (user-confirmed)
- [ ] Add Pin button consistently opens map-location selection
- [ ] Map click opens editor with postal populated
- [ ] Sidebar retract/expand and counters work
- [ ] Sidebar category filters correctly show/hide pins
- [ ] Map zoom, pan and pin visibility at zoom levels
- [ ] Postal lookup accuracy, especially 761, 704 and 136
- [ ] No marker distortion or positional offsets
- [ ] Map performance with many markers

## Phase 2 — Pin Editor and classification
- [ ] Four category groups: General, Investigations, Gangs, Locations & Services
- [ ] Fingerprint icon for Investigations
- [ ] General: General Location, Custom
- [ ] Investigations: Active Investigation, Location of Interest
- [ ] Gangs: Gang / Territory, Drug Locations, Crafting
- [ ] Locations & Services: Police Stations, Business, Hospitals, Vendors, Money Wash, Restaurants, Mech Shops, Gas Stations, Banks
- [ ] All category choices preserve underlying sidebar behaviour
- [ ] Legacy Crime Scene / Police Location / Police Station pins handled safely without deletion
- [ ] Six marker shapes (Standard, Ring, Square, Diamond, Circle, Hexagon)
- [ ] Marker shapes/icons correctly centred on map and preview
- [ ] Visual HEX picker, gradient, hue, quick swatches and manual HEX entry
- [ ] Colour and icon preview update immediately
- [ ] Icon library, search and custom image upload
- [ ] Drag, resize, expand/restore, scroll and fixed action buttons
- [ ] Name, description, postal, detective, status and lock fields
- [ ] Save, Cancel and Esc behave correctly
- [ ] No browser console errors

## Phase 3 — Pin management
- [ ] Create, edit and delete pins
- [ ] Lock pin and prevent accidental movement
- [ ] Link pin to cases and gangs
- [ ] Filters and category counts remain correct
- [ ] Pin data persists after reload and syncs to other users
- [ ] Recycle Bin and permanent delete work safely

## Phase 4 — Cases
- [ ] Create, edit, delete and view case tiles
- [ ] Case number and full case page
- [ ] Assigned detective selection
- [ ] Notes, photos, evidence and hyperlinks
- [ ] Case-to-map-pin linking and location autofill
- [ ] Case status and permissions
- [ ] Cross-device Realtime syncing

## Phase 5 — Gangs
- [ ] Gang creation, editing and deletion
- [ ] Gang logo, colour, territory, postal and threat level
- [ ] Leader, second, third and member roster
- [ ] Photos, aliases, relations and affiliations
- [ ] Related persons and active cases
- [ ] Cross-device Realtime syncing

## Phase 6 — Other bureau records
- [ ] Contacts create/edit/delete and affiliations
- [ ] Vehicle records and image fields
- [ ] Criminal Items records and image fields
- [ ] Tile/list views and search
- [ ] Shared sync and deletion behaviour

## Phase 7 — Personnel, accounts and permissions
- [ ] Personnel directory and callsign ordering
- [ ] Account creation and role assignment
- [ ] Admin, High Command and Detective permissions
- [ ] Skyline keypad login and code handling
- [ ] Account directory uses a single source of truth
- [ ] Session/logout behaviour and access restrictions

## Phase 8 — Realtime and security
- [ ] Supabase Realtime for every shared record type
- [ ] RLS and permissions independently reviewed
- [ ] Cloudflare Worker and Supabase auth tested
- [ ] Custom icon images shared across users (currently may be browser-local)
- [ ] Audit log, backups and restoration tested
- [ ] No secrets exposed in public frontend files

## Phase 9 — Settings and customisation
- [ ] Themes: LSPD Classic, Midnight, Emerald, Crimson and Dark Mode
- [ ] Custom dashboard
- [ ] Notification Centre
- [ ] Recent Activity and System Health
- [ ] Added By and Last Modified By attribution
- [ ] Remove obsolete setup panels

## Phase 10 — Navigation and branding
- [ ] LSPD DB branding and skyline header
- [ ] Remove duplicate search or Cases tabs
- [ ] Remove obsolete Warrants and History navigation
- [ ] Responsive layouts and popups
- [ ] Resolve CSS/JS conflicts and remove dead code
- [ ] Full browser smoke test

## Phase 11 — Production launch
- [ ] Back up live database and frontend
- [ ] Confirm real accounts, roles and permissions preserved
- [ ] Identify and back up test-only data
- [ ] Clear only approved test pins and investigations for an empty launch map
- [ ] Do not delete genuine records or accounts
- [ ] Test login, map, records and syncing as multiple users
- [ ] Keep a documented rollback plan
