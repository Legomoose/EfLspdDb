# EverFallLspdDb dashboard build

- Recreated the supplied dashboard layout: LSPD header, top tabs, left map controls, centre HD satellite map, right investigation panel, coloured bottom navigation and footer.
- Retained the calibrated Oulsen HD map, postal data and postal lookup from the previously working postal-alignment build.
- Add pins by clicking Add Pin, saving a record and then clicking the map; or search a postal and click Pin Here.
- Marker options: coloured pin, emoji or uploaded custom image; image size; lock against dragging/deletion; local reusable image library.
- Cases can be viewed, edited, positioned and deleted in Cases. Gangs/Rosters, History, Vehicles, Criminal Items and Contacts support local text entries and optional linked case numbers.
- Search, Reports and Settings have starter functionality. Settings includes local JSON export.

**Important limitations:** This is a static browser-local prototype. There is no authentication, server-side shared database, audit log or cross-device image syncing. Images are limited to 350 KB and browser storage capacity. The dashboard sample case content from the screenshot is not fabricated as real evidence. The design aims to closely match the screenshot, but exact pixels depend on screen size and fonts.

To deploy: upload the contents of this ZIP into the root of the GitHub repository, replacing existing files, and let the existing GitHub Pages workflow run.
