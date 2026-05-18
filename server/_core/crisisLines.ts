/**
 * GemmaCare — Crisis Lines Registry
 *
 * Provides verified, localized psychiatric crisis hotlines for all 25 supported
 * languages. Injected programmatically into patient instructions when urgency = 5
 * AND a psychiatric/self-harm crisis is detected.
 *
 * IMPORTANT: These numbers were verified at time of writing but must be reviewed
 * periodically. Crisis line numbers occasionally change. Assign a 6-month review
 * cycle to this file.
 *
 * Last verified: May 2026
 */

export interface CrisisContact {
  name:   string;  // Organisation name in English
  number: string;  // Dialable number
  notes?: string;  // e.g. "Free, 24/7"
}

export interface CrisisBlock {
  /** Header line in the patient's language */
  header: string;
  /** "If you are in [country/region], call:" intro in the patient's language */
  intro: string;
  /** Closing sentence directing to nearest emergency department */
  closing: string;
  /** The actual contacts to list */
  contacts: CrisisContact[];
}

/**
 * Registry keyed by LanguageCode.
 *
 * Where a language maps to multiple countries (e.g. Arabic → 6+ countries),
 * we list the most widely used regional lines and note coverage.
 */
export const CRISIS_LINES: Record<string, CrisisBlock> = {

  // ── English ────────────────────────────────────────────────────────────────
  en: {
    header:  "🆘 IMMEDIATE CRISIS HELP",
    intro:   "Please call one of these free crisis lines right now:",
    closing: "You can also go directly to your nearest Emergency Department.",
    contacts: [
      { name: "International Association for Suicide Prevention (directory)", number: "https://www.iasp.info/resources/Crisis_Centres/", notes: "Find your country's line" },
      { name: "UK — Samaritans",      number: "116 123",        notes: "Free, 24/7" },
      { name: "US — 988 Suicide & Crisis Lifeline", number: "988", notes: "Call or text, 24/7" },
      { name: "Australia — Lifeline", number: "13 11 14",       notes: "Free, 24/7" },
      { name: "Canada — Crisis Services Canada", number: "1-833-456-4566", notes: "Free, 24/7" },
    ],
  },

  // ── French ─────────────────────────────────────────────────────────────────
  fr: {
    header:  "🆘 AIDE EN CAS DE CRISE IMMÉDIATE",
    intro:   "Veuillez appeler l'une de ces lignes d'aide gratuites maintenant :",
    closing: "Vous pouvez également vous rendre immédiatement aux urgences les plus proches.",
    contacts: [
      { name: "France — Numéro national de prévention du suicide", number: "3114", notes: "Gratuit, 24h/24, 7j/7" },
      { name: "Belgique — Centre de Prévention du Suicide",        number: "0800 32 123", notes: "Gratuit, 24h/24" },
      { name: "Suisse — Die Dargebotene Hand",                     number: "143",          notes: "Gratuit, 24h/24" },
      { name: "Canada (Québec) — Suicide Action Montréal",         number: "1-866-APPELLE (277-3553)", notes: "Gratuit, 24h/24" },
    ],
  },

  // ── German ─────────────────────────────────────────────────────────────────
  de: {
    header:  "🆘 SOFORTIGE KRISENUNTERSTÜTZUNG",
    intro:   "Bitte rufen Sie jetzt eine dieser kostenlosen Krisenhotlines an:",
    closing: "Sie können auch direkt in die nächste Notaufnahme gehen.",
    contacts: [
      { name: "Deutschland — Telefonseelsorge (Leitung 1)", number: "0800 111 0 111", notes: "Kostenlos, 24/7" },
      { name: "Deutschland — Telefonseelsorge (Leitung 2)", number: "0800 111 0 222", notes: "Kostenlos, 24/7" },
      { name: "Österreich — Telefonseelsorge",              number: "142",            notes: "Kostenlos, 24/7" },
      { name: "Schweiz — Die Dargebotene Hand",             number: "143",            notes: "Kostenlos, 24/7" },
    ],
  },

  // ── Spanish ────────────────────────────────────────────────────────────────
  es: {
    header:  "🆘 AYUDA EN CRISIS INMEDIATA",
    intro:   "Por favor, llame ahora mismo a una de estas líneas de ayuda gratuitas:",
    closing: "También puede ir directamente a la sala de urgencias más cercana.",
    contacts: [
      { name: "España — Línea de Atención a la Conducta Suicida", number: "024",               notes: "Gratuita, 24h" },
      { name: "México — SAPTEL",                                   number: "55 5259-8121",      notes: "Gratuita, 24h" },
      { name: "Argentina — Centro de Asistencia al Suicida",       number: "135",               notes: "Gratuita, 24h" },
      { name: "Colombia — Línea 106",                              number: "106",               notes: "Gratuita, 24h" },
      { name: "EE.UU. (hispanohablantes) — 988",                   number: "988 (oprima 2)",   notes: "Gratuita, 24h" },
    ],
  },

  // ── Italian ────────────────────────────────────────────────────────────────
  it: {
    header:  "🆘 AIUTO IMMEDIATO IN CASO DI CRISI",
    intro:   "Chiami subito uno di questi numeri gratuiti:",
    closing: "Può anche recarsi direttamente al pronto soccorso più vicino.",
    contacts: [
      { name: "Italia — Telefono Amico",     number: "02 2327 2327",  notes: "Gratuito" },
      { name: "Italia — Telefono Azzurro",   number: "19696",         notes: "Gratuito, 24h" },
      { name: "Italia — Emergenza (Generale)", number: "118",         notes: "Emergenza medica" },
    ],
  },

  // ── Dutch ──────────────────────────────────────────────────────────────────
  nl: {
    header:  "🆘 DIRECTE CRISISHULP",
    intro:   "Bel nu een van deze gratis crisishulplijnen:",
    closing: "U kunt ook direct naar de dichtstbijzijnde spoedeisende hulp gaan.",
    contacts: [
      { name: "Nederland — 113 Zelfmoordpreventie", number: "113",          notes: "Gratis, 24/7" },
      { name: "Nederland — 113 (gratis nummer)",    number: "0800 0113",    notes: "Gratis, 24/7" },
      { name: "België — Zelfmoordlijn",             number: "0800 32 123",  notes: "Gratis, 24/7" },
    ],
  },

  // ── Portuguese (Portugal) ──────────────────────────────────────────────────
  pt: {
    header:  "🆘 AJUDA IMEDIATA EM CRISE",
    intro:   "Por favor, ligue agora para uma destas linhas de apoio gratuitas:",
    closing: "Também pode dirigir-se imediatamente ao serviço de urgência mais próximo.",
    contacts: [
      { name: "Portugal — SOS Voz Amiga",   number: "213 544 545",   notes: "Gratuito, todos os dias 16h–24h" },
      { name: "Portugal — Voz de Apoio",    number: "225 506 070",   notes: "Gratuito" },
      { name: "Portugal — INEM (Emergência)", number: "112",         notes: "Emergência médica" },
    ],
  },

  // ── Portuguese (Brazil) ────────────────────────────────────────────────────
  pt_br: {
    header:  "🆘 AJUDA IMEDIATA EM CRISE",
    intro:   "Por favor, ligue agora para uma destas linhas de apoio gratuitas:",
    closing: "Você também pode ir diretamente à UPA ou pronto-socorro mais próximo.",
    contacts: [
      { name: "Brasil — CVV (Centro de Valorização da Vida)", number: "188", notes: "Gratuito, 24h" },
      { name: "Brasil — SAMU (Emergência Médica)",            number: "192", notes: "Gratuito, 24h" },
    ],
  },

  // ── Russian ────────────────────────────────────────────────────────────────
  ru: {
    header:  "🆘 ЭКСТРЕННАЯ ПСИХОЛОГИЧЕСКАЯ ПОМОЩЬ",
    intro:   "Пожалуйста, позвоните прямо сейчас на одну из этих бесплатных линий:",
    closing: "Вы также можете немедленно обратиться в ближайшее отделение скорой помощи.",
    contacts: [
      { name: "Россия — Телефон доверия (федеральный)", number: "8-800-2000-122", notes: "Бесплатно, 24/7" },
      { name: "Россия — Скорая помощь",                 number: "103",            notes: "Экстренная служба" },
    ],
  },

  // ── Turkish ────────────────────────────────────────────────────────────────
  tr: {
    header:  "🆘 ACİL KRİZ YARDIMI",
    intro:   "Lütfen şimdi bu ücretsiz hatlardan birini arayın:",
    closing: "Ayrıca en yakın acil servise de doğrudan gidebilirsiniz.",
    contacts: [
      { name: "Türkiye — ALO 182 Psikiyatrik Yardım Hattı", number: "182",  notes: "Ücretsiz, 7/24" },
      { name: "Türkiye — 112 Acil Servis",                  number: "112",  notes: "Acil tıbbi yardım" },
    ],
  },

  // ── Chinese Mandarin (Simplified) ──────────────────────────────────────────
  zh: {
    header:  "🆘 立即危机援助",
    intro:   "请立刻拨打以下免费危机热线：",
    closing: "您也可以立即前往最近的急诊室。",
    contacts: [
      { name: "中国大陆 — 心理援助热线（北京）",  number: "010-82951332",  notes: "免费" },
      { name: "中国大陆 — 全国心理援助热线",      number: "400-161-9995",  notes: "免费" },
      { name: "台湾 — 自杀防治专线",             number: "1925",           notes: "免费，24小时" },
      { name: "新加坡 — SOS危机热线",            number: "1-767",          notes: "免费，24小时" },
    ],
  },

  // ── Chinese Cantonese (Traditional) ────────────────────────────────────────
  zh_tw: {
    header:  "🆘 即時危機援助",
    intro:   "請立即撥打以下免費危機熱線：",
    closing: "您亦可立即前往最近的急診室。",
    contacts: [
      { name: "香港 — 撒瑪利亞防止自殺會",         number: "2389 2222",  notes: "免費，24小時" },
      { name: "香港 — 撒瑪利亞熱線 (多語言)",       number: "2382 0000",  notes: "免費，24小時" },
      { name: "台灣 — 自殺防治專線",               number: "1925",       notes: "免費，24小時" },
      { name: "澳門 — 生命熱線",                   number: "2852 5777",  notes: "免費" },
    ],
  },

  // ── Japanese ───────────────────────────────────────────────────────────────
  ja: {
    header:  "🆘 緊急危機サポート",
    intro:   "今すぐ以下の無料相談窓口にお電話ください：",
    closing: "最寄りの救急病院に直接行くこともできます。",
    contacts: [
      { name: "いのちの電話（フリーダイヤル）",   number: "0120-783-556",  notes: "無料、毎日16時〜21時 / 毎月10日は8時〜翌8時" },
      { name: "よりそいホットライン",             number: "0120-279-338",  notes: "無料、24時間" },
      { name: "こころの健康相談統一ダイヤル",     number: "0570-064-556",  notes: "平日対応" },
    ],
  },

  // ── Korean ─────────────────────────────────────────────────────────────────
  ko: {
    header:  "🆘 즉각적인 위기 도움",
    intro:   "지금 바로 아래 무료 위기 상담 전화 중 하나에 연락하세요:",
    closing: "가장 가까운 응급실에 직접 가실 수도 있습니다.",
    contacts: [
      { name: "한국 — 자살예방상담전화", number: "1393",          notes: "무료, 24시간" },
      { name: "한국 — 정신건강위기상담전화", number: "1577-0199", notes: "무료, 24시간" },
      { name: "한국 — 생명의전화",        number: "1588-9191",    notes: "무료, 24시간" },
    ],
  },

  // ── Vietnamese ─────────────────────────────────────────────────────────────
  vi: {
    header:  "🆘 HỖ TRỢ KHỦNG HOẢNG NGAY LẬP TỨC",
    intro:   "Vui lòng gọi ngay một trong các đường dây hỗ trợ miễn phí này:",
    closing: "Bạn cũng có thể đến thẳng phòng cấp cứu gần nhất.",
    contacts: [
      { name: "Việt Nam — Đường dây hỗ trợ sức khỏe tâm thần", number: "1800 599 920", notes: "Miễn phí, 24/7" },
      { name: "Việt Nam — Cấp cứu y tế",                        number: "115",          notes: "Khẩn cấp" },
    ],
  },

  // ── Thai ───────────────────────────────────────────────────────────────────
  th: {
    header:  "🆘 ความช่วยเหลือด้านวิกฤตทันที",
    intro:   "กรุณาโทรหาสายด่วนฟรีเหล่านี้ทันที:",
    closing: "คุณสามารถไปที่ห้องฉุกเฉินโรงพยาบาลใกล้บ้านได้โดยตรง",
    contacts: [
      { name: "ประเทศไทย — สายด่วนกรมสุขภาพจิต", number: "1323",  notes: "ฟรี, 24 ชั่วโมง" },
      { name: "ประเทศไทย — สายด่วนฉุกเฉิน",      number: "1669",  notes: "บริการฉุกเฉิน" },
    ],
  },

  // ── Indonesian ─────────────────────────────────────────────────────────────
  id: {
    header:  "🆘 BANTUAN KRISIS SEGERA",
    intro:   "Silakan hubungi salah satu saluran bantuan gratis ini sekarang:",
    closing: "Anda juga bisa langsung pergi ke UGD rumah sakit terdekat.",
    contacts: [
      { name: "Indonesia — Into The Light / Hotline Kesehatan Jiwa", number: "119 ext 8",     notes: "Gratis, 24 jam" },
      { name: "Indonesia — Yayasan Pulih",                            number: "021-788-42580", notes: "Senin–Jumat" },
      { name: "Indonesia — Gawat Darurat",                            number: "119",           notes: "Darurat medis" },
    ],
  },

  // ── Malay ──────────────────────────────────────────────────────────────────
  ms: {
    header:  "🆘 BANTUAN KRISIS SEGERA",
    intro:   "Sila hubungi salah satu talian bantuan percuma ini sekarang:",
    closing: "Anda juga boleh terus pergi ke bahagian kecemasan hospital yang berdekatan.",
    contacts: [
      { name: "Malaysia — Befrienders KL",              number: "03-7627 2929",  notes: "Percuma" },
      { name: "Malaysia — Talian Kasih",                number: "15999",         notes: "Percuma, 24 jam" },
      { name: "Singapura — SOS (Samaritans of Singapore)", number: "1-767",      notes: "Percuma, 24 jam" },
    ],
  },

  // ── Hindi ──────────────────────────────────────────────────────────────────
  hi: {
    header:  "🆘 तत्काल संकट सहायता",
    intro:   "कृपया अभी इनमें से किसी एक मुफ़्त हेल्पलाइन पर कॉल करें:",
    closing: "आप नज़दीकी अस्पताल के आपातकालीन विभाग (Emergency Room) में भी तुरंत जा सकते हैं।",
    contacts: [
      { name: "भारत — Tele-MANAS (राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन)", number: "14416",          notes: "मुफ़्त, 24/7" },
      { name: "भारत — Tele-MANAS (टोल-फ्री)",                               number: "1800-891-4416", notes: "मुफ़्त, 24/7" },
      { name: "भारत — iCall (TISS)",                                          number: "9152987821",   notes: "सोम–शनि, 8am–10pm" },
      { name: "भारत — Kiran मानसिक स्वास्थ्य हेल्पलाइन",                   number: "1800-599-0019", notes: "मुफ़्त, 24/7" },
    ],
  },

  // ── Bengali ────────────────────────────────────────────────────────────────
  bn: {
    header:  "🆘 তাৎক্ষণিক সংকট সহায়তা",
    intro:   "অনুগ্রহ করে এখনই এই বিনামূল্যের হেল্পলাইনগুলির যেকোনো একটিতে কল করুন:",
    closing: "আপনি সরাসরি নিকটস্থ হাসপাতালের জরুরি বিভাগেও যেতে পারেন।",
    contacts: [
      { name: "বাংলাদেশ — কান পেতে রই (Kaan Pete Roi)", number: "01779-554391",  notes: "বিকেল ৪টা – রাত ১০টা" },
      { name: "ভারত — Tele-MANAS",                       number: "14416",          notes: "বিনামূল্যে, ২৪/৭" },
      { name: "ভারত — iCall",                             number: "9152987821",    notes: "সোম–শনি" },
    ],
  },

  // ── Tamil ──────────────────────────────────────────────────────────────────
  ta: {
    header:  "🆘 உடனடி நெருக்கடி உதவி",
    intro:   "இப்போதே இந்த இலவச உதவி எண்களில் ஒன்றை அழையுங்கள்:",
    closing: "நீங்கள் நேரடியாக அருகிலுள்ள மருத்துவமனை அவசர சிகிச்சை பிரிவிற்கும் செல்லலாம்.",
    contacts: [
      { name: "இந்தியா — Tele-MANAS",                   number: "14416",        notes: "இலவசம், 24/7" },
      { name: "இந்தியா — iCall (TISS)",                  number: "9152987821",  notes: "திங்கள்–சனி" },
      { name: "இந்தியா — Vandrevala Foundation",         number: "1860-2662-345", notes: "இலவசம், 24/7" },
      { name: "இலங்கை — CCCline",                        number: "1333",         notes: "இலவசம், 24/7" },
    ],
  },

  // ── Telugu ─────────────────────────────────────────────────────────────────
  te: {
    header:  "🆘 తక్షణ సంక్షోభ సహాయం",
    intro:   "దయచేసి ఇప్పుడే ఈ ఉచిత హెల్ప్‌లైన్‌లలో ఒకదాన్ని కాల్ చేయండి:",
    closing: "మీరు నేరుగా సమీపంలోని ఆసుపత్రి అత్యవసర విభాగానికి కూడా వెళ్ళవచ్చు.",
    contacts: [
      { name: "భారతదేశం — Tele-MANAS",               number: "14416",          notes: "ఉచితం, 24/7" },
      { name: "భారతదేశం — Vandrevala Foundation",     number: "1860-2662-345", notes: "ఉచితం, 24/7" },
      { name: "భారతదేశం — iCall (TISS)",              number: "9152987821",    notes: "సోమ–శని" },
    ],
  },

  // ── Arabic ─────────────────────────────────────────────────────────────────
  ar: {
    header:  "🆘 مساعدة عاجلة في حالة الأزمات",
    intro:   "يُرجى الاتصال الآن بأحد خطوط الدعم المجانية التالية:",
    closing: "يمكنك أيضًا الذهاب مباشرةً إلى أقرب قسم طوارئ.",
    contacts: [
      { name: "السعودية — خط مساندة للصحة النفسية", number: "920033360",    notes: "مجاني، 24/7" },
      { name: "الإمارات — خط الأمل (HOPE)",          number: "800-4673",     notes: "مجاني، 24/7" },
      { name: "مصر — نجدة الطفل والمرأة",            number: "08008880700",  notes: "مجاني" },
      { name: "الأردن — خط دعم الصحة النفسية",       number: "110",          notes: "مجاني" },
      { name: "المغرب — SOS Détresse",                number: "0800 088 800", notes: "مجاني" },
    ],
  },

  // ── Swahili ────────────────────────────────────────────────────────────────
  sw: {
    header:  "🆘 MSAADA WA DHARURA",
    intro:   "Tafadhali piga simu moja ya simu hizi za bure za msaada sasa hivi:",
    closing: "Unaweza pia kwenda moja kwa moja kwenye chumba cha dharura cha hospitali iliyo karibu nawe.",
    contacts: [
      { name: "Kenya — Befrienders Kenya",       number: "0722 178 177",  notes: "Bure" },
      { name: "Kenya — Ambulance ya Dharura",    number: "999 / 112",     notes: "Dharura ya kimatibabu" },
      { name: "Tanzania — Dharura ya kimataifa", number: "112",           notes: "Dharura" },
      { name: "Uganda — Butabika Hospital",      number: "0800-219-000",  notes: "Bure" },
    ],
  },

  // ── Yoruba ─────────────────────────────────────────────────────────────────
  yo: {
    header:  "🆘 IRANLỌWỌ PAJAWIRI",
    intro:   "Jọwọ pe ọkan ninu awọn nọmba iranlọwọ ọfẹ wọnyi lẹsẹkẹsẹ:",
    closing: "O tun le lọ taara si ẹka pajawiri ile-iwosan ti o sunmọ ọ.",
    contacts: [
      { name: "Naijiria — SURPIN (Suicide Prevention Initiative Nigeria)", number: "09080217555",  notes: "Ọfẹ" },
      { name: "Naijiria — SURPIN (laini keji)",                            number: "09034400009",  notes: "Ọfẹ" },
      { name: "Naijiria — Ẹka Pajawiri ti Orilẹ-ède",                     number: "199",          notes: "Pajawiri" },
    ],
  },
};

