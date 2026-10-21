# EFLSPDDB — Secure Accounts and Audit Logging (not yet activated)

This ZIP improves the local website's Vehicles, Reports, and Detective Roster interfaces. It **does not** implement secure logins or a shared database. The existing `access.js` browser access-code screen is only a convenience gate, not secure authentication.

## Required for production detective accounts

1. Create a Supabase project and configure authentication (or another equivalent hosted backend). Never put the Supabase service-role key in GitHub Pages JavaScript.
2. Implement a server-side administrator-only endpoint (e.g. Supabase Edge Function) to create accounts. Authenticate the requester and verify the Admin or Super Admin role **on the server**. Admins may create detective accounts; only the Super Admin can assign Admin roles.
3. Generate unique login numbers and one-time temporary passwords server-side, create an Auth account, and show the temporary password **once** to the creating admin. Require a password change at first login. Do not store readable passwords in the database or logs.
4. Create a profiles table with immutable user ID, login number, name, badge, role, rank, callsign, photo and disabled status. Rank and callsign are editable profile fields, **not** permissions. Keep badge, login number and role admin-controlled.
5. Apply row-level security to every shared table. Use policies for detective read/write access and admin account management; do not rely on hiding buttons.
6. Migrate local cases, pins, vehicles, contacts, gangs, items and postals to shared tables, retaining stable IDs and coordinates. Offer a preview, backup and duplicate check before import. Do not clear localStorage during migration.
7. Write an append-only audit event for every database mutation from a trusted backend (actor ID, UTC timestamp, table, record ID, operation and before/after changes). Restrict viewing to Admins and Super Admin. Keep account passwords, tokens and private keys out of audit events.
8. Once backend and migrations are ready, replace the local gate with a real login screen and remove misleading local-only security language. Test disabled accounts, password resets, permission bypass attempts and concurrent edits before inviting detectives.

## Current local features

- **Reports** displays tiles from existing investigation files. Create Case opens the proper investigation form.
- **Vehicles** has a full form for vehicle/model, plate, colour, owner, location/postal, linked case and notes.
- **Manage Detectives** is available from Cases and Settings. Profiles are saved in this browser and feed the case assignment dropdown. It is **not** an account creation or password-generation system.
- Map imagery, postal data and existing pin storage keys remain unchanged.

**Do not enter actual confidential information into the browser-only preview.**
