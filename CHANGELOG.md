# GemmaCare Changelog

---

## Unreleased — security audit, October 22, 2026

- Bind local development to loopback; require an application password for network listeners, validate Host/Origin, reject cross-site API access before body parsing, and keep API responses out of caches.
- Replace shared JWT defaults with a random process key or a private configured key, verify application identity, use same-site cookies, and fail closed when a database cannot identify the local user.
- Preserve offline local login; disable the unsupported external OAuth callback that accepted unbound state. This remains a shared-owner application.
- Authenticate and scope progress polling to its owner, expire stale progress, and bound the progress map.
- Use private audio temporary directories, restrict decoder formats/protocols, and remove clinical details and raw upstream errors from server logs.
- Remove committed SQLite sidecars from the current tree; ignore database sidecars and exclude private configuration/databases from Docker contexts. Historical Git copies remain.
- Pin the audited Node 22.23.4 runtime in Docker and `.nvmrc`; update Vite to 7.3.7, Express to 4.22.3, MySQL2 to 3.23.1, pnpm to 10.34.5, and the installation-only tar extractor to 7.5.21. Retain other dependencies where the affected feature is unused or application exploitation is unverified.
- Preserve existing databases and `.env` settings. Compose now requires explicit passwords and exposes only the loopback app port. No production data or credentials are changed.
- Add synthetic security regression tests and document the full advisory assessment. Known TypeScript errors, skipped live-model tests, plaintext local storage, and remaining dependency matches are recorded in `SECURITY_AUDIT.md`; they are not claimed fixed.

---

## v1.01 — May 19, 2026

### UI Translations

**Cycling multilingual Take Photo button**
- The Take Photo camera button now cycles through all 25 supported UI language translations of "Take Photo" and its subtitle, fading between each language every 2.3 seconds.
- Arabic renders right-to-left automatically. A fixed minimum height prevents layout shift between short and long strings.

**Dark Mode / Light Mode toggle translated**
- Theme toggle now shows the correct translated label in whichever UI language is selected.
- New `darkMode` and `lightMode` keys added to all 25 language definitions in `LanguageContext.tsx`.

**App Language label translated**
- The "App Language" label above the language picker in the sidebar now uses `t.appLanguage` instead of hardcoded English.

**Camera strings fully translated in both views**
- "Take Photo" and "Opens camera — requests permission" were hardcoded in English in two separate places (`TriageInput.tsx` and `Triage.tsx`). Both now use the language context.
- "Select from gallery" in `Triage.tsx` also fixed.

### Bug Fix

**`t is not defined` crash in GlobalLangPicker**
- `GlobalLangPicker` was not destructuring `t` from `useLanguage()`, causing a crash after the App Language label was wired up. Fixed.

---

## v1.0 — May 18, 2026

Initial public release. Submitted to the Kaggle × Google DeepMind Gemma 4 Good Hackathon.