// ── Keywords that signal a psychiatric / self-harm crisis ─────────────────────
// Checked against the extracted (English) chief_complaint and symptom_list.
// This list is intentionally broad — false positives are safe (extra crisis info
// never hurts), false negatives are dangerous.
const PSYCHIATRIC_CRISIS_KEYWORDS = [
  "suicid",         // suicidal, suicide, suicidality
  "self-harm",
  "self harm",
  "end my life",
  "end their life",
  "kill myself",
  "kill himself",
  "kill herself",
  "kill themselves",
  "want to die",
  "wants to die",
  "take my life",
  "take his life",
  "take her life",
  "overdose",       // intentional overdose context
  "self inflict",
  "harm myself",
  "harm himself",
  "harm herself",
  "cutting myself",
  "cutting himself",
  "cutting herself",
  "psychiatric crisis",
  "mental health crisis",
  "active ideation",
  "plan and means",      // matches Gemini critique exact phrase
  "method and plan",
  "ideation with plan",
];

/**
 * Returns true if the extracted triage data signals a psychiatric/self-harm
 * crisis that warrants injecting crisis line information.
 */
export function isPsychiatricCrisis(
  urgencyLevel: number | null | undefined,
  chiefComplaint: string | null | undefined,
  symptomList: string[] | null | undefined,
  differentialNote: string | null | undefined,
): boolean {
  // Only inject for Level 5 urgency
  if (!urgencyLevel || urgencyLevel < 5) return false;

  const searchText = [
    String(chiefComplaint ?? ""),
    ...(Array.isArray(symptomList) ? symptomList : []),
    String(differentialNote ?? ""),
  ].join(" ").toLowerCase();

  return PSYCHIATRIC_CRISIS_KEYWORDS.some(kw => searchText.includes(kw));
}

/**
 * Formats a crisis block as a Markdown string to prepend to patient instructions.
 * Falls back to English if the language code is not in the registry.
 */
export function formatCrisisBlock(langCode: string): string {
  const block = CRISIS_LINES[langCode] ?? CRISIS_LINES["en"];

  const contactLines = block.contacts
    .map(c => `  • **${c.name}:** ${c.number}${c.notes ? ` — ${c.notes}` : ""}`)
    .join("\n");

  return [
    `---`,
    `## ${block.header}`,
    ``,
    block.intro,
    ``,
    contactLines,
    ``,
    block.closing,
    ``,
    `---`,
    ``,
  ].join("\n");
}
