# EverFallLspdDb — starter prototype

A first working front-end prototype for the EverFall LSPD Detective Bureau investigation map.

## Included
- Interactive GTA V map with status-coloured investigation pins
- Add/edit investigation records
- Search and filter by status, case number, location, detective, suspect, and notes
- Case summary and records table
- Responsive dark LSPD-style interface

## Important limitation
This is **prototype mode**, not a secure multi-user database. Records are saved to the browser's `localStorage`, so they are only available in the browser/device where they were entered. There is no real login or admin system yet. Do not enter real sensitive case information. The next stage is to connect Supabase (authentication, shared database, and role-based admin permissions) before using this with detectives.

## Run it
Open `index.html` in a browser while connected to the internet. The map uses Leaflet and publicly hosted GTA V map tiles, so internet access is needed.

## Put it on GitHub
1. Open your repository: https://github.com/Legomoose/EverFallLspdDb
2. Click **Add file** → **Upload files**.
3. Upload `index.html`, `style.css`, `app.js`, and `README.md` from this folder. (Replace the existing README when prompted.)
4. Click **Commit changes**.
5. Go to **Settings** → **Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
7. GitHub will show the website address when publishing finishes.

The public GitHub Pages site is suitable for testing the interface only. Do not use it for private investigations until proper authentication and access controls are implemented.

## Map tile attribution
The prototype uses the public tile pyramid at https://viruxe.github.io/gtav-map-tiles/. GTA V and associated artwork belong to their respective rights holders. This is an unofficial fan-made tool.
