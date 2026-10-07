# GHN ERP V2 — Neon migration

This build changes the GHN data flow from browser-only localStorage to:

Browser → Vercel Function (`/api/ghn`) → Neon PostgreSQL

## What changed

- Added `api/ghn.js` as the server-side GHN database/session API.
- Added PostgreSQL dependency `pg`.
- Updated `src/services/db.ts` to load/sync the authoritative GHN state with Neon while keeping the existing UI/business methods.
- Updated login to use an HttpOnly server session cookie.
- Kept localStorage as a temporary cache/offline fallback; it is no longer the authoritative multi-device database when the server is available.
- Added optimistic version checking so one device does not silently overwrite another device's newer state.
- Existing GHN UI/modules are otherwise preserved.

## First deployment

1. Before changing production, download the current GHN JSON backup from Pengaturan → Backup & Pemulihan Database.
2. Add `DATABASE_URL` to the Vercel Production environment. Never commit it to GitHub and never paste the secret into chat.
3. Deploy the new code.
4. On the device that already contains the current GHN data, log in with the Owner account.
5. If Neon is empty, the app automatically initializes the Neon state from that device's current local GHN data.
6. Other devices can then log in and load the same remote state.

## Important

- The first server-side login before the Neon state exists uses the current Owner defaults from the existing GHN app.
- After the first successful initialization, user accounts and passwords come from the remote GHN state.
- If two devices edit data at exactly the same time, the version check prevents a silent overwrite; the newer remote state wins and the stale device reloads it.
