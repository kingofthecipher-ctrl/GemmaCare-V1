# GemmaCare Changelog

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
