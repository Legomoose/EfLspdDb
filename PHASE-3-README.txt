EFLSPDDB Phase 3 — numerical-code website login and basic account management

Upload the contents of this ZIP to your GitHub repository's main branch.
Cloudflare Pages should automatically deploy.

IMPORTANT:
- Before deploying, confirm you have saved your Owner 12-digit code.
- The browser-only access gate is replaced by Worker authentication.
- Log in using the 12-digit Owner code.
- Owner/Admin accounts will see 'Manage Accounts' at the bottom right.
- Accounts can be created, listed, and disabled; code reset is not yet implemented.
- Login tokens are held in browser memory only; page refresh requires login again.
- Idle logout is 10 minutes with warning in final 2 minutes.
- Existing browser data is not cleared or migrated.
- THIS IS NOT YET SHARED DATA. Pins/cases/gangs still use localStorage.
- IMPORTANT SECURITY LIMITATION: Existing website scripts and browser-local records are
  still downloaded by the public static site before login. Do not store real sensitive
  police or personal data until all records move to protected server APIs.
- Rate limiting and code management in Worker are early-stage; perform testing before
  issuing codes to a large group.
- Do not upload Worker secrets or database keys to GitHub.
