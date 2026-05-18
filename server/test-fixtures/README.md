# GemmaCare Test Fixtures

Used by `triage.integration.test.ts` for live end-to-end testing.

## What's included

```
test-fixtures/
  audio/
    hindi_fever_paracetamol.mp3          ✅ included
    swahili_headache_no_medication.mp3   ✅ included
    spanish_fever_ibuprofen.mp3          ✅ included
    text_only_arabic_wound.txt           ✅ included
  images/
    paracetamol_label.png               ✅ included (Accord 500mg effervescent)
    amoxicillin_label.png               ✅ included (Sandoz 500mg tablets)
```

## What each fixture tests

| File | Language | Pipeline path | Expected outcome |
|------|----------|--------------|-----------------|
| `hindi_fever_paracetamol.mp3` | Hindi | Audio + image | language=hi, urgency 1-3, no conflict |
| `swahili_headache_no_medication.mp3` | Swahili | Audio only | urgency 4-5, emergency referral |
| `spanish_fever_ibuprofen.mp3` | Spanish | Audio + image | medication mismatch flagged (ibuprofen vs amoxicillin) |
| `text_only_arabic_wound.txt` | Arabic | Text only | urgency 3-4, wound/infection |

## Running the integration tests

```bash
# Unit tests only (no Ollama needed, runs in milliseconds):
pnpm test

# Integration tests (requires Ollama running with gemma4:e4b):
OLLAMA_BASE_URL=http://localhost:11434 pnpm test --reporter=verbose
```
