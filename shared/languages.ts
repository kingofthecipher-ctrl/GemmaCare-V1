/**
 * GemmaCare — Languages with full UI translations
 * Every language here has a complete translation in LanguageContext.tsx
 */
export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const SUPPORTED_LANGUAGES = {
  // ── Core — European ──────────────────────────────────────
  en:    { name: "English",              nativeName: "English",           region: "European" },
  fr:    { name: "French",               nativeName: "Français",          region: "European" },
  de:    { name: "German",               nativeName: "Deutsch",           region: "European" },
  es:    { name: "Spanish",              nativeName: "Español",           region: "European" },
  it:    { name: "Italian",              nativeName: "Italiano",          region: "European" },
  nl:    { name: "Dutch",                nativeName: "Nederlands",        region: "European" },
  pt:    { name: "Portuguese",           nativeName: "Português",         region: "European" },
  pt_br: { name: "Portuguese (Brazil)",  nativeName: "Português (Brasil)", region: "European" },
  ru:    { name: "Russian",              nativeName: "Русский",           region: "European" },
  tr:    { name: "Turkish",              nativeName: "Türkçe",            region: "European" },
  // ── East Asian ───────────────────────────────────────────
  zh:    { name: "Chinese (Mandarin)",   nativeName: "普通话",             region: "East Asian" },
  zh_tw: { name: "Chinese (Cantonese)",  nativeName: "廣東話",             region: "East Asian" },
  ja:    { name: "Japanese",             nativeName: "日本語",             region: "East Asian" },
  ko:    { name: "Korean",               nativeName: "한국어",             region: "East Asian" },
  vi:    { name: "Vietnamese",           nativeName: "Tiếng Việt",        region: "Southeast Asian" },
  th:    { name: "Thai",                 nativeName: "ภาษาไทย",           region: "Southeast Asian" },
  id:    { name: "Indonesian",           nativeName: "Bahasa Indonesia",  region: "Southeast Asian" },
  ms:    { name: "Malay",                nativeName: "Bahasa Melayu",     region: "Southeast Asian" },
  // ── South Asian ──────────────────────────────────────────
  hi:    { name: "Hindi",                nativeName: "हिन्दी",            region: "South Asian" },
  bn:    { name: "Bengali",              nativeName: "বাংলা",             region: "South Asian" },
  ta:    { name: "Tamil",                nativeName: "தமிழ்",             region: "South Asian" },
  te:    { name: "Telugu",               nativeName: "తెలుగు",            region: "South Asian" },
  // ── Middle East & Africa ─────────────────────────────────
  ar:    { name: "Arabic",               nativeName: "العربية",           region: "Middle East & Africa" },
  sw:    { name: "Swahili",              nativeName: "Kiswahili",         region: "Middle East & Africa" },
  yo:    { name: "Yoruba",               nativeName: "Yorùbá",            region: "Middle East & Africa" },
} as const;
