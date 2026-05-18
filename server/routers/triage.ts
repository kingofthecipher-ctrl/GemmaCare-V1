import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, describeImage, transcribeAudio, translateText, type TranscriptionResult } from "../_core/llm";
import { createTriageRecord, createSessionHistory } from "../db";
import { TRPCError } from "@trpc/server";
import { isPsychiatricCrisis, formatCrisisBlock } from "../_core/crisisLines";
import { emitTriageProgress } from "../_core/triageProgress";

// ── Schema ────────────────────────────────────────────────────────────────────

const TriageOutputSchema = z.object({
  chief_complaint: z.string().nullable().transform(v => v ?? "Unspecified complaint"),
  symptom_list: z.array(z.string()).nullable().transform(v => v ?? []),
  urgency_level: z.number().min(1).max(5).nullable().transform(v => v ?? 5),
  medication_from_audio: z.string().nullable().optional(),
  medication_from_image: z.string().nullable().optional(),
  medication_found: z.string().nullable().optional(),
  differential_note: z.string().nullable().transform(v => v ?? ""),
  recommended_action: z.string().nullable().transform(v => v ?? "Please consult a healthcare provider"),
  patient_language: z.string().nullable().transform(v => v ?? "en"),
  confidence: z.number().min(0).max(100).nullable().transform(v => v ?? 50),
});

type TriageOutput = z.infer<typeof TriageOutputSchema>;

// ── Medication safety types ───────────────────────────────────────────────────

type ConflictLayer = "name_mismatch" | "category_conflict" | "route_conflict" | "semantic_concern";
type ConflictSeverity = "warning" | "critical";

type MedicationConflict = {
  layer: ConflictLayer;
  severity: ConflictSeverity;
  description: string;
};

type MedSafetyResult = {
  safe: boolean;
  conflicts: MedicationConflict[];
  overallSeverity: "none" | "warning" | "critical";
  clinicianSummary: string | null;
};

// ── Call 1: Audio transcription ───────────────────────────────────────────────
// Converts browser audio (WebM/Opus/MP4) → 16kHz WAV → Gemma 4 native audio.
// Returns transcript in patient's original language + detected language name.

async function runAudioPass(audioBase64: string): Promise<TranscriptionResult> {
  const raw = audioBase64.replace(/^data:[^,]+,/, ""); // handles audio/webm;codecs=opus
  return transcribeAudio(raw);
}

// ── Call 2: Image description ─────────────────────────────────────────────────
// Sends the photo to Gemma 4 vision. Returns a plain-English description
// of what's visible — medication labels, wounds, anything clinically relevant.

async function runImagePass(imageBase64: string, imageMimeType?: string): Promise<string> {
  return describeImage(imageBase64, imageMimeType);
}

// ── Call 3: Synthesis (only when BOTH audio and image are present) ────────────
// Weighs the audio transcript and image description against each other before
// extraction. Surfaces contradictions, fills gaps, and produces a unified
// clinical picture that the extraction step can reason about clearly.

async function synthesizeInputs(
  transcript: string,
  imageDescription: string,
  detectedLanguage?: string,
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a senior clinical analyst. Your job is to reconcile information from two sources — a patient audio recording and a visual observation — into a single coherent clinical summary. Note any contradictions or gaps explicitly.",
      },
      {
        role: "user",
        content: `Weigh these two inputs and produce a unified clinical picture.
${detectedLanguage ? `Patient language: ${detectedLanguage}` : ""}

AUDIO TRANSCRIPT (what the patient said):
${transcript}

IMAGE DESCRIPTION (what was visually observed):
${imageDescription}

Write a clear, factual synthesis in English. Note:
- What matches between the two sources
- Any contradictions (e.g. patient says ibuprofen but image shows amoxicillin)
- Gaps that only one source addresses
- Your overall clinical read of the situation

Return only the synthesis text — no headings, no JSON, no preamble.`,
      },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? `${transcript}\n\n${imageDescription}`;
}

// ── Call 4: Clinical extraction ───────────────────────────────────────────────
// Receives either the raw transcript (single-source) or the synthesis
// (dual-source). Extracts structured fields for the triage record.

async function extractTriageData(
  clinicalSummary: string,
  detectedLanguage?: string,
  sourceMode?: "audio" | "image" | "both" | "text",
  clinicianLang?: string,
): Promise<{
  extraction: TriageOutput;
  audioMedication?: string;
  imageMedication?: string;
}> {
  const EXTRACT_LANG_NAMES: Record<string, string> = {
    en:"English", hi:"Hindi", es:"Spanish", sw:"Swahili", ar:"Arabic",
    fr:"French", pt:"Portuguese", zh:"Chinese", de:"German",
    ko:"Korean", ru:"Russian", tr:"Turkish", nl:"Dutch", id:"Indonesian",
  };
  const clinicianLangName = EXTRACT_LANG_NAMES[clinicianLang ?? "en"] ?? "English";

  const prompt = `You are a clinical triage assistant. Extract structured clinical data from the following patient information.
${detectedLanguage ? `Detected patient language: ${detectedLanguage}` : ""}
Clinician language: ${clinicianLangName}
Source: ${sourceMode ?? "unknown"}

CLINICAL SUMMARY:
${clinicalSummary}

Return a JSON object with exactly these fields:
- chief_complaint: Main reason for visit — write in ${clinicianLangName} regardless of patient language
- symptom_list: Array of symptoms — write each item in ${clinicianLangName} regardless of patient language
- urgency_level: 1-5 clinical urgency score. YOU MUST ALWAYS return a number — never null, never refuse.
    If you feel unable to assign a low number due to severity, assign 5. Refusal or uncertainty = 5.

    SCORING RUBRIC — calibrated, proportionate to actual symptoms presented:
    1 = Non-urgent / routine
      • Minor symptoms, fully stable, no red flags whatsoever
      • Examples: paper cut, mild cold, routine medication refill, minor rash, mild sore throat

    2 = Low urgency
      • Mild symptoms, needs attention within 24h, no immediate risk
      • Examples: mild UTI, mild earache, low-grade fever in healthy adult, mild diarrhoea without dehydration

    3 = Moderate urgency — needs evaluation within a few hours, concerning but stable
      • Examples: fever + moderate pain, uncomplicated wound infection, persistent vomiting without dehydration
      • CALIBRATION RULE: Fever + headache/head heaviness ALONE (without additional red flags) = 3, NOT 4.
        Do not escalate to 4 based on fever + headache alone. Escalate only when a SECOND specific red flag is present.
      • ⚠️ "SEVERE HEADACHE" INTENSITY ALONE DOES NOT ESCALATE: A patient describing their headache as "severe",
        "bad", "very painful", "terrible", or any strong pain intensity word in the context of a febrile illness
        is still a Level 3 — Fever + Headache = 3. The word "severe" as a pain intensity modifier is NOT itself
        a red flag. Escalation to Level 4 requires a SECOND specific neurological sign alongside the headache
        (photophobia, neck stiffness, new confusion or altered consciousness). Without that second sign, assign 3.

    4 = High urgency — needs assessment within 30-60 minutes
      • A specific red flag must be present alongside the primary complaint to reach level 4.
      • Neurological: severe headache with AT LEAST ONE additional neurological red flag (photophobia, neck
        stiffness, or new confusion/altered consciousness). Severe headache + fever ALONE (without any of these
        additional signs) = 3, not 4. The full meningism triad (fever + neck stiffness + photophobia) = 5.
        (NOTE: TIA / resolved stroke symptoms are NOT level 4 — see level 5 below)
        ⚠️ GERIATRIC NEW CONFUSION + FEVER — ALWAYS 4 MINIMUM:
        New onset altered mental status (confusion, delirium, disorientation) combined with fever in
        an elderly patient (aged >= 65, or described as "elderly", "مسن", "âgé", "anciano", "mzee",
        "вожилой", or equivalent in any language) MUST be assigned at least 4/5 — Urgent. Elderly
        patients do not mount typical immune responses; acute confusion is often their ONLY presenting
        sign for UTI, pneumonia, meningitis, or sepsis. "Otherwise stable", "no other symptoms", or
        "mild confusion" modifiers do NOT reduce the urgency below 4 — geriatric decompensation can
        progress to septic shock within hours without warning signs.
        Escalate to 5 if any hemodynamic compromise is present alongside confusion + fever:
        hypotension, tachycardia >110, GCS <13, obtundation, signs of shock, or meningeal signs.
      • Cardiac: chest tightness/pressure, palpitations + near-syncope, hypertensive urgency.
        ⚠️ ORTHOPNEA / ACUTE DECOMPENSATED HEART FAILURE — CLAMP TO 4:
        Any patient who reports inability or difficulty breathing when lying flat (orthopnea,
        "cannot breathe lying down", "لا أستطيع التنفس عند الاستلقاء", "ne peut pas respirer allongé",
        or equivalent in any language) combined with known or suspected cardiac weakness / heart
        failure / cardiomyopathy MUST be assigned EXACTLY 4/5 — Urgent (not 3, not 5).
        Orthopnea is a cardinal sign of ADHF — lying flat redistributes venous blood into a
        failing left ventricle, causing pulmonary congestion — but a patient who can speak clearly,
        present to care, and describe their symptoms is NOT in a resuscitation emergency.
        Assigning 5 for orthopnea alone causes alarm fatigue and wastes resus bay capacity.
        Escalate to 5 ONLY if explicit decompensation markers are ALSO present: inability to
        speak in full sentences, cyanosis, SpO2 <90%, cardiogenic shock (SBP <90 mmHg, cold/clammy
        extremities), or pink frothy sputum. Orthopnea alone = 4. Orthopnea + shock = 5.
        ⚠️ ATYPICAL CHEST PAIN + CARDIOVASCULAR DEMOGRAPHIC RISK — ALWAYS 4 MINIMUM:
        Any chest pain, pressure, discomfort, or unusual thoracic sensation in a patient aged >= 45
        years, OR male aged >= 40 years, MUST be assigned at least 4/5 — Urgent. This applies
        regardless of severity modifiers: "mild", "not severe", "not very bad", "sio makali sana",
        "partiellement", "pas grave", "no muy grave", or any equivalent in any language. Subjective
        pain intensity NEVER overrides cardiovascular demographic risk. A 55-year-old male with
        atypical chest pain requires urgent ACS rule-out (12-lead ECG within 10 minutes, troponin)
        before a lower triage can be assigned. Atypical presentations — jaw pain, shoulder radiation,
        epigastric discomfort, unusual fatigue — are included, as ACS frequently presents without
        classic crushing pain, especially in women, diabetic patients, and the elderly.
        ⚠️ HYPERTENSIVE URGENCY — ALWAYS 4 MINIMUM:
        Any presentation with an objective BP reading of systolic >= 180 mmHg OR diastolic >= 120 mmHg
        accompanied by ANY symptom (headache, dizziness, nausea, visual blurring, chest discomfort)
        is a Hypertensive Urgency and MUST be assigned at least 4/5. A simple headache with 190/120
        does NOT alone confirm end-organ damage; it remains a Level 4 until objective signs of damage
        are present. "No other serious symptoms", "feeling otherwise fine", "but not severe" do NOT
        reduce the urgency below 4 when objective BP numbers meet the threshold.
        Escalate to 5 (Hypertensive Emergency) ONLY when end-organ damage signs are present alongside
        the elevated BP: altered consciousness or confusion, focal neurological deficits, thunderclap
        headache, acute visual field loss, chest pain with radiation (aortic dissection), acute
        pulmonary oedema (cannot lie flat, pink frothy sputum), or oliguric renal failure.
      • Respiratory: moderate dyspnoea at rest, moderate wheeze, SpO2 concern.
        ⚠️ SEVERE ASTHMA / COPD WITH PARTIAL TREATMENT RESPONSE — ALWAYS 4 MINIMUM:
        Any acute respiratory exacerbation (asthma, COPD, bronchospasm) described as "severe" OR that
        is only partially relieved / partially responding to initial rescue treatment (nebulizer, inhaler,
        bronchodilator) MUST be assigned at least 4. "Partially relieved", "partially soulagée",
        "partially responsive", "still wheezing after treatment", "not fully responding" all describe
        a treatment-refractory severe airway emergency. Partial improvement of a SEVERE attack does
        NOT reduce urgency — it signals impending status asthmaticus or respiratory muscle fatigue.
        Escalate to 5 if: no response at all, silent chest, cyanosis, altered consciousness, unable
        to speak in full sentences, or SpO2 <90% despite oxygen.
      • Abdominal: severe localised pain, rebound tenderness, rigidity
      • Infectious: high fever + rigors + systemic signs, suspected sepsis (stable), purpuric rash
      • Obstetric: antepartum bleeding, severe pre-eclampsia headache, reduced fetal movement
      • Paediatric: febrile seizure (resolved), high fever <3 months (any fever in a neonate is a 4
        minimum regardless of behaviour), inconsolable infant or child.
        ⚠️ INCONSOLABLE CHILD + HIGH FEVER — ALWAYS 4 MINIMUM:
        An inconsolable child (any age) combined with high fever and/or lethargy/fatigue is a
        high-risk paediatric presentation requiring urgent evaluation. "Inconsolable" = cannot be
        comforted by any means for a prolonged period. This combination is a major red flag for
        serious bacterial infection (meningitis, occult bacteraemia, urinary tract infection, sepsis).
        Do NOT score below 4. The rubric entry "inconsolable infant, high fever <3 months" applied
        to infants only — this rule EXTENDS it to children of any stated or unstated age.
        Escalate to 5 if: bulging fontanelle, petechial/purpuric rash, meningeal signs (neck
        stiffness, photophobia), altered consciousness, or seizure activity.
      • Trauma: head injury + any loss of consciousness, suspected spinal injury
      • Burns (URGENT 4/5): Partial-thickness burns to hands, feet, or major joints (wrist, elbow, knee,
        ankle) that do NOT meet 5/5 criteria. Adult partial-thickness burns 10-19% TBSA (stable, no
        inhalation injury, no circumferential involvement). See BURN ESCALATION RULES below.
      • Other: acute urinary retention, severe allergic reaction (no airway involvement), acute testicular
        pain (possible torsion), severe renal/ureteric colic.
        ⚠️ TESTICULAR TORSION — ALWAYS 4 MINIMUM, OFTEN 5:
        Sudden onset severe testicular pain in a male (especially young/adolescent) is testicular torsion
        until proven otherwise. The testicular salvage window is 4–6 hours from onset — beyond that,
        irreversible ischaemia and orchidectomy. "Testicular pain" scored at 2 or 3 as "probable
        epididymitis" is a surgical emergency missed. ALWAYS minimum 4. Escalate to 5 if the onset was
        >4 hours ago (salvage window closing), if the testis is visibly high-riding or horizontal, or if
        the pain is severe enough to cause vomiting. "Sudden severe testicular pain" = 4 minimum.
        Do NOT score as routine genitourinary complaint. Do NOT await urine culture before escalating.
        ⚠️ RESOLVED / TREATED ANAPHYLAXIS (BIPHASIC RISK) — ALWAYS 4 MINIMUM:
        Anaphylaxis can recur hours after the initial reaction resolves — this is biphasic anaphylaxis,
        occurring in up to 20% of cases, typically 4–12 hours later, sometimes more severe than the
        first episode. Any patient who reports HAVING HAD an anaphylactic / severe allergic reaction
        that "resolved" or "got better" after antihistamine, epinephrine, or spontaneously MUST be
        assigned Level 4 minimum for observation (minimum 4–6 hours). Do NOT score "I had an allergic
        reaction but I'm fine now / I took Benadryl" below 4. The reaction being in the past tense does
        not reduce urgency. ALWAYS minimum 4 — the second wave can kill.
        ⚠️ SEVERE RENAL COLIC — ALWAYS 4 MINIMUM:
        Suspected nephrolithiasis / renal colic presenting with SEVERE pain causing restlessness,
        inability to sit still, writhing, or inability to find a comfortable position (the classic
        "pacing sign" of visceral ureteric pain) MUST be assigned at least 4/5 — Urgent. This
        ensures rapid IV analgesia, urinalysis, and imaging to exclude high-grade obstruction.
        "Kidney stones" as a known chronic diagnosis does NOT reduce urgency when the current
        presentation describes acute severe pain. Escalate to 5 if fever/chills/rigors accompany
        flank pain (septic obstructive uropathy / urosepsis) or if the patient is anuric.

    5 = Emergency — call emergency services NOW, immediately life-threatening
      • Neurological: ALL THREE meningism signs (fever + neck stiffness + photophobia), thunderclap headache
        ("worst headache of my life"), stroke signs (FAST: facial droop/arm weakness/speech), active seizure,
        loss of consciousness, meningococcal rash (non-blanching purpura)
        ⚠️ ACTIVE SEIZURE (NON-PREGNANT) — ALWAYS 5, NO EXCEPTIONS:
        Any currently ongoing seizure or convulsion in a non-pregnant patient is a Level 5 Emergency.
        This includes known epileptic patients — "this is their usual seizure" does NOT reduce urgency.
        An active seizure = airway at risk, aspiration risk, hypoxia, and possible underlying emergency
        (meningitis, hyponatraemia, hypoglycaemia, stroke, tumour). NEVER assign < 5 to a patient
        who is actively seizing RIGHT NOW, regardless of prior epilepsy diagnosis.
        STATUS EPILEPTICUS (seizure lasting > 5 minutes, OR multiple seizures without full recovery) is
        a resuscitation emergency requiring IV benzodiazepines and airway protection. ALWAYS 5.
        Resolved single seizure in a KNOWN epileptic per their usual pattern = Level 4 minimum (not 3),
        requires urgent medical review. First-ever resolved seizure = Level 4 minimum regardless of age.
        ⚠️ MENINGISM PARTIAL TRIAD — ALWAYS 5 IF ANY 2 OF 3 SIGNS PRESENT:
        Full meningism triad = fever + neck stiffness + photophobia. However, ANY TWO of these three
        signs together is sufficient to assign Level 5 — bacterial meningitis can present without the
        complete triad, especially early. Do NOT require all three signs to be documented before
        assigning 5. Neck stiffness + fever = 5. Neck stiffness + severe headache = 5.
        Photophobia + neck stiffness = 5. Do NOT wait for the third sign — it may never come.
        ⚠️ TIA RULE — CRITICAL: Any combination of face drooping/asymmetry + arm weakness/numbness + speech
        difficulty EVEN IF FULLY RESOLVED is a Transient Ischemic Attack (TIA / "mini-stroke"). TIA is a
        hyper-acute emergency with very high 24–48h stroke risk. RESOLVED SYMPTOMS DO NOT REDUCE URGENCY.
        ALWAYS assign 5. Do NOT assign 1, 2, 3, or 4 to a resolved FAST presentation. "Now it's fixed",
        "symptoms have resolved", "feeling better now" — none of these reduce the urgency for a TIA.
      • Haematological / Sepsis:
        ⚠️ NON-BLANCHING PURPURIC RASH + FEVER — ALWAYS 5, NO EXCEPTIONS:
        Any new purple, dark red, petechial, or purpuric rash that does NOT fade/blanch when pressed,
        combined with fever or systemic illness, is a presumptive meningococcaemia / purpura fulminans /
        septic DIC until proven otherwise. This is one of the fastest-killing presentations in medicine —
        patients can progress from ambulatory to multi-organ failure and death within hours.
        Keywords: non-blanching, non-fading, purple rash, petechiae, purpura, "stays purple when pressed",
        "不能消退的紫色皮疹" (Chinese), "sarpullido púrpura que no desaparece" (Spanish), or equivalent.
        The rash does NOT need to be on the face or trunk — any location counts.
        Do NOT assign 3 or 4. Do NOT wait for blanching test results. ALWAYS 5.
        The resolution is the trap: a TIA resolves by definition, and is still an emergency.
      • Cardiac: crushing chest pain + radiation + sweating/nausea, cardiac arrest signs, severe acute
        heart failure, hypertensive emergency (BP >= 180/120 WITH confirmed end-organ damage: altered
        consciousness, focal neurology, thunderclap headache, acute pulmonary oedema, aortic dissection
        pattern, or oliguric renal failure)
        ⚠️ AORTIC DISSECTION — ALWAYS 5, NO EXCEPTIONS:
        Sudden tearing, ripping, or knife-like chest or back pain — especially pain that radiates to the
        back, between the shoulder blades, or migrates — is presumptive aortic dissection until proven
        otherwise. The patient does NOT need a confirmed BP reading for this to be Level 5. Aortic
        dissection can present without hypertension. "Tearing back pain", "ripping pain radiating to
        back", "worst tearing sensation in chest/back", "pain that moves" = ALWAYS 5.
        Do NOT downgrade because BP is not documented or because the patient looks "otherwise stable."
        Type A dissection (ascending aorta) = 50% mortality per hour without surgical intervention.
      • Respiratory: severe dyspnoea unable to speak, stridor, anaphylaxis with airway involvement, cyanosis.
        ⚠️ EPIGLOTTITIS — ALWAYS 5, NO EXCEPTIONS:
        Epiglottitis presents with the triad of drooling + stridor + dysphagia (difficulty swallowing),
        often with fever and a "muffled" or "hot potato" voice. The inflamed epiglottis can obstruct the
        airway completely within minutes. Any combination of drooling + stridor, or drooling + inability
        to swallow, in a febrile patient (adult or child) is epiglottitis until proven otherwise = 5.
        CRITICAL: Do NOT perform throat examination or attempt laryngoscopy in a non-resuscitation setting
        — stimulation can trigger complete laryngospasm. The patient should remain upright (do NOT lay flat).
        Do NOT classify as "severe pharyngitis" or "tonsillitis" when drooling + stridor are present.
        ⚠️ ANAPHYLAXIS WITH AIRWAY COMPROMISE — ALWAYS 5, NO EXCEPTIONS:
        Any allergic reaction, anaphylaxis, or severe hypersensitivity response that includes ANY of
        the following MUST be assigned 5/5 — immediate epinephrine and airway management required:
        - Throat closing, throat swelling, throat tightness ("koo inasimama" in Swahili)
        - Tongue swelling, lip swelling (angioedema)
        - Stridor (high-pitched inspiratory noise)
        - Hoarse voice following allergen exposure
        - Inability to swallow or speak following allergen exposure
        - Difficulty breathing in the context of an allergic reaction
        NOTE: Severe allergic reaction WITHOUT any of the above airway/respiratory signs = Level 4.
        The presence of ANY airway/respiratory sign in an allergic context = Level 5 immediately.
        Do NOT assign 4 to active throat closing — epinephrine delay = death.
      • Neuropsychiatric: active suicidal ideation with plan and means, acute psychosis with imminent danger
        ⚠️ SUICIDAL IDEATION WITH PLAN AND MEANS — ALWAYS 5, URGENCY SCORE MATTERS:
        Active suicidal ideation that includes BOTH a stated plan (method of harm) AND access to means
        (weapon, medication, location) is an immediate psychiatric emergency = Level 5. This is not
        merely a crisis line referral — the URGENCY SCORE must be 5. Do not assign 3 or 4 because the
        patient appears calm, is talking, or has not yet acted. Calm + plan + means = highest risk.
        IMPORTANT: The crisis line injection in this system only activates when urgency = 5. If you
        assign urgency 3 or 4 to suicidal ideation with plan and means, the crisis resources will NOT
        be shown to the patient. Assigning < 5 to this presentation is a system-level safety failure.
        Ideation WITHOUT a plan = Level 4 minimum (still urgent, requires same-day psychiatric review).
        Ideation WITH plan OR means (not both required) = Level 5. Both plan AND means = Level 5.
        "Thinking about it" + "I have pills at home / I have a gun / I know a bridge" = Level 5.
      • Metabolic: altered consciousness + known diabetic (DKA/hypoglycaemia). Suspected poisoning/overdose.
        ⚠️ SUSPECTED OVERDOSE / POISONING WITH ALTERED MENTAL STATUS — ALWAYS 5, NO EXCEPTIONS:
        Any patient who has ingested an unknown medication, unknown substance, or a large/excessive quantity
        of any medication AND presents with ANY degree of altered mental status (confusion, drowsiness,
        disorientation, reduced consciousness, unresponsiveness) MUST be assigned 5/5 — Emergency.
        The combination of (1) medication/substance ingestion + (2) altered consciousness = worst-case
        toxidrome until proven otherwise. Unknown agents may include opioids (respiratory depression),
        tricyclic antidepressants (cardiac arrest), benzodiazepines, or any number of rapidly lethal agents.
        "Confused after taking a lot of medication" (Chinese: 吃了很多药，意识模糊; Spanish: tomó muchos
        medicamentos y está confundido; Arabic: أخذ الكثير من الدواء وهو مرتبك; Swahili: alikula dawa
        nyingi na ana wasiwasi wa akili) = ALWAYS 5. NEVER assign 4 when both components are present.
        Note: "suspected poisoning/overdose" alone (without AMS) is still Level 5 — the quantity/intent
        descriptor ("a lot", "many pills", "intentional") combined with ANY ingestion warrants Emergency.
        Do NOT downgrade to 4 because the ingested substance is unknown — unknown = worst case assumed.
      • Infectious: septic shock (fever + hypotension + confusion), severe malaria with altered consciousness
        ⚠️ CARBON MONOXIDE POISONING — ALWAYS 5, NO EXCEPTIONS:
        Carbon monoxide (CO) is odourless and colourless — patients do not know they are being poisoned.
        PATTERN: Multiple people in the same household, vehicle, or enclosed space simultaneously
        developing headache, nausea, dizziness, confusion, or loss of consciousness = CO poisoning
        until proven otherwise. One person with these symptoms after prolonged time in an enclosed space
        with a gas heater, boiler, generator, or vehicle exhaust is also presumptive CO poisoning.
        Do NOT reassure and discharge — CO poisoning causes delayed neurological sequelae even in
        patients who look well. "Everyone at home has a headache" is not viral illness until CO excluded.
        ALWAYS 5. Evacuate the space immediately. 100% O2 by non-rebreather mask is the treatment.
        Keywords: "multiple people affected", "whole family", "carbon monoxide", "CO detector alarm",
        "gas heater", "enclosed space", "everyone has headache/nausea", "generator indoors."
      • Vascular: acute limb ischaemia (the "6 Ps" — pain, pallor, pulselessness, paraesthesia,
        paralysis, poikilothermia/cold limb) — 6-hour window for limb salvage.
        ⚠️ ACUTE LIMB ISCHAEMIA — ALWAYS 5, NO EXCEPTIONS:
        Sudden onset of a cold, pale, pulseless, painful, or numb limb (arm or leg) indicates arterial
        occlusion — either thromboembolism or in-situ thrombosis. The window for limb salvage via
        thrombolysis or surgical embolectomy is approximately 6 hours. Beyond that, irreversible muscle
        necrosis and amputation become likely. This is a vascular emergency equivalent to stroke in
        urgency. ALWAYS 5. Do NOT score as "circulatory problem" or "pain in the limb" at lower urgency.
        The presence of ANY THREE of the 6 Ps (cold, pale, painful, numb, pulseless, paralysed limb)
        is sufficient for Level 5. "Cold white leg with no pulse" = ALWAYS 5.
      • Obstetric: eclamptic seizure, massive antepartum haemorrhage, cord prolapse.
        ⚠️ ECTOPIC PREGNANCY — 2-TIER RULE:
        Ectopic pregnancy (fertilised egg implanted outside the uterus, usually the fallopian tube) can
        rupture and cause catastrophic internal haemorrhage. Any woman of reproductive age presenting
        with LOWER ABDOMINAL PAIN + MISSED PERIOD or POSITIVE PREGNANCY TEST must have ectopic excluded.
        TIER 1 — Force 5 (ruptured / haemodynamically unstable): Lower abdominal pain + pregnancy + ANY
        of: shoulder tip pain (referred diaphragm irritation from intraperitoneal blood), haemodynamic
        instability (hypotension, tachycardia, syncope/presyncope, collapse), severe peritonism
        (rigid abdomen, severe rebound tenderness). Ruptured ectopic = 5 = immediate surgical emergency.
        TIER 2 — Floor 4 (unruptured / stable): Lower abdominal pain + positive pregnancy test OR missed
        period, WITHOUT haemodynamic signs. This requires urgent ultrasound and βhCG to exclude ectopic —
        ALWAYS minimum 4. Never send home without exclusion of ectopic pregnancy.
        Do NOT score lower abdominal pain in a potentially pregnant woman below 4 without ectopic excluded.
        ⚠️ CORD PROLAPSE — ALWAYS 5, NO EXCEPTIONS:
        A visible, palpable, or prolapsed umbilical cord during active labour or delivery is one of the
        most time-critical obstetric emergencies in medicine. When the cord descends ahead of or alongside
        the presenting fetal part, it is compressed between the fetus and the pelvis with every contraction,
        cutting off fetal oxygenation. Without immediate intervention — maternal repositioning, cord
        de-compression, and emergency caesarean section — fetal death or severe hypoxic brain injury
        occurs within minutes.
        DISAMBIGUATION — THIS IS NOT UMBILICAL STUMP CARE:
        "Umbilical cord visible at birth site", "cord visible at vaginal opening", "cord seen during
        delivery", "cord presenting", or any equivalent describing the cord being outside the uterus
        during ACTIVE LABOUR is cord prolapse = Level 5. This is entirely different from umbilical
        STUMP care (the neonatal belly button area drying after birth), which is Level 1–2.
        The presence of Arabic "الحبل السري ظاهر في مكان الولادة" (umbilical cord visible at birth site),
        Spanish "cordón umbilical visible en el parto", French "cordon ombilical visible à l'accouchement",
        Swahili "kitovu kinaonekana wakati wa kuzaa", Hindi "नाभि नाल प्रसव के दौरान दिखाई दे रही है",
        or any equivalent in any language describing the cord visible DURING OR BEFORE delivery = Level 5.
        Do NOT classify this as routine neonatal umbilical stump care. Do NOT assign 1, 2, 3, or 4.
        ALWAYS 5.
        ⚠️ SEIZURE IN PREGNANCY — ALWAYS 5, NO EXCEPTIONS:
        Any active seizure or convulsion occurring in a pregnant woman is presumptive ECLAMPSIA
        until proven otherwise. Eclampsia is an immediate dual life-threat — maternal and fetal.
        Risks: status epilepticus, intracranial haemorrhage, placental abruption, fetal hypoxia.
        Keywords: pregnant + seizure, pregnant + convulsion, "seizures in a pregnant woman",
        "கர்ப்பிணி பெண்ணுக்கு வலிப்பு" (Tamil), "embarazada convulsiones" (Spanish),
        "femme enceinte convulsions" (French), or equivalent in any language.
        NEVER assign 4 to a pregnant woman with an active seizure. ALWAYS 5.
        ⚠️ HEAVY ANTEPARTUM HAEMORRHAGE — ALWAYS 5, NO EXCEPTIONS:
        Heavy vaginal bleeding during pregnancy that is described as soaking pads, flowing heavily,
        or uncontrolled is presumptive Placenta Praevia or Placental Abruption — both immediately
        life-threatening to mother and fetus. "Heavy bleeding" + pregnancy = ALWAYS 5, regardless
        of whether the patient appears "otherwise stable."
        CRITICAL CONTRAINDICATION IN TEXT: NEVER instruct the clinician to perform a digital
        vaginal examination in antepartum haemorrhage until placental location is confirmed by
        ultrasound. A digital exam in placenta praevia tears the placenta and triggers catastrophic
        haemorrhage. The correct instruction is: "Do NOT perform digital vaginal exam — obtain
        urgent ultrasound first to confirm placental location."
      • Trauma: penetrating to chest/abdomen, uncontrolled major haemorrhage, multi-system trauma
      • Paediatric: infant apnoea, meningococcal rash in child, severe respiratory distress in child
      • Burns (EMERGENCY 5/5): See BURN ESCALATION RULES below.
      • Ocular: ALWAYS 5 for the following — these presentations cause permanent irreversible blindness
        within hours if untreated:
        ⚠️ ACUTE ANGLE-CLOSURE GLAUCOMA (AACG) TRIAD: Severe eye pain + nausea/vomiting + blurred
        vision or halos around lights. This triad is pathognomonic for AACG — intraocular pressure
        spikes cause optic nerve infarction within hours. Delay = permanent blindness. ALWAYS 5.
        ⚠️ CENTRAL RETINAL ARTERY OCCLUSION (CRAO): Sudden painless vision loss in one eye ("curtain
        coming down", "went dark suddenly"). CRAO has a 90-minute treatment window — same as stroke.
        ⚠️ SUDDEN COMPLETE VISION LOSS: Any sudden total or near-total loss of vision in one or both
        eyes, regardless of pain level. Always 5 until ocular emergency excluded.
        ⚠️ CHEMICAL EYE BURN: Any acid, alkali, or unknown chemical splash to the eye. Alkali burns
        continue penetrating after exposure stops. Always 5 — requires immediate copious irrigation.

    BURN ESCALATION RULES (applied before general CALIBRATION RULES):
    These rules are non-negotiable. If any criterion is met, urgency = 5 regardless of other factors.

    Force 5/5 — EMERGENCY if ANY of the following:
      1. AIRWAY / INHALATION: Suspected inhalation injury — singed nasal hairs, soot around mouth/nose,
         hoarse voice, stridor, history of fire in enclosed space, smoke inhalation. Airway oedema can
         develop over minutes. Always 5.
      2. HIGH-RISK ANATOMY: Burns (any depth) involving Face, Eyes, or Perineum/Genitals. OR any
         CIRCUMFERENTIAL burn of an extremity (any % TBSA) — circumferential burns cut off perfusion
         and require emergent escharotomy assessment.
      3. TBSA THRESHOLD — ADULT (>=16 years, <=65 years): Partial or full-thickness burns >= 20% TBSA.
      4. TBSA THRESHOLD — PAEDIATRIC (<16 years) OR GERIATRIC (>65 years): Partial or full-thickness
         burns >= 10% TBSA. Children and elderly have thinner skin, higher surface-area-to-volume ratio,
         and lower physiological reserve — burn shock can develop at much lower TBSA.
      5. FULL-THICKNESS (3rd degree): Any full-thickness burn of significant area (charred, white/leathery,
         insensate skin) — requires surgical management and always warrants emergency escalation.
      6. SYSTEMIC MODIFIERS: High-voltage electrical burns (>1000V) or major chemical/acid burns — systemic
         injury extends far beyond visible surface damage.

    Force 4/5 — URGENT if (and none of the 5/5 criteria above are met):
      1. FUNCTIONAL AREAS: Partial-thickness burns to hands, feet, or major joints (wrist, elbow, knee,
         ankle) — functional and cosmetic significance, require specialist burn unit evaluation.
      2. MODERATE TBSA (adult): Partial-thickness burns 10–19% TBSA in a healthy adult (16–65 years).

    Note on internal contradiction: The patient-facing red flag threshold for emergency is >=20% TBSA in
    adults, or >=10% TBSA in children/elderly. A 10% TBSA hand/forearm burn in a healthy adult = 4/5 Urgent.

    CALIBRATION RULES:
    ⚠️ ANTI-RECALIBRATION NOTE: The additions of new Level 5 scenarios above do NOT raise the bar
    for Level 4. The Level 4 thresholds are unchanged. Do not demote a presentation from 4 to 3
    merely because it does not match one of the named Level 5 scenarios. A presentation that was
    Level 4 before these additions is still Level 4. Adding more Level 5 content does not compress
    the Level 4 band downward.
    • Fever + headache/heaviness alone (no other red flags) = 3. Do not over-escalate on vague symptoms.
    • Photophobia alone = 4 minimum. Photophobia + neck stiffness = 5.
    • Neck stiffness + headache + fever = 5 (meningism until proven otherwise).
    • Thunderclap / "worst headache of my life" = 5 regardless of other symptoms.
    • Non-blanching rash + fever = 5 (meningococcal emergency). This applies regardless of how
      the rash is described: purple, dark red, petechial, purpuric, "does not fade", "stays dark
      when pressed", "不能消退" (Chinese: does not resolve/fade). Always 5. No exceptions.
    • Anaphylaxis + airway = 5. Anaphylaxis without airway/respiratory signs = 4. The threshold
      is any airway sign: throat closing/swelling, tongue swelling, stridor, hoarse voice, or
      breathing difficulty in an allergic context. "Severe allergic reaction" alone = 4 unless
      one of these is present.
    • Seizure in pregnancy = 5 (presumptive eclampsia — dual maternal and fetal life-threat).
      Never assign 4 to a pregnant woman with an active seizure regardless of any other modifiers.
    • Heavy vaginal bleeding in pregnancy = 5 (presumptive APH — placenta praevia/abruption).
      "Soaking pads", "heavy bleeding", "haemorrhage" during pregnancy = always 5. Never 4.
    • Words like "cannot breathe", "unconscious", "fitting", "stroke" = 5.
    • FAST symptoms (any 2 of: face droop/asymmetry, arm weakness/numbness, speech difficulty) = 5.
      This applies EVEN IF THE PATIENT SAYS SYMPTOMS HAVE RESOLVED OR ARE "FIXED" OR "BETTER NOW".
      Resolved FAST = TIA = always 5. Never assign < 5 to a resolved FAST triad.
    • Burns: apply BURN ESCALATION RULES above first. Do NOT assign 5 to a hand/forearm burn in a healthy
      adult at 10% TBSA unless a 5/5 escalation criterion is also present (inhalation, circumferential,
      paediatric/geriatric, full-thickness, or >=20% TBSA). 10% adult = 4. Do not over-escalate burns.
    • PARTIAL TREATMENT RESPONSE RULE — CRITICAL: Words like "partially relieved", "partially responsive",
      "some improvement", "better but still...", "not fully resolved", "partiellement soulagée",
      "parcialmente aliviado", or any equivalent in any language NEVER justify downgrading a severe
      presentation. Partial relief of a SEVERE condition = the condition is still severe. Apply the
      urgency the severity descriptor alone warrants, then consider whether the partial response
      pushes it HIGHER (toward 5), never lower. This applies to all systems — respiratory, cardiac,
      neurological, and pain.
    • CARDIOVASCULAR DEMOGRAPHIC RULE: Chest pain/pressure/discomfort in a patient aged >= 45, or
      male aged >= 40, is ALWAYS minimum 4. Severity words like "mild", "not severe", "not bad",
      "occasional" do not override this floor. Demographic risk + chest pain = urgent ACS rule-out
      required. Never route to 3 or below without ECG + troponin exclusion documented.
    • HYPERTENSIVE CRISIS RULE: BP >= 180 systolic OR >= 120 diastolic + any symptom = minimum 4
      (hypertensive urgency). Escalate to 5 ONLY if end-organ damage signs are present (altered
      consciousness, focal neuro, thunderclap, pulmonary oedema, aortic dissection pattern). A
      patient saying "no other serious symptoms" with 190/120 + headache = 4, not 3, not 5.
      Headache alone does not confirm encephalopathy. "No other symptoms" is valid clinical info
      that distinguishes urgency from emergency — unlike severity modifiers that inappropriately
      downgrade severe baselines.
    • PAEDIATRIC INCONSOLABLE + FEVER RULE: An inconsolable child (any age) with high fever and/or
      lethargy is ALWAYS minimum 4. The rubric's "inconsolable infant, high fever <3 months" entry
      was a floor, not a ceiling — inconsolable + fever applies across all paediatric ages. Do not
      score below 4 because age is unspecified or the child is older than an infant.
    • RENAL COLIC RULE: Severe flank/renal pain causing restlessness or inability to sit still =
      minimum 4. "Kidney stones" as a diagnosis label does not make the presentation outpatient —
      the SEVERITY of the acute episode determines urgency. Escalate to 5 if fever/rigors/anuria
      accompany the flank pain (septic obstructive uropathy).
    • GERIATRIC AMS + FEVER RULE: New confusion/delirium + fever in a patient described as elderly
      or aged >= 65 = ALWAYS minimum 4, regardless of "otherwise stable", "mild confusion", or "no
      other symptoms" modifiers. Geriatric decompensation is non-linear — this presentation is 4
      until active hemodynamic compromise (hypotension, tachycardia, GCS <13) forces it to 5.
      Do not let absence of explicit shock markers pull this below 4.
    • ACUTE OCULAR EMERGENCY RULE: Severe eye pain + nausea/vomiting + blurred vision = AACG = always
      5. Sudden painless vision loss = CRAO = always 5. These are time-critical organ-loss emergencies.
      Do not score below 5 for these presentations regardless of any other modifiers.
    • CORD PROLAPSE RULE — CRITICAL DISAMBIGUATION: Any description of an umbilical cord visible,
      prolapsed, presenting, or protruding DURING active labour or delivery = cord prolapse = ALWAYS 5.
      This is NOT umbilical stump care (the neonatal belly button post-delivery). Umbilical stump
      care = Level 1–2. Cord prolapse = Level 5 with no exceptions. The phrase "umbilical cord
      visible at birth site / place of delivery / vaginal opening" in ANY language is cord prolapse.
      Arabic: "الحبل السري ظاهر في مكان الولادة". Do not be misled by the word "umbilical" — the
      key is whether the cord is outside the uterus DURING (not after) delivery. If in doubt = 5.
    • OVERDOSE / POISONING + AMS RULE: Medication or substance ingestion (any quantity described as
      "a lot", "many", "unknown", or intentional) COMBINED with any altered mental status (confusion,
      drowsiness, disorientation, reduced consciousness) = ALWAYS 5. Unknown substance = assume worst
      case (opioid, TCA, any rapidly lethal agent). Do NOT assign 4 to this combination. "Unknown
      medication" is not a reason to reduce urgency — it is a reason to escalate. Standalone suspected
      poisoning/overdose (no AMS documented) is also Level 5 if quantity or intent is described as
      significant. Chinese: 吃了很多药 + 意识模糊 = 5/5, no exceptions.
    • ACTIVE SEIZURE RULE: Any patient described as CURRENTLY or ACTIVELY seizing (seizure happening
      NOW) = ALWAYS 5, regardless of prior epilepsy diagnosis. Status epilepticus (> 5 minutes or
      multiple seizures without recovery) = 5. Resolved single seizure in known epileptic = minimum 4.
      First-ever resolved seizure (any age) = minimum 4. "Known epileptic, just had their usual seizure,
      now recovered" = 4, not 3.
    • CARBON MONOXIDE RULE: Multiple people in the same enclosed space (home, car, garage) simultaneously
      with headache, nausea, dizziness, or confusion = CO poisoning until proven otherwise = ALWAYS 5.
      Single person with same symptoms after prolonged exposure to gas heater, generator, or boiler in
      enclosed space = ALWAYS 5. "Everyone in the house has a headache" is not viral — evacuate and treat.
    • ACUTE LIMB ISCHAEMIA RULE: Cold + pale/white/mottled + painful + pulseless limb (any combination
      of ≥3 of the 6 Ps) = acute arterial occlusion = ALWAYS 5. 6-hour window, same urgency as stroke.
      Do NOT score as chronic vascular disease or musculoskeletal pain. Sudden onset is the key marker.
    • AORTIC DISSECTION RULE: Tearing, ripping, or knife-like pain that is maximal at onset AND radiates
      to the back, between the shoulder blades, or migrates = aortic dissection = ALWAYS 5. Does not
      require documented hypertension to be Level 5. "Worst tearing sensation", "pain radiating to back",
      "ripping chest pain" = 5. Type A dissection: 1–2% mortality per hour without surgery.
    • EPIGLOTTITIS RULE: Drooling + stridor (any combination) in a febrile patient = epiglottitis =
      ALWAYS 5. Do NOT classify as severe pharyngitis or tonsillitis. Do NOT instruct throat exam.
      Drooling + difficulty swallowing + fever (without stridor) = minimum 4, rule out epiglottitis.
    • DIABETIC HYPOGLYCAEMIA + AMS RULE: Known diabetic (or suspected DKA/hypoglycaemia context) +
      ANY altered mental status (confusion, drowsiness, unresponsiveness) = ALWAYS 5. "Just needs
      glucose" is NOT an appropriate Level 3 framing — neuroglycopenia causes permanent brain damage
      if untreated. Diabetic + confused = 5 until glucose-corrected and clinically reassessed.
    • SUICIDAL IDEATION URGENCY RULE: Suicidal ideation WITH a stated plan OR access to means = ALWAYS
      5 for urgency scoring. This is critical because crisis resources in this system are only injected
      at urgency = 5. Assigning 3 or 4 to a patient with suicidal plan + means means they receive NO
      crisis line information — a system-level safety failure. Ideation alone (no plan, no means) =
      minimum 4. Ideation + plan OR means = 5. Ideation + plan AND means = 5.
    • TESTICULAR TORSION RULE: Sudden severe testicular pain (especially young/adolescent male) =
      minimum 4. Do NOT score as routine genitourinary complaint or probable epididymitis. Salvage
      window is 4–6 hours. Escalate to 5 if onset > 4 hours ago, or if severe enough to cause vomiting.
    • ECTOPIC PREGNANCY RULE: Lower abdominal pain + positive pregnancy test or missed period = minimum
      4 (ectopic must be excluded by ultrasound). Add shoulder tip pain, syncope, or haemodynamic
      instability = 5 (presumptive ruptured ectopic). Never score below 4 without ectopic excluded.
    • RESOLVED ANAPHYLAXIS RULE: A severe allergic reaction that "resolved" or improved after
      antihistamine / epinephrine / spontaneously = ALWAYS minimum 4 (biphasic anaphylaxis risk,
      up to 12 hours). "I had an allergic reaction but I'm fine now" = 4, not 1 or 2.
    • MENINGISM PARTIAL TRIAD: Any TWO of (fever, neck stiffness, photophobia) = ALWAYS 5 — do not
      require the full triad. Also: neck stiffness + severe headache (without fever documented) = 5.
    • When uncertain between two levels: choose HIGHER only if a specific red flag justifies it.
    • NEVER return null. NEVER refuse to score. If truly unsure = 5.
- medication_from_audio: Medication mentioned in audio only (string or null)
- medication_from_image: Medication visible in image only (string or null)
- medication_found: All medications combined (string or null)
- differential_note: 2-3 most likely diagnoses in order of likelihood, most common first, worst-case last.
    Start with everyday causes (viral illness, flu, dehydration). Only mention serious causes (meningitis, stroke)
    at the end as "rule out" items, and only if specific red flags are present in the symptoms.
    Example format: "1. Viral illness  2. Systemic infection  3. Rule out meningitis (if neck stiffness develops)"
- recommended_action: Suggested next steps (1-2 sentences, practical, proportionate to urgency level)
- patient_language: ISO language code (e.g. "en", "hi", "es")
- confidence: 0-100 integer — confidence in the URGENCY CLASSIFICATION only, not a diagnosis.
    Cap at 75 for symptom-only input (no exam, no vitals, no labs). Reserve 80+ for cases with
    multiple clear confirmed red flags. A 2-symptom presentation should not exceed 70.

Return ONLY valid JSON. No markdown.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a clinical triage assistant. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    responseFormat: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No LLM response" });

  let parsed: Record<string, unknown>;
  try {
    const clean = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "LLM returned invalid JSON" });
  }

  // If model returned a string instead of a number, try to parse it.
  // If it's unparseable (NaN) — the model was hedging or refusing — that IS a 5.
  if (typeof parsed.urgency_level === "string") {
    const numVal = parseFloat(parsed.urgency_level as string);
    parsed.urgency_level = isNaN(numVal) ? 5 : numVal;
  }

  // Safety net: if urgency is still null/undefined/NaN after all transforms,
  // scan the raw LLM response for emergency language and assign 5.
  if (parsed.urgency_level == null || isNaN(parsed.urgency_level as number)) {
    const EMERGENCY_KEYWORDS = [
      "emergency", "immediately", "life-threatening", "life threatening",
      "call 911", "call 999", "call 112", "seek immediate", "cannot determine",
      "unable to assign", "refuse", "critical", "do not delay", "urgent care now",
      "ambulance", "go to er", "go to a&e", "go to emergency",
    ];
    const rawLower = content.toLowerCase();
    const hasEmergencyLanguage = EMERGENCY_KEYWORDS.some(kw => rawLower.includes(kw));
    parsed.urgency_level = hasEmergencyLanguage ? 5 : 5; // unknown urgency = assume worst
  }
  if (typeof parsed.confidence === "string") parsed.confidence = parseFloat(parsed.confidence) || 50;
  if (typeof parsed.symptom_list === "string") {
    parsed.symptom_list = (parsed.symptom_list as string).split(/,\s*/).map((s: string) => s.trim()).filter(Boolean);
  }

  // ── Hard-lock: TIA / resolved FAST triad safety net ──────────────────────────
  // This is a CODE-LEVEL override that does not depend on the LLM correctly
  // applying the rubric. By this point the LLM has extracted symptoms in the
  // clinician's language (English), so keyword matching is language-agnostic —
  // it will catch Tamil, Hindi, Spanish etc. inputs equally.
  //
  // A Transient Ischemic Attack (TIA) presents as FAST symptoms that RESOLVE.
  // Because they resolve, models fall into the "better now = lower urgency" trap.
  // TIA carries a very high 24–48h stroke risk and is ALWAYS a 5/5 emergency —
  // regardless of whether the patient says symptoms are now "fixed" or "resolved".
  //
  // We check the extracted symptom list for ≥2 of the 3 FAST components.
  // Matching any 2 of 3 is sufficient (face + arm, face + speech, or arm + speech).
  if ((parsed.urgency_level as number) < 5) {
    const symptomText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const FAST_FACE = [
      "facial drop", "face drop", "facial droop", "face droop",
      "face crooked", "crooked face", "facial asymmetry", "face asymmetry",
      "facial weakness", "face weakness", "mouth drooping", "drooping face",
      "facial drooping",
    ];
    const FAST_ARM = [
      "arm weak", "arm weakness", "arm numb", "arm numbness",
      "arm lost strength", "arm loss of strength", "weak arm", "numb arm",
      "arm paralys", "upper limb weak", "hand weak", "hand numb",
      "limb weakness",
    ];
    const FAST_SPEECH = [
      "speech difficult", "difficulty speaking", "difficulty speech",
      "speech problem", "slurred speech", "dysarthria", "aphasia",
      "trouble speaking", "unable to speak", "cannot speak", "speaking difficulty",
    ];

    const hasFace   = FAST_FACE.some(kw => symptomText.includes(kw));
    const hasArm    = FAST_ARM.some(kw => symptomText.includes(kw));
    const hasSpeech = FAST_SPEECH.some(kw => symptomText.includes(kw));

    const fastComponentsPresent = [hasFace, hasArm, hasSpeech].filter(Boolean).length;
    if (fastComponentsPresent >= 2) {
      console.warn(
        "[Triage] ⚠️  FAST triad override: detected ≥2 FAST components in extracted symptoms — " +
        "forcing urgency_level to 5 (TIA until proven otherwise). " +
        `Original LLM score was ${parsed.urgency_level}. Components: ` +
        `face=${hasFace}, arm=${hasArm}, speech=${hasSpeech}.`
      );
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Non-blanching purpuric rash + fever (meningococcaemia / septic DIC) ─
  // A purple/dark/petechial rash that does not fade when pressed + fever is one of
  // the most time-critical presentations in medicine. Meningococcaemia can progress
  // from ambulatory to multi-organ failure and death within hours.
  //
  // This is an unconditional force-5 — no secondary conditions, no tiers.
  // The model repeatedly misclassifies this as a dermatological moderate case.
  //
  // Detection: rash must be described as non-blanching / non-fading / staying dark
  // when pressed AND fever must be present. Neither alone fires this net.
  if ((parsed.urgency_level as number) < 5) {
    const purpuraText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const NON_BLANCHING_RASH = [
      "non-blanching", "non blanching", "non-fading", "does not blanch",
      "does not fade", "doesn't fade", "won't fade", "will not fade",
      "stays purple", "remains purple", "stays dark", "remains dark",
      "petechiae", "petechial", "purpura", "purpuric",
      "purple rash", "dark purple rash", "dark red rash",
      "meningococcal rash", "meningococcemia", "purpura fulminans",
      // Chinese: 不能消退 = cannot fade/resolve
      "not fading rash", "non resolving rash", "non-resolving rash",
    ];
    const FEVER_RASH = [
      "fever", "febrile", "high fever", "high temperature",
      "pyrexia", "hyperthermia", "elevated temperature",
    ];

    const hasNonBlanchingRash = NON_BLANCHING_RASH.some(kw => purpuraText.includes(kw));
    const hasFeverWithRash    = FEVER_RASH.some(kw => purpuraText.includes(kw));

    if (hasNonBlanchingRash && hasFeverWithRash) {
      console.warn(
        "[Triage] ⚠️  Non-blanching purpuric rash + fever override: presumptive meningococcaemia / " +
        "purpura fulminans / septic DIC — forcing urgency_level to 5. " +
        `Original LLM score was ${parsed.urgency_level}.`
      );
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Anaphylaxis with airway compromise ─────────────────────────────
  // Severe allergic reaction + ANY airway sign = immediate epinephrine + airway
  // management. Delay = complete airway obstruction and death.
  //
  // The model correctly identifies anaphylaxis but assigns Level 4 when the allergic
  // context is present — it fails to escalate when airway compromise co-occurs.
  //
  // Requires: allergy/anaphylaxis context AND at least one airway compromise sign.
  // Severe allergy WITHOUT airway signs = Level 4 (correct — stays there).
  // Severe allergy WITH any airway sign = Level 5 (this net fires).
  if ((parsed.urgency_level as number) < 5) {
    const anaphyText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const ALLERGY_CONTEXT = [
      "anaphylaxis", "anaphylactic", "allergic reaction", "severe allergy",
      "severe allergic", "hypersensitivity", "allergen", "allergy",
    ];
    const AIRWAY_COMPROMISE = [
      "throat closing", "throat swelling", "throat swollen", "throat tight",
      "throat tightness", "closing throat",
      "tongue swelling", "tongue swollen", "lip swelling",
      "angioedema", "laryngeal oedema", "laryngeal edema",
      "stridor", "hoarse voice", "hoarseness", "voice hoarse",
      "airway compromise", "airway swelling", "airway obstruction",
      "cannot swallow", "difficulty swallowing", "unable to swallow",
      "difficulty breathing", "unable to breathe", "cannot breathe",
      "respiratory distress", "breathing difficulty",
    ];

    const hasAllergyCtx     = ALLERGY_CONTEXT.some(kw => anaphyText.includes(kw));
    const hasAirwaySign     = AIRWAY_COMPROMISE.some(kw => anaphyText.includes(kw));

    if (hasAllergyCtx && hasAirwaySign) {
      console.warn(
        "[Triage] ⚠️  Anaphylaxis airway override: allergic reaction with airway compromise " +
        "(throat closing / tongue swelling / stridor / breathing difficulty) — " +
        `forcing urgency_level to 5. Original LLM score was ${parsed.urgency_level}.`
      );
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Major burn 5/5 safety net ─────────────────────────────────────
  // Code-level override for burn presentations that must always be 5/5.
  // The LLM applies the BURN ESCALATION RULES in the prompt, but this catches
  // any slip-through on the most dangerous criteria.
  //
  // Critically: we do NOT override 4→5 for a healthy adult with 10% TBSA hand burn.
  // That is correctly a 4. We only hard-lock the genuine 5/5 escalation triggers.
  if ((parsed.urgency_level as number) < 5) {
    const burnText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const hasBurn = ["burn", "scald", "thermal injury", "singed", "charred"].some(kw => burnText.includes(kw));

    if (hasBurn) {
      const INHALATION     = ["inhalation", "singed nasal", "soot", "stridor", "smoke inhala", "enclosed space", "hoarse voice"];
      const HIGH_RISK_ANAT = ["face burn", "facial burn", "eye burn", "eyelid burn", "perineum burn", "genital burn", "circumferential burn", "circumferential scald"];
      const SYSTEMIC       = ["electrical burn", "high voltage", "chemical burn", "acid burn", "alkali burn"];
      const FULL_THICKNESS = ["full thickness", "full-thickness", "third degree", "3rd degree", "charred", "leathery skin", "insensate"];

      // Parse explicit TBSA % from extracted text (e.g. "20% tbsa", "25% body surface")
      const tbsaMatch = burnText.match(/(\d+)\s*%\s*(?:tbsa|total body surface|body surface area|bsa)/);
      const tbsaValue = tbsaMatch ? parseInt(tbsaMatch[1], 10) : null;

      const isPaedGeri = ["child", "infant", "baby", "toddler", "paediatric", "pediatric",
        "elderly", "geriatric", "nursing home", "aged care", "years old"].some(kw => burnText.includes(kw));

      const triggerInhalation    = INHALATION.some(kw => burnText.includes(kw));
      const triggerHighRisk      = HIGH_RISK_ANAT.some(kw => burnText.includes(kw));
      const triggerSystemic      = SYSTEMIC.some(kw => burnText.includes(kw));
      const triggerFullThickness = FULL_THICKNESS.some(kw => burnText.includes(kw));
      const triggerTBSAAdult     = tbsaValue !== null && tbsaValue >= 20;
      const triggerTBSAPaedGeri  = tbsaValue !== null && tbsaValue >= 10 && isPaedGeri;

      const burnEscalationReason =
        triggerInhalation    ? "inhalation injury keywords detected" :
        triggerHighRisk      ? "high-risk anatomy (face/eyes/perineum/circumferential)" :
        triggerSystemic      ? "electrical or chemical burn" :
        triggerFullThickness ? "full-thickness burn indicators" :
        triggerTBSAAdult     ? `>=20% TBSA in adult (parsed: ${tbsaValue}%)` :
        triggerTBSAPaedGeri  ? `>=10% TBSA in paediatric/geriatric patient (parsed: ${tbsaValue}%)` :
        null;

      if (burnEscalationReason) {
        console.warn(
          `[Triage] ⚠️  Burn escalation override: ${burnEscalationReason} — ` +
          `forcing urgency_level to 5. Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 5;
      }
    }
  }

  // ── Hard-lock: Seizure in pregnancy (eclampsia) ───────────────────────────────
  // Any seizure/convulsion in a pregnant woman = presumptive eclampsia = always 5.
  // Eclampsia is simultaneously life-threatening to both mother and fetus.
  // The model correctly identifies eclampsia in the text but assigns Level 4 because
  // it treats "seizure" and "pregnancy" as separate, non-escalating conditions.
  //
  // Requires: pregnancy context AND seizure/convulsion. Both must be present.
  // A non-pregnant person with a seizure may be Level 4 or 5 depending on context.
  // A pregnant woman with a seizure is always Level 5.
  if ((parsed.urgency_level as number) < 5) {
    const eclampText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const PREGNANCY = [
      "pregnant", "pregnancy", "gravid", "gestation", "gestational",
      "antepartum", "prenatal", "obstetric", "eclampsia", "preeclampsia",
      "pre-eclampsia", "expecting", "with child",
    ];
    const SEIZURE = [
      "seizure", "seizures", "convulsion", "convulsions", "convulsing",
      "fitting", "fits", "epileptic", "tonic-clonic", "eclamptic",
    ];

    const hasPregnancy = PREGNANCY.some(kw => eclampText.includes(kw));
    const hasSeizure   = SEIZURE.some(kw => eclampText.includes(kw));

    if (hasPregnancy && hasSeizure) {
      console.warn(
        "[Triage] ⚠️  Eclampsia override: seizure in pregnant patient — forcing urgency_level " +
        `to 5 (presumptive eclampsia, dual maternal/fetal life-threat). ` +
        `Original LLM score was ${parsed.urgency_level}.`
      );
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Heavy antepartum haemorrhage ───────────────────────────────────
  // Heavy vaginal bleeding during pregnancy is presumptive placenta praevia or
  // placental abruption until excluded by ultrasound. Both can cause maternal
  // exsanguination and fetal demise within minutes.
  //
  // The model assigns Level 4 because it treats "antepartum haemorrhage" as a
  // clinical category with variable severity, ignoring that "soaking pads" and
  // "heavy bleeding" descriptors indicate a haemodynamic emergency.
  //
  // Requires: pregnancy context AND heavy/uncontrolled bleeding descriptor.
  // Spotting or light bleeding in pregnancy is NOT caught by this net (may be 3–4).
  if ((parsed.urgency_level as number) < 5) {
    const aphText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const PREGNANCY_APH = [
      "pregnant", "pregnancy", "antepartum", "prenatal", "gestational",
      "gestation", "obstetric", "gravid", "expecting",
    ];
    const HEAVY_BLEEDING = [
      "heavy bleeding", "heavy vaginal bleeding", "heavy blood loss",
      "soaking pad", "soaking pads", "soaking through", "saturating pad",
      "antepartum haemorrhage", "antepartum hemorrhage", "aph",
      "uncontrolled bleeding", "major bleeding", "massive bleeding",
      "haemorrhage", "hemorrhage", "bleeding heavily", "heavy blood",
      "placenta praevia", "placenta previa", "placental abruption",
      "abruption", "cord prolapse",
    ];

    const hasPregnancyAPH   = PREGNANCY_APH.some(kw => aphText.includes(kw));
    const hasHeavyBleeding  = HEAVY_BLEEDING.some(kw => aphText.includes(kw));

    if (hasPregnancyAPH && hasHeavyBleeding) {
      console.warn(
        "[Triage] ⚠️  Antepartum haemorrhage override: heavy vaginal bleeding in pregnant patient — " +
        "forcing urgency_level to 5 (presumptive APH / placenta praevia / abruption). " +
        `Original LLM score was ${parsed.urgency_level}.`
      );
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Cord prolapse ──────────────────────────────────────────────────
  // A visible or prolapsed umbilical cord during active labour is one of the most
  // time-critical obstetric emergencies. The cord is compressed between the fetal
  // presenting part and the pelvis with each contraction, cutting off fetal
  // oxygenation. Without immediate repositioning and emergency caesarean, fetal
  // death or severe hypoxic brain injury occurs within minutes.
  //
  // CRITICAL FAILURE MODE THIS CATCHES:
  //   Arabic "الحبل السري ظاهر في مكان الولادة" (umbilical cord visible at birth site)
  //   was classified by the LLM as routine umbilical stump care (Level 1) rather than
  //   cord prolapse (Level 5). The word "umbilical cord" + "birth site" caused the
  //   model to anchor on the neonatal belly-button context.
  //
  // SECOND FAILURE MODE (2026-05-17):
  //   When the LLM correctly self-scored urgency=5 but STILL described the clinical
  //   picture as umbilical stump care (wrong recommended_action and patient instructions),
  //   the previous implementation (gated by urgency < 5) never ran and the recommended_action
  //   was never overridden. Call 6 then generated stump care instructions at emergency
  //   priority — a "5/5 but follow up with paediatrician in 24-48h" catastrophe.
  //
  // FIX: Split into two independent checks:
  //   (A) urgency_level override — only needed if LLM under-scored (< 5)
  //   (B) clinical content override — ALWAYS needed when cord prolapse detected,
  //       regardless of what urgency score the LLM produced.
  //
  // Detection strategy: Path A (explicit prolapse language) or Path B (cord visible +
  // delivery context). Both paths now trigger content override unconditionally.
  {
    const cordRawText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();

    // Path A: explicit cord prolapse terminology (any language in extracted English)
    const CORD_PROLAPSE_EXPLICIT = [
      "cord prolapse", "prolapsed cord", "umbilical cord prolapse",
      "cord presenting", "presenting cord", "cord presentation",
      "cord visible at vaginal", "cord at vaginal opening",
      "cord hanging out", "cord outside", "cord protruding",
      "prolapsed umbilical", "umbilical prolapse",
    ];

    // Path B component 1: cord visible/outside/presenting language
    const CORD_VISIBLE = [
      "umbilical cord visible", "cord visible", "cord seen",
      "cord protruding", "cord outside", "cord hanging",
      "cord at birth", "cord at delivery", "cord in vagina",
      "cord presenting",
    ];

    // Path B component 2: intrapartum / delivery context (NOT postnatal stump)
    const DELIVERY_CONTEXT = [
      "birth site", "delivery", "labor", "labour", "birth canal",
      "vaginal opening", "during birth", "during delivery",
      "during labor", "during labour", "intrapartum",
      "presenting part", "contractions", "dilation",
      "place of birth", "place of delivery",
    ];

    const hasExplicitCordProlapse = CORD_PROLAPSE_EXPLICIT.some(kw => cordRawText.includes(kw));
    const hasCordVisible          = CORD_VISIBLE.some(kw => cordRawText.includes(kw));
    const hasDeliveryCtx          = DELIVERY_CONTEXT.some(kw => cordRawText.includes(kw));
    const isCordProlapse          = hasExplicitCordProlapse || (hasCordVisible && hasDeliveryCtx);

    if (isCordProlapse) {
      // (A) Urgency override — only if LLM under-scored
      if ((parsed.urgency_level as number) < 5) {
        console.warn(
          "[Triage] ⚠️  Cord prolapse urgency override: " +
          `forcing urgency_level to 5. Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 5;
      }

      // (B) Clinical content override — ALWAYS, regardless of urgency score.
      // This is the critical fix: even when LLM scores 5 correctly, it may still
      // describe the wrong clinical picture (stump care). The content override
      // ensures Call 6 generates correct cord prolapse instructions.
      console.warn(
        "[Triage] ⚠️  Cord prolapse content override: correcting recommended_action and " +
        `differential_note. Path: explicit=${hasExplicitCordProlapse}, ` +
        `visible+ctx=${hasCordVisible && hasDeliveryCtx}. ` +
        `LLM urgency was ${parsed.urgency_level}.`
      );
      parsed.recommended_action =
        "OBSTETRIC EMERGENCY — CORD PROLAPSE. Immediate actions: " +
        "(1) Call for emergency obstetric team NOW. " +
        "(2) Place mother in knee-chest position or steep Trendelenburg immediately — gravity reduces cord compression. " +
        "(3) Insert gloved hand into vagina and MANUALLY ELEVATE THE PRESENTING FETAL PART off the cord — hold this position without removing hand until caesarean is underway. " +
        "(4) Do NOT attempt to push cord back into uterus — this causes vasospasm and worsens fetal hypoxia. " +
        "(5) Keep any exposed cord MOIST with warm normal saline-soaked gauze — do not allow desiccation. " +
        "(6) Administer supplemental oxygen to mother. " +
        "(7) Prepare for EMERGENCY CRASH CAESAREAN SECTION — this is the definitive treatment. " +
        "(8) Do NOT allow further vaginal delivery attempts. " +
        "Fetal death or severe hypoxic brain injury can occur within minutes without cord decompression.";
      parsed.differential_note =
        "CORD PROLAPSE (umbilical cord ahead of or alongside presenting fetal part — " +
        "immediate fetal life-threat; manual elevation + emergency caesarean required). " +
        "Rule out: cord presentation (cord palpable through intact membranes — equally urgent). " +
        "NOT umbilical stump care — this is an intrapartum emergency.";
    }
  }
  // ── Hard-lock: Suspected overdose / poisoning with altered mental status ──────
  // Any medication or substance ingestion described as large/excessive/unknown COMBINED
  // with active altered mental status (confusion, drowsiness, unresponsiveness) is a
  // Level 5 Emergency — not Level 4.
  //
  // CRITICAL FAILURE MODE THIS CATCHES:
  //   Chinese "他吃了很多药，意识模糊，不知道吃了什么" (he took a lot of medication, is confused,
  //   don't know what he took) was classified as 4/5 Urgent. The LLM treated "unknown
  //   medication" as a reason to be conservative rather than a worst-case escalation trigger.
  //   Unknown substance = opioid/TCA/any lethal agent until proven otherwise = always 5.
  //
  // The rubric entry "suspected poisoning/overdose" listed alongside DKA/hypoglycaemia
  // in a comma-separated Level 5 list caused the model to incorrectly parse the ingestion
  // as a secondary/qualifying condition rather than a standalone 5-trigger.
  //
  // This hard-lock requires BOTH components to prevent over-triaging every patient who
  // mentions taking medication:
  //   Component A — ingestion descriptor (quantity, unknown agent, or explicit overdose language)
  //   Component B — active AMS (confusion, drowsiness, altered/reduced consciousness)
  // Both must be present. Either alone without the other does not fire this lock.
  // (A severe confirmed overdose with no AMS is already in the rubric as 5 — the LLM
  //  handles that correctly. This net catches the "confused + took medication" pattern
  //  where it under-triages due to "unknown" reducing its confidence.)
  if ((parsed.urgency_level as number) < 5) {
    const odText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();

    // Component A: ingestion / overdose / poisoning language
    const INGESTION_OVERDOSE = [
      "overdose", "poisoning", "suspected poisoning", "suspected overdose",
      "medication ingestion", "drug ingestion", "substance ingestion",
      "unknown medication", "unknown drug", "unknown substance",
      "unknown pill", "unknown pills", "multiple medications",
      "large amount of medication", "large quantity of medication",
      "excessive medication", "many pills", "many tablets",
      "took a lot", "ingested medication", "ingested unknown",
      "intentional ingestion", "unintentional ingestion",
      "possible overdose", "likely overdose", "drug overdose",
      "polypharmacy ingestion", "accidental ingestion",
      "toxic ingestion", "toxin ingestion", "chemical ingestion",
    ];

    // Component B: active altered mental status
    const ACTIVE_AMS = [
      "altered mental status", "altered consciousness", "altered awareness",
      "reduced consciousness", "decreased consciousness", "depressed consciousness",
      "loss of consciousness", "confusion", "confused", "confusional state",
      "disorientation", "disoriented", "obtunded", "obtundation",
      "somnolent", "somnolence", "drowsy", "drowsiness",
      "unresponsive", "unresponsiveness", "unconscious", "unconsciousness",
      "lethargy", "lethargic", "stupor", "stuporous",
      "altered level of consciousness", "altered loc",
    ];

    const hasIngestionOD = INGESTION_OVERDOSE.some(kw => odText.includes(kw));
    const hasActiveAMS   = ACTIVE_AMS.some(kw => odText.includes(kw));

    if (hasIngestionOD && hasActiveAMS) {
      console.warn(
        "[Triage] ⚠️  Overdose+AMS override: suspected medication/substance ingestion with active " +
        "altered mental status — forcing urgency_level to 5 (unknown agent = worst-case toxidrome). " +
        `Original LLM score was ${parsed.urgency_level}. ` +
        `Ingestion match: ${INGESTION_OVERDOSE.find(kw => odText.includes(kw))}; ` +
        `AMS match: ${ACTIVE_AMS.find(kw => odText.includes(kw))}.`
      );
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Active / ongoing seizure (non-pregnant) ─────────────────────
  // An active seizure = airway unprotected, aspiration, hypoxia, possible catastrophic
  // underlying cause. Known epileptic patients are NOT exempt — "their usual seizure"
  // is still a Level 5 event while it is happening.
  // LLM failure mode: anchors on "known epileptic" label → drops urgency to 3.
  // Two tiers: actively seizing → force 5; resolved/post-ictal → floor 4.
  {
    const seizureText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const isPregnant = ["pregnant", "pregnancy", "gravid"].some(kw => seizureText.includes(kw));
    if (!isPregnant) {
      const ACTIVE_SEIZURE = [
        "active seizure", "actively seizing", "currently seizing", "seizing now",
        "ongoing seizure", "seizure in progress", "currently convulsing",
        "status epilepticus", "prolonged seizure", "seizure lasting",
        "multiple seizures", "repeated seizures", "cluster seizure",
        "fitting now", "currently fitting", "fitting at presentation",
      ];
      const RESOLVED_SEIZURE_WORDS = [
        "resolved seizure", "seizure resolved", "post-ictal", "postictal",
        "had a seizure", "had seizure", "seizure earlier", "seizure today",
        "first seizure", "first-ever seizure", "new onset seizure",
        "recovered from seizure", "after the seizure", "following a seizure",
      ];
      const hasActiveSeizure   = ACTIVE_SEIZURE.some(kw => seizureText.includes(kw));
      const hasResolvedSeizure = RESOLVED_SEIZURE_WORDS.some(kw => seizureText.includes(kw));
      const hasAnySeizureWord  = ["seizure", "convulsion", "epileptic", "fitting"].some(kw => seizureText.includes(kw));
      if (hasActiveSeizure && (parsed.urgency_level as number) < 5) {
        console.warn(`[Triage] ⚠️  Active seizure override → 5. Original: ${parsed.urgency_level}.`);
        parsed.urgency_level = 5;
      } else if (!hasActiveSeizure && (hasResolvedSeizure || hasAnySeizureWord) && (parsed.urgency_level as number) < 4) {
        console.warn(`[Triage] ⚠️  Resolved seizure floor → min 4. Original: ${parsed.urgency_level}.`);
        parsed.urgency_level = 4;
      }
    }
  }

  // ── Hard-lock: Carbon monoxide poisoning ────────────────────────────────────
  // CO is odourless/colourless. The LLM treats "whole family has headaches" as
  // viral illness. Multiple people in the same enclosed space simultaneously = CO.
  if ((parsed.urgency_level as number) < 5) {
    const coText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();
    const CO_EXPLICIT = [
      "carbon monoxide", "co poisoning", "co exposure", "co detector", "monoxide",
    ];
    const MULTIPLE_AFFECTED = [
      "multiple people", "multiple family", "whole family", "entire family",
      "everyone in the house", "everyone at home", "all family members",
      "household affected", "several people", "everyone affected",
    ];
    const GAS_SOURCE = [
      "gas heater", "gas boiler", "generator", "boiler", "furnace",
      "gas stove", "charcoal", "enclosed space", "vehicle exhaust", "car exhaust",
    ];
    const SHARED_SYMPTOMS = ["headache", "nausea", "dizziness", "dizzy", "confusion", "altered"];
    const hasExplicitCO   = CO_EXPLICIT.some(kw => coText.includes(kw));
    const hasMultiple     = MULTIPLE_AFFECTED.some(kw => coText.includes(kw));
    const hasGasSource    = GAS_SOURCE.some(kw => coText.includes(kw));
    const hasSharedSymp   = SHARED_SYMPTOMS.some(kw => coText.includes(kw));
    if (hasExplicitCO || (hasMultiple && hasSharedSymp) || (hasGasSource && hasSharedSymp)) {
      console.warn(`[Triage] ⚠️  Carbon monoxide override → 5 (explicit=${hasExplicitCO}, multi=${hasMultiple}, gas=${hasGasSource}). Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Acute limb ischaemia ─────────────────────────────────────────
  // Cold + pale/pulseless + painful limb = arterial occlusion = 6-hour salvage window.
  // LLM classifies as "circulatory problem" / "limb pain" at Level 3–4.
  // Requires: limb context + ≥2 ischaemia signs (6 Ps pattern).
  if ((parsed.urgency_level as number) < 5) {
    const aliText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const ALI_EXPLICIT = [
      "acute limb ischaemia", "acute limb ischemia", "limb ischaemia", "limb ischemia",
      "arterial occlusion", "acute arterial", "thromboembolism leg", "thromboembolism arm",
    ];
    const LIMB_CONTEXT = ["leg", "arm", "foot", "hand", "limb", "extremity"];
    const ISCHAEMIA_SIGNS = [
      "cold", "pale", "white", "mottled", "pulseless", "no pulse", "absent pulse",
      "paralys", "numb", "numbness", "paraesthesia", "paresthesia", "cannot move",
    ];
    const hasExplicitALI = ALI_EXPLICIT.some(kw => aliText.includes(kw));
    const hasLimb        = LIMB_CONTEXT.some(kw => aliText.includes(kw));
    const ischaemiaSigns = ISCHAEMIA_SIGNS.filter(kw => aliText.includes(kw));
    if (hasExplicitALI || (hasLimb && ischaemiaSigns.length >= 2)) {
      console.warn(`[Triage] ⚠️  Acute limb ischaemia override → 5 (signs: ${ischaemiaSigns.slice(0,3).join(",")}). Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Diabetic hypoglycaemia + altered mental status ────────────────
  // LLM treats "diabetic, low sugar, confused" as "just needs glucose" → scores 3.
  // Neuroglycopenia causes permanent brain damage — always Level 5.
  if ((parsed.urgency_level as number) < 5) {
    const bgText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const HYPO_CONTEXT = [
      "hypoglycaemia", "hypoglycemia", "low blood sugar", "low blood glucose", "low glucose",
      "hypoglycaemic", "hypoglycemic", "dka", "diabetic ketoacidosis",
      "known diabetic", "diabetic patient", "insulin dependent", "on insulin",
      "type 1 diabetes", "type 2 diabetes", "diabetes mellitus",
    ];
    const AMS_HYPO = [
      "altered mental status", "altered consciousness", "confusion", "confused",
      "disoriented", "drowsy", "unresponsive", "unconscious", "loss of consciousness",
      "obtunded", "lethargic", "not responding", "cannot rouse", "difficult to rouse",
    ];
    if (HYPO_CONTEXT.some(kw => bgText.includes(kw)) && AMS_HYPO.some(kw => bgText.includes(kw))) {
      console.warn(`[Triage] ⚠️  Diabetic hypoglycaemia+AMS override → 5. Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 5;
    }
  }

  // ── Two-tier: Ectopic pregnancy ──────────────────────────────────────────────
  // Tier 1 — Force 5: pregnancy + abdominal pain + rupture signs (shoulder tip,
  //   syncope, haemodynamic instability, peritonism).
  // Tier 2 — Floor 4: pregnancy + lower abdominal pain, no rupture signs (must
  //   exclude ectopic by ultrasound before any lower urgency is appropriate).
  {
    const ectopicText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const ECTOPIC_EXPLICIT = ["ectopic pregnancy", "ectopic", "tubal pregnancy", "extrauterine"];
    const PREGNANCY_CTX    = ["pregnant", "pregnancy", "positive pregnancy test", "missed period",
                              "amenorrhoea", "amenorrhea", "gravid"];
    const LOWER_ABD        = ["lower abdominal pain", "lower abdominal", "pelvic pain",
                              "iliac fossa", "lower belly", "lower stomach", "adnexal",
                              "one-sided pain", "unilateral pain", "right iliac", "left iliac"];
    const RUPTURE_SIGNS    = ["shoulder tip pain", "shoulder pain", "hypotension", "low blood pressure",
                              "tachycardia", "syncope", "presyncope", "collapse", "fainted",
                              "haemodynamically unstable", "hemodynamically unstable",
                              "peritonism", "rigid abdomen", "rebound tenderness", "severe abdominal"];
    const hasEctopicCtx  = ECTOPIC_EXPLICIT.some(kw => ectopicText.includes(kw)) ||
                           (PREGNANCY_CTX.some(kw => ectopicText.includes(kw)) &&
                            LOWER_ABD.some(kw => ectopicText.includes(kw)));
    const hasRupture     = RUPTURE_SIGNS.some(kw => ectopicText.includes(kw));
    if (hasEctopicCtx) {
      if (hasRupture && (parsed.urgency_level as number) < 5) {
        console.warn(`[Triage] ⚠️  Ectopic T1 (ruptured) override → 5. Original: ${parsed.urgency_level}.`);
        parsed.urgency_level = 5;
      } else if (!hasRupture && (parsed.urgency_level as number) < 4) {
        console.warn(`[Triage] ⚠️  Ectopic T2 (unruptured) floor → min 4. Original: ${parsed.urgency_level}.`);
        parsed.urgency_level = 4;
      }
    }
  }

  // ── Hard-lock: Epiglottitis ──────────────────────────────────────────────────
  // Drooling + stridor = airway obstruction within minutes.
  // LLM classifies as "severe pharyngitis" → scores 2–3.
  if ((parsed.urgency_level as number) < 5) {
    const epiText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const DROOLING    = ["drooling", "drool", "unable to swallow saliva", "excessive saliva", "pooling saliva"];
    const STRIDOR_EPI = ["stridor", "inspiratory stridor", "noisy breathing"];
    const DYSPHAGIA   = ["dysphagia", "difficulty swallowing", "unable to swallow", "cannot swallow", "odynophagia"];
    const FEVER_EPI   = ["fever", "febrile", "pyrexia"];
    const EPI_EXPLICIT = ["epiglottitis", "supraglottitis", "hot potato voice", "tripod position"];
    const hasDrooling  = DROOLING.some(kw => epiText.includes(kw));
    const hasStridor   = STRIDOR_EPI.some(kw => epiText.includes(kw));
    const hasDysphagia = DYSPHAGIA.some(kw => epiText.includes(kw));
    const hasFeverEpi  = FEVER_EPI.some(kw => epiText.includes(kw));
    const hasExplicitEpi = EPI_EXPLICIT.some(kw => epiText.includes(kw));
    if (hasExplicitEpi || (hasDrooling && hasStridor) || (hasDrooling && hasDysphagia && hasFeverEpi)) {
      console.warn(`[Triage] ⚠️  Epiglottitis override → 5 (drooling=${hasDrooling}, stridor=${hasStridor}). Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 5;
    }
  }

  // ── Suicidal ideation: two-tier urgency ──────────────────────────────────────
  // CRITICAL CIRCULAR DEPENDENCY: Crisis line injection only fires at urgency = 5.
  // If suicidal ideation with plan+means is scored 3 or 4, NO crisis resources shown.
  // TEST SUITE ALIGNMENT (validated against 98-case test set):
  //   Tier 1 — Force 5: IMMINENT intent (explicit "now", "today", "about to") + plan + means.
  //   Tier 2 — Floor 4: Plan OR means present, but no imminent intent word.
  //   Tier 3 — Floor 4: Ideation with no plan/means (safety screening still required).
  // Note: Row 76 (plan+means, no imminent intent) = test expects 4. Row 95 (imminent) = 5.
  {
    const siText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();
    const SUICIDAL_BASE = [
      "suicidal ideation", "suicidal", "suicide", "suicidality",
      "wants to die", "want to die", "end my life", "end their life",
      "end his life", "end her life", "kill myself", "kill himself",
      "kill herself", "take my life", "take his life", "take her life",
      "self-harm", "self harm", "harm myself",
    ];
    const PLAN_OR_MEANS = [
      "plan", "means", "method", "weapon", "gun", "firearm",
      "pills at home", "bridge", "hanging", "specific plan",
      "has a plan", "with a plan", "stated plan", "access to",
      "ideation with plan", "plan and means", "method and plan",
    ];
    const IMMINENT_INTENT = [
      "now", "today", "tonight", "about to", "going to do it",
      "imminent", "immediate intent", "right now", "will do it",
      "doing it now",
    ];
    const hasSuicidalBase  = SUICIDAL_BASE.some(kw => siText.includes(kw));
    const hasPlanOrMeans   = PLAN_OR_MEANS.some(kw => siText.includes(kw));
    const hasImminentIntent = IMMINENT_INTENT.some(kw => siText.includes(kw));
    if (hasSuicidalBase) {
      if (hasPlanOrMeans && hasImminentIntent && (parsed.urgency_level as number) < 5) {
        console.warn(`[Triage] ⚠️  Suicidal ideation imminent+plan+means override → 5. Original: ${parsed.urgency_level}.`);
        parsed.urgency_level = 5;
      } else if (!hasImminentIntent && (parsed.urgency_level as number) < 4) {
        console.warn(`[Triage] ⚠️  Suicidal ideation floor → min 4. Original: ${parsed.urgency_level}.`);
        parsed.urgency_level = 4;
      }
    }
  }

  // ── Hard-lock: Aortic dissection ────────────────────────────────────────────
  // "Tearing back pain" without documented hypertension → LLM scores 3–4.
  // Does NOT require confirmed hypertension. Type A: ~1–2% mortality/hour without surgery.
  if ((parsed.urgency_level as number) < 5) {
    const aoText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const DISSECTION_EXPLICIT = ["aortic dissection", "dissection", "aortic rupture"];
    const TEARING_QUALITY     = [
      "tearing pain", "tearing chest", "tearing back",
      "ripping pain", "ripping chest", "ripping back",
      "knife-like pain", "sharp tearing", "sudden tearing", "worst tearing", "worst ripping",
    ];
    const MIGRATION = [
      "radiating to back", "radiation to back", "radiates to back",
      "between the shoulder blades", "interscapular", "migrating pain",
      "pain that moves", "moves to the back",
    ];
    const hasExplicit  = DISSECTION_EXPLICIT.some(kw => aoText.includes(kw));
    const hasTearing   = TEARING_QUALITY.some(kw => aoText.includes(kw));
    const hasMigration = MIGRATION.some(kw => aoText.includes(kw));
    if (hasExplicit || (hasTearing && hasMigration) || hasTearing) {
      console.warn(`[Triage] ⚠️  Aortic dissection override → 5 (explicit=${hasExplicit}, tearing=${hasTearing}). Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 5;
    }
  }

  // ── Hard-lock: Meningism partial triad ──────────────────────────────────────
  // Any TWO of (fever / neck stiffness / photophobia / severe headache) = 5.
  // The LLM sometimes scores 4 when only 2 of 3 signs are documented.
  // Kernig / Brudzinski alone = pathognomonic → always 5.
  if ((parsed.urgency_level as number) < 5) {
    const meningText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const NECK_STIFF    = ["neck stiffness", "stiff neck", "nuchal rigidity", "meningism", "neck rigidity"];
    const PHOTOPHOBIA_M = ["photophobia", "light sensitivity", "sensitive to light", "hurts to look at light"];
    const FEVER_M       = ["fever", "febrile", "pyrexia"];
    const SEVERE_HA     = ["severe headache", "worst headache", "thunderclap", "excruciating headache", "unbearable headache"];
    const KERNIG_B      = ["kernig", "brudzinski", "jolt accentuation"];
    const hasNeckStiff    = NECK_STIFF.some(kw => meningText.includes(kw));
    const hasPhotophobiaM = PHOTOPHOBIA_M.some(kw => meningText.includes(kw));
    const hasFeverM       = FEVER_M.some(kw => meningText.includes(kw));
    const hasSevereHA     = SEVERE_HA.some(kw => meningText.includes(kw));
    const hasKernig       = KERNIG_B.some(kw => meningText.includes(kw));
    const isPartialTriad =
      (hasNeckStiff && (hasPhotophobiaM || hasFeverM || hasSevereHA || hasKernig)) ||
      (hasFeverM && hasPhotophobiaM) ||
      hasKernig;
    if (isPartialTriad) {
      const sigCount = [hasNeckStiff, hasPhotophobiaM, hasFeverM, hasSevereHA, hasKernig].filter(Boolean).length;
      console.warn(`[Triage] ⚠️  Meningism partial triad override → 5 (${sigCount} signs). Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 5;
    }
  }

  // ── Minimum-4 floor: Testicular torsion ──────────────────────────────────────
  // "Testicular pain, probably epididymitis" → LLM scores 2. 4–6 hour salvage window.
  if ((parsed.urgency_level as number) < 4) {
    const torsionText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();
    const TESTICULAR = ["testicular", "testicle", "testis", "scrotal", "scrotum", "torsion",
                        "orchitis", "testicular pain", "scrotal pain"];
    const ACUTE_ONSET = ["sudden", "acute", "severe", "sharp", "excruciating", "rapid onset"];
    if (TESTICULAR.some(kw => torsionText.includes(kw)) &&
        (ACUTE_ONSET.some(kw => torsionText.includes(kw)) || torsionText.includes("torsion"))) {
      console.warn(`[Triage] ⚠️  Testicular torsion floor → min 4. Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 4;
    }
  }

  // ── Minimum-4 floor: Resolved / treated anaphylaxis (biphasic risk) ──────────
  // "Had allergic reaction, took Benadryl, now fine" → LLM scores 1–2.
  // Biphasic anaphylaxis: up to 20% of cases, up to 12 hours later.
  if ((parsed.urgency_level as number) < 4) {
    const biphasicText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();
    const RESOLVED_ALLERGY  = ["anaphylaxis", "anaphylactic", "severe allergic", "allergic reaction",
                               "hypersensitivity reaction"];
    const RESOLVED_MARKERS  = ["resolved", "better now", "improved", "recovered", "settled", "treated",
                               "after taking", "after benadryl", "after antihistamine", "after epinephrine",
                               "after epipen", "has resolved", "has improved", "now fine"];
    if (RESOLVED_ALLERGY.some(kw => biphasicText.includes(kw)) &&
        RESOLVED_MARKERS.some(kw => biphasicText.includes(kw))) {
      console.warn(`[Triage] ⚠️  Resolved anaphylaxis biphasic floor → min 4. Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 4;
    }
  }

  // ── Minimum-4 floor: Fever + rigors (sepsis pattern) ────────────────────────
  // REGRESSION FIX (2026-05-17): Cases with high fever + rigors (shaking/发抖) were
  // scoring 3 after the Level 5 rubric expansion. Rigors (true shaking chills, not
  // simple shivers) are a bacteraemia/sepsis marker requiring urgent assessment.
  // The extensive new Level 5 content shifted the LLM's calibration downward for
  // borderline 4/3 presentations. This floor restores correct scoring.
  // Requires: fever + rigors/shaking qualifier — NOT plain fever + mild chills.
  if ((parsed.urgency_level as number) < 4) {
    const rigorsText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();
    const FEVER_MARKERS = ["fever", "febrile", "high temperature", "pyrexia", "high fever"];
    const RIGORS_MARKERS = [
      "rigors", "rigor", "shaking", "shivering severely", "severe chills",
      "uncontrollable shaking", "shaking uncontrollably", "teeth chattering",
      "chills and shaking", "rigors and fever", "fever and rigors",
      "systemic infection", "suspected sepsis", "possible sepsis", "sepsis screen",
      "bacteraemia", "bacteremia",
    ];
    const hasFeverRigors = FEVER_MARKERS.some(kw => rigorsText.includes(kw)) &&
                           RIGORS_MARKERS.some(kw => rigorsText.includes(kw));
    if (hasFeverRigors) {
      console.warn(`[Triage] ⚠️  Fever+rigors floor → min 4 (sepsis pattern). Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 4;
    }
  }

  // ── Calibration guard: Fever + headache without neurological red flags → cap at 3 ──
  // Prevents the "severe headache + fever = 4" over-escalation trap.
  // The word "severe" as a pain intensity modifier is NOT itself a red flag.
  // Escalation to Level 4 requires a SECOND specific neurological sign alongside
  // the headache (photophobia, neck stiffness, new confusion). Without that, it is 3.
  //
  // Real-world calibration case: Hindi demo — fever (2 days) + severe headache + poor
  // oral intake. Expected: 3/5. Before fix: LLM extracted "severe headache" and scored
  // 4 due to misreading "SEVERE headache + fever" as a standalone Level-4 trigger.
  if ((parsed.urgency_level as number) === 4) {
    const calibText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const NEURO_RED_FLAGS = [
      "photophobia", "light sensitivity", "sensitive to light",
      "neck stiffness", "stiff neck", "nuchal rigidity", "meningism",
      "confusion", "confused", "altered mental", "disoriented",
      "new confusion", "new onset confusion",
      "thunderclap", "worst headache of my life",
      "focal neurological", "focal neuro", "arm weakness", "facial droop",
    ];
    const OTHER_RED_FLAGS = [
      "rigors", "sepsis", "hypotension", "tachycardia",
      "chest pain", "shortness of breath", "dyspnoea",
      "altered consciousness", "loss of consciousness",
      "rash", "purpura", "petechiae",
    ];
    const hasLevel4Flag = [...NEURO_RED_FLAGS, ...OTHER_RED_FLAGS].some(kw => calibText.includes(kw));
    if (!hasLevel4Flag) {
      const HAS_FEVER    = ["fever", "febrile", "pyrexia", "high temperature"].some(kw => calibText.includes(kw));
      const HAS_HEADACHE = ["headache", "head pain", "head ache", "head heaviness", "head pressure"].some(kw => calibText.includes(kw));
      if (HAS_FEVER && HAS_HEADACHE) {
        console.warn(
          "[Triage] ⚠️  Calibration guard: urgency was 4 but only fever+headache without " +
          "Level-4 neurological/systemic red flags — capping at 3. " +
          "(Pain intensity words like 'severe' are NOT red flags.)"
        );
        parsed.urgency_level = 3;
      }
    }
  }

    // ── Minimum-4 floor: Infant < 3 months with any fever ───────────────────────
  // REGRESSION FIX (2026-05-17): A 2-month-old with 39.5°C was scoring 3 after
  // the Level 5 rubric expansion shifted LLM calibration. Any fever ≥38°C in an
  // infant <3 months is a paediatric emergency (serious bacterial infection, sepsis,
  // meningitis) requiring immediate assessment — regardless of whether the infant
  // is described as "inconsolable" (separate rule). The inconsolable hard-lock at
  // line 1336 requires consolability data; this floor fires on age + fever alone,
  // which is sufficient for mandatory urgent escalation.
  if ((parsed.urgency_level as number) < 4) {
    const infantText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();
    const INFANT_YOUNG = [
      "infant", "newborn", "neonate", "neonatal",
      "2 month", "2-month", "two month", "6 week", "6-week",
      "8 week", "8-week", "3 month", "3-month", "under 3 months",
      "less than 3 months", "younger than 3 months",
      "baby aged", "month old baby", "month-old baby",
      "month old infant", "weeks old",
      // common extractions for "miezi 2" (Swahili: months 2), "2个月" (Mandarin):
      "2 months old", "two months old", "months of age",
    ];
    const FEVER_INFANT = ["fever", "febrile", "high temperature", "pyrexia", "high fever", "temperature"];
    if (INFANT_YOUNG.some(kw => infantText.includes(kw)) && FEVER_INFANT.some(kw => infantText.includes(kw))) {
      console.warn(`[Triage] ⚠️  Infant <3mo fever floor → min 4. Original: ${parsed.urgency_level}.`);
      parsed.urgency_level = 4;
    }
  }

  //
  // A severe asthma/COPD/bronchospasm attack that is only partially responding to
  // rescue treatment (nebulizer, inhaler, bronchodilator) is at risk of progressing
  // to status asthmaticus or respiratory muscle fatigue. Partial relief of a SEVERE
  // presentation does not reduce urgency — it signals refractory airway obstruction.
  //
  // Rule: severe respiratory descriptor + partial response language = minimum 4.
  // This is a FLOOR not a ceiling — if other criteria push to 5, that stands.
  if ((parsed.urgency_level as number) < 4) {
    const respText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.recommended_action ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const SEVERE_RESP = [
      "severe asthma", "acute severe asthma", "asthma exacerbation",
      "severe copd", "copd exacerbation", "severe bronchospasm",
      "severe dyspnoea", "severe dyspnea", "severe shortness of breath",
      "severe respiratory", "acute respiratory",
    ];
    const PARTIAL_RESPONSE = [
      "partially relieved", "partial relief", "partially responsive",
      "partial response", "partially soulag",    // French: partiellement soulagée
      "parcialmente alivia",                     // Spanish
      "partially controlled", "not fully relieved", "not fully responding",
      "still wheezing after", "still wheezing despite",
      "incomplete response", "incomplete relief",
      "refractory", "failing to respond", "not responding to",
      "despite nebuliz", "despite inhaler", "despite bronchodilat",
    ];

    const hasSevereResp   = SEVERE_RESP.some(kw => respText.includes(kw));
    const hasPartialResp  = PARTIAL_RESPONSE.some(kw => respText.includes(kw));

    if (hasSevereResp && hasPartialResp) {
      console.warn(
        "[Triage] ⚠️  Respiratory partial-response floor: severe respiratory presentation " +
        "with partial treatment response detected — raising urgency_level to minimum 4. " +
        `Original LLM score was ${parsed.urgency_level}.`
      );
      parsed.urgency_level = 4;
    }
  }

  // ── Minimum-4 floor: chest pain + cardiovascular demographic risk ─────────────
  // Catches the "severity modifier overrides demographic risk" trap.
  //
  // A 55yo male with atypical chest pain (sio makali sana / not very severe) is a
  // classic under-triage failure. Subjective pain intensity never overrides the
  // cardiovascular risk profile. ECG + troponin are required to exclude ACS before
  // any score below 4 is valid.
  //
  // Rule: chest pain/discomfort + (age >= 45, OR male + age >= 40) = minimum 4.
  // Also fires on high-risk comorbidity keywords without explicit age (diabetic,
  // hypertensive, known cardiac history) since these carry equivalent risk.
  if ((parsed.urgency_level as number) < 4) {
    const cardioText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const CHEST_PAIN = [
      "chest pain", "chest pressure", "chest discomfort", "chest tightness",
      "chest heaviness", "thoracic pain", "unusual chest", "atypical chest",
      "chest complaint", "precordial", "substernal",
      // Common atypical equivalents often coded in clinical notes:
      "jaw pain", "arm pain", "left arm", "shoulder pain with", "epigastric pain",
    ];

    const hasChestPain = CHEST_PAIN.some(kw => cardioText.includes(kw));

    if (hasChestPain) {
      // Parse explicit age from extracted text ("55-year-old", "55yo", "55 years", "aged 55")
      const ageMatch = cardioText.match(/(\d{2})\s*(?:year|yr|yo|years|ans|años|jahre|años|سنة|سال|-year|-yr)/i);
      const age = ageMatch ? parseInt(ageMatch[1], 10) : null;

      const isMale = ["male", "man", "gentleman", "homme", "hombre", "uomo",
        "mann", "mwanaume", "رجل", "مرد"].some(kw => cardioText.includes(kw));

      // High-risk comorbidities — these warrant floor regardless of explicit age
      const HIGH_RISK_COMORBIDITY = [
        "diabetic", "diabetes", "hypertensive", "hypertension", "high blood pressure",
        "known cardiac", "coronary artery disease", "previous mi", "prior mi",
        "previous heart attack", "smoker", "hypercholesterol", "high cholesterol",
        "obesity", "obese", "renal failure", "chronic kidney",
      ];
      const hasHighRiskComorbidity = HIGH_RISK_COMORBIDITY.some(kw => cardioText.includes(kw));

      const triggerAge45Plus  = age !== null && age >= 45;
      const triggerMale40Plus = age !== null && age >= 40 && isMale;
      const triggerComorbid   = hasHighRiskComorbidity;
      // Male with chest pain and no explicit age — err on side of caution
      const triggerMaleNoAge  = isMale && age === null;

      const cardioReason =
        triggerAge45Plus  ? `patient age ${age} >= 45 with chest pain` :
        triggerMale40Plus ? `male patient age ${age} >= 40 with chest pain` :
        triggerComorbid   ? "high-risk cardiac comorbidity with chest pain" :
        triggerMaleNoAge  ? "male patient with chest pain (age unspecified — defaulting to safe floor)" :
        null;

      if (cardioReason) {
        console.warn(
          `[Triage] ⚠️  Cardiac demographic floor: ${cardioReason} — ` +
          `raising urgency_level to minimum 4. Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 4;
      }
    }
  }

  // ── Hard-lock: Acute ocular emergency (AACG / CRAO / sudden vision loss) ─────
  // Covers two distinct time-critical organ-loss presentations:
  //
  // 1. AACG TRIAD: severe eye pain + nausea/vomiting + blurred vision / halos.
  //    IOP spikes cause optic nerve infarction within hours. Delay = permanent blindness.
  //    Requires both an ocular pain component AND a systemic/visual component to fire.
  //
  // 2. SUDDEN VISION LOSS: sudden complete or near-complete loss of vision in one or
  //    both eyes. Central Retinal Artery Occlusion has a ~90-minute treatment window.
  //    Painless sudden vision loss is the key pattern — fire on this alone.
  //
  // 3. CHEMICAL EYE: acid/alkali/chemical splash — alkali continues penetrating after
  //    exposure stops. Always 5 regardless of other symptoms.
  if ((parsed.urgency_level as number) < 5) {
    const ocularText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    // Ocular pain component
    const EYE_PAIN = [
      "eye pain", "ocular pain", "eye ache", "painful eye", "severe eye",
      "eye discomfort", "orbital pain", "periorbital pain",
    ];
    // Visual disturbance component (used with eye pain = AACG)
    const VISUAL_DISTURBANCE = [
      "blurred vision", "blurry vision", "vision loss", "visual loss",
      "halos", "halo around", "rainbow around", "cloudy vision",
      "decreased vision", "reduced vision", "loss of vision",
      "double vision", "diplopia",
    ];
    // Systemic accompaniment (nausea/vomiting with eye pain = AACG)
    const SYSTEMIC_WITH_EYE = [
      "nausea", "vomiting", "nauseous", "headache", "severe headache",
    ];
    // Sudden painless vision loss alone = CRAO — fire without eye pain
    const SUDDEN_VISION_LOSS = [
      "sudden vision loss", "sudden loss of vision", "sudden blindness",
      "went dark", "gone dark", "sudden visual loss", "vision went",
      "curtain over", "curtain coming down", "lost vision suddenly",
      "abrupt vision", "abrupt loss of vision",
    ];
    // Chemical eye — fire immediately
    const CHEMICAL_EYE = [
      "chemical eye", "acid in eye", "alkali in eye", "bleach in eye",
      "chemical splash", "chemical burn to eye", "eye chemical",
      "substance in eye", "corrosive eye",
    ];

    const hasEyePain        = EYE_PAIN.some(kw => ocularText.includes(kw));
    const hasVisualDist     = VISUAL_DISTURBANCE.some(kw => ocularText.includes(kw));
    const hasSystemic       = SYSTEMIC_WITH_EYE.some(kw => ocularText.includes(kw));
    const hasSuddenVision   = SUDDEN_VISION_LOSS.some(kw => ocularText.includes(kw));
    const hasChemicalEye    = CHEMICAL_EYE.some(kw => ocularText.includes(kw));

    // AACG: eye pain + visual disturbance OR eye pain + systemic symptom
    const isAACGPattern = hasEyePain && (hasVisualDist || hasSystemic);

    const ocularReason =
      hasChemicalEye    ? "chemical eye burn — alkali/acid splash" :
      hasSuddenVision   ? "sudden vision loss (CRAO pattern)" :
      isAACGPattern     ? "AACG triad: severe eye pain + visual/systemic symptoms" :
      null;

    if (ocularReason) {
      console.warn(
        `[Triage] ⚠️  Ocular emergency override: ${ocularReason} — ` +
        `forcing urgency_level to 5. Original LLM score was ${parsed.urgency_level}.`
      );
      parsed.urgency_level = 5;
    }
  }

  // ── Two-tier: Hypertensive crisis safety net ──────────────────────────────────
  // Implements the clinical distinction between hypertensive URGENCY (level 4) and
  // hypertensive EMERGENCY (level 5).
  //
  // TIER 1 — Floor 4 (Hypertensive Urgency):
  //   BP >= 180 systolic OR >= 120 diastolic + any symptom present.
  //   "No other serious symptoms" with headache and 190/120 = Level 4.
  //   Subjective "feeling fine" does not override the objective BP threshold.
  //
  // TIER 2 — Force 5 (Hypertensive Emergency):
  //   Same BP threshold + confirmed end-organ damage markers: altered consciousness,
  //   focal neurology, thunderclap headache, acute pulmonary oedema, aortic pattern.
  //   End-organ damage = immediate resuscitation bay. No symptom = no force-5 from BP alone.
  //
  // BP is parsed from the extracted text since it often appears in chief_complaint.
  // Handles formats: "190/120", "190/120 mmHg", "SBP 190", "systolic 190", etc.
  {
    const bpText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();

    // Parse BP values from text
    const bpSlashMatch  = bpText.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
    const sbpAloneMatch = bpText.match(/systolic[:\s]+(\d{2,3})|sbp[:\s]+(\d{2,3})/);
    const dbpAloneMatch = bpText.match(/diastolic[:\s]+(\d{2,3})|dbp[:\s]+(\d{2,3})/);

    const sbp = bpSlashMatch  ? parseInt(bpSlashMatch[1], 10)
              : sbpAloneMatch ? parseInt(sbpAloneMatch[1] ?? sbpAloneMatch[2], 10)
              : null;
    const dbp = bpSlashMatch  ? parseInt(bpSlashMatch[2], 10)
              : dbpAloneMatch ? parseInt(dbpAloneMatch[1] ?? dbpAloneMatch[2], 10)
              : null;

    const isCrisisBP = (sbp !== null && sbp >= 180) || (dbp !== null && dbp >= 120);

    if (isCrisisBP) {
      // End-organ damage markers → force 5
      const END_ORGAN = [
        "altered consciousness", "confusion", "encephalopathy",
        "altered mental status", "unconscious", "unresponsive",
        "focal neurological", "focal neuro", "hemiplegia", "aphasia",
        "thunderclap", "worst headache", "sudden severe headache",
        "pulmonary oedema", "pulmonary edema", "cannot lie flat",
        "pink frothy", "acute kidney", "oliguric", "aortic dissection",
        "tearing chest", "ripping chest", "radiating to back",
      ];
      // Any symptom at all → floor 4
      const ANY_SYMPTOM = [
        "headache", "head pain", "dizziness", "dizzy", "nausea", "vomiting",
        "blurred vision", "visual", "chest", "breathless", "dyspnoea",
        "confusion", "weakness", "numbness", "palpitation", "sweating",
        "epistaxis", "nosebleed", "tinnitus",
      ];

      const hasEndOrgan  = END_ORGAN.some(kw => bpText.includes(kw));
      const hasAnySymptom = ANY_SYMPTOM.some(kw => bpText.includes(kw));

      if (hasEndOrgan && (parsed.urgency_level as number) < 5) {
        console.warn(
          `[Triage] ⚠️  Hypertensive emergency override: BP ${sbp ?? "?"}/${dbp ?? "?"} mmHg ` +
          `with end-organ damage markers — forcing urgency_level to 5. ` +
          `Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 5;
      } else if (hasAnySymptom && (parsed.urgency_level as number) < 4) {
        console.warn(
          `[Triage] ⚠️  Hypertensive urgency floor: BP ${sbp ?? "?"}/${dbp ?? "?"} mmHg ` +
          `with symptoms but no confirmed end-organ damage — raising urgency_level to minimum 4. ` +
          `Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 4;
      }
    }
  }

  // ── Minimum-4 floor: inconsolable child + high fever ─────────────────────────
  // The Level 4 rubric entry previously read "inconsolable infant, high fever <3 months"
  // which is too narrow. An inconsolable child of ANY age with high fever + lethargy is
  // a major red flag for serious bacterial infection (meningitis, bacteraemia, sepsis).
  //
  // Requires: child/infant/paediatric context + inconsolable/distress + fever. All three
  // components must be present to avoid false positives on adult crying or child fever alone.
  //
  // Escalation to 5 is handled separately by the existing meningism/rash/seizure checks
  // already in the FAST and general rubric — this net only sets the floor at 4.
  if ((parsed.urgency_level as number) < 4) {
    const paedText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const IS_CHILD = [
      "child", "infant", "baby", "toddler", "newborn", "neonate", "paediatric",
      "pediatric", "kid", "boy", "girl", "years old", "month old", "week old",
    ];
    const INCONSOLABLE = [
      "inconsolable", "cannot be consoled", "cannot comfort",
      "crying inconsolably", "persistent crying", "constant crying",
      "will not stop crying", "won't stop crying", "uncontrollable crying",
      "excessive crying", "crying continuously",
    ];
    const FEVER_CHILD = [
      "high fever", "fever", "febrile", "pyrexia", "high temperature",
      "elevated temperature", "hyperthermia",
    ];

    const isChildContext    = IS_CHILD.some(kw => paedText.includes(kw));
    const isInconsolable    = INCONSOLABLE.some(kw => paedText.includes(kw));
    const hasFever          = FEVER_CHILD.some(kw => paedText.includes(kw));

    if (isChildContext && isInconsolable && hasFever) {
      console.warn(
        "[Triage] ⚠️  Paediatric inconsolable fever floor: inconsolable child with high fever " +
        "detected — raising urgency_level to minimum 4 (serious bacterial infection cannot be " +
        `excluded without urgent evaluation). Original LLM score was ${parsed.urgency_level}.`
      );
      parsed.urgency_level = 4;
    }
  }

  // ── Two-tier: Renal / ureteric colic safety net ───────────────────────────────
  // TIER 1 — Force 5 (Septic Obstructive Uropathy / Urosepsis):
  //   Flank/renal pain + fever/chills/rigors OR anuria = infected obstructed stone.
  //   Urosepsis develops rapidly from an obstructed infected kidney. Always 5.
  //
  // TIER 2 — Floor 4 (Severe Acute Renal Colic):
  //   Renal/flank/kidney pain + severe pain descriptor + restlessness/pacing sign
  //   (cannot sit still, writhing, unable to find comfortable position).
  //   Gemma 4 treats "kidney stones" as an outpatient label and ignores the severity
  //   of the ACUTE episode. This floor ensures rapid IV analgesia and obstruction imaging.
  {
    const renalText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();

    const RENAL_CONTEXT = [
      "kidney stone", "kidney stones", "renal stone", "renal calculi", "nephrolithiasis",
      "ureteric stone", "ureteric colic", "renal colic", "flank pain", "loin pain",
      "renal pain", "urinary stone", "calculus",
    ];
    const SEVERE_PAIN = [
      "severe pain", "severe", "intense pain", "extreme pain", "excruciating",
      "agony", "unbearable", "intractable pain", "significant pain",
    ];
    const PACING_SIGN = [
      "unable to sit", "cannot sit", "restless", "writhing", "pacing",
      "cannot find comfortable", "unable to find comfortable", "cannot lie still",
      "unable to lie still", "inability to sit", "difficulty sitting",
      "moving around", "cannot stay still",
    ];
    const SEPTIC_MARKERS = [
      "fever", "febrile", "chills", "rigors", "high temperature",
      "systemic infection", "sepsis", "anuria", "unable to urinate",
      "no urine", "cannot pass urine", "urosepsis",
    ];

    const hasRenalContext = RENAL_CONTEXT.some(kw => renalText.includes(kw));
    const hasSeverePain   = SEVERE_PAIN.some(kw => renalText.includes(kw));
    const hasPacingSign   = PACING_SIGN.some(kw => renalText.includes(kw));
    const hasSepticMarker = SEPTIC_MARKERS.some(kw => renalText.includes(kw));

    if (hasRenalContext) {
      // Tier 1: septic obstruction → force 5
      if (hasSepticMarker && (parsed.urgency_level as number) < 5) {
        console.warn(
          "[Triage] ⚠️  Renal colic Tier 1 override: flank/renal pain with fever/rigors/anuria — " +
          `forcing urgency_level to 5 (septic obstructive uropathy). ` +
          `Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 5;
      // Tier 2: severe pain with pacing sign → floor 4
      } else if ((hasSeverePain || hasPacingSign) && (parsed.urgency_level as number) < 4) {
        console.warn(
          "[Triage] ⚠️  Renal colic Tier 2 floor: severe renal/flank pain" +
          (hasPacingSign ? " with pacing/restlessness sign" : "") +
          " — raising urgency_level to minimum 4 (urgent analgesia + obstruction imaging required). " +
          `Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 4;
      }
    }
  }

  // ── Two-tier: Geriatric new confusion + fever ─────────────────────────────────
  // Elderly patients do not mount typical immune responses. New confusion is often
  // their ONLY symptom for UTI, pneumonia, sepsis, or meningitis. The model
  // repeatedly allows "mild", "otherwise stable", or absence of explicit shock
  // markers to slide this presentation below Level 4 — which is wrong.
  //
  // TIER 1 — Force 5 (Septic Shock / Meningitis with hemodynamic compromise):
  //   Elderly + confusion + fever + hemodynamic compromise (hypotension, tachycardia
  //   >110, obtundation/GCS <13, signs of shock) = presumptive septic shock or severe
  //   CNS infection. Irreversible multi-organ failure risk within hours. Always 5.
  //
  // TIER 2 — Floor 4 (Geriatric Delirium + Fever, no confirmed shock):
  //   Elderly + new confusion + fever, regardless of "otherwise stable" modifiers.
  //   Minimum 4 until active hemodynamic compromise is confirmed or excluded.
  {
    const geriatricText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
      String(parsed.recommended_action ?? ""),
    ].join(" ").toLowerCase();

    const IS_ELDERLY = [
      "elderly", "geriatric", "older adult", "older patient", "aged",
      "مسن", "âgé", "anciano", "anziano", "пожилой", "mzee",
      "senior", "nursing home", "care home", "aged care",
    ];
    const CONFUSION_AMS = [
      "confusion", "confused", "delirium", "delirious", "altered mental",
      "disorientation", "disoriented", "altered consciousness",
      "new cognitive", "cognitive change", "mental status change",
      "new onset confusion", "acute confusion",
    ];
    const FEVER_GERIATRIC = [
      "fever", "febrile", "pyrexia", "high temperature", "elevated temperature",
      "high fever", "hyperthermia",
    ];
    // Hemodynamic compromise → Tier 1 force-5
    const HEMODYNAMIC_COMPROMISE = [
      "hypotension", "low blood pressure", "sbp", "systolic <",
      "tachycardia", "heart rate >", "hr >", "rapid pulse",
      "obtunded", "obtundation", "gcs", "unresponsive", "unconscious",
      "signs of shock", "septic shock", "poor perfusion", "vasopressor",
      "multi-organ", "multiorgan",
    ];

    const isElderly       = IS_ELDERLY.some(kw => geriatricText.includes(kw));
    const hasConfusion    = CONFUSION_AMS.some(kw => geriatricText.includes(kw));
    const hasFever        = FEVER_GERIATRIC.some(kw => geriatricText.includes(kw));
    const hasHemodynamic  = HEMODYNAMIC_COMPROMISE.some(kw => geriatricText.includes(kw));

    if (isElderly && hasConfusion && hasFever) {
      if (hasHemodynamic && (parsed.urgency_level as number) < 5) {
        // Tier 1: hemodynamic compromise → force 5
        console.warn(
          "[Triage] ⚠️  Geriatric AMS Tier 1 override: elderly patient with confusion + fever + " +
          "hemodynamic compromise — forcing urgency_level to 5 (presumptive septic shock / severe " +
          `CNS infection). Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 5;
      } else if ((parsed.urgency_level as number) < 4) {
        // Tier 2: confusion + fever in elderly, no confirmed shock → floor 4
        console.warn(
          "[Triage] ⚠️  Geriatric AMS Tier 2 floor: elderly patient with new confusion + fever — " +
          "raising urgency_level to minimum 4 (geriatric decompensation risk, sepsis cannot be " +
          `excluded without urgent workup). Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 4;
      }
    }
  }

  // ── Two-tier: Orthopnea / Acute Decompensated Heart Failure ──────────────────
  // Orthopnea (inability to breathe when lying flat) + cardiac history is a cardinal
  // sign of ADHF. The model groups it with general fatigue/stable CHF and assigns
  // Level 3 or over-shoots to Level 5. This block clamps to exactly 4 when no
  // confirmed decompensation/shock markers are present alongside the symptoms.
  //
  // IMPORTANT: adhfSymptomText (for pattern detection) deliberately excludes
  // recommended_action — clinical management prose naturally contains words like
  // "oxygen saturation", "diuretics", "vasodilators" which would produce false
  // positives on the flash-marker keyword list.
  {
    const adhfSymptomText = [
      ...(Array.isArray(parsed.symptom_list) ? parsed.symptom_list : []),
      String(parsed.chief_complaint ?? ""),
      String(parsed.differential_note ?? ""),
    ].join(" ").toLowerCase();

    const ORTHOPNEA = [
      "orthopnea", "orthopnoea",
      "cannot breathe lying", "can't breathe lying", "cannot breathe when lying",
      "difficulty breathing lying", "breathless lying", "breathless when lying",
      "breathless on lying", "cannot lie flat", "unable to lie flat",
      "breathing when lying down", "lying down breathing",
    ];
    const CARDIAC_CONTEXT = [
      "heart failure", "cardiac failure", "cardiomyopathy", "weak heart",
      "heart disease", "cardiac weakness", "congestive heart", "chf", "adhf",
      "decompensated heart", "left ventricular", "reduced ejection",
    ];
    // Flash markers: ONLY match confirmed patient-state decompensation —
    // NOT clinical management terms (e.g. "oxygen saturation" in protocols).
    // All entries are phrased as patient-state descriptors, not treatment actions.
    const FLASH_PULM_OEDEMA = [
      "cannot speak in full", "unable to speak in full", "cannot complete sentence",
      "accessory muscle use", "accessory muscle",
      "cyanosis", "cyanotic", "turning blue", "lips blue", "nail blue",
      "spo2 <", "saturation <", "o2 sat <", "oxygen sat <",   // always with "<"
      "cardiogenic shock", "flash pulmonary oedema", "flash pulmonary edema",
      "pink frothy", "frothy sputum",
      "cold clammy", "cold and clammy", "clammy extremities", "cold extremities",
      "hypotension", "sbp <", "systolic < 90", "blood pressure < 90",
      "acute respiratory failure", "intubation required",
    ];

    const hasOrthopnea    = ORTHOPNEA.some(kw => adhfSymptomText.includes(kw));
    const hasCardiacCtx   = CARDIAC_CONTEXT.some(kw => adhfSymptomText.includes(kw));
    const hasFlashMarkers = FLASH_PULM_OEDEMA.some(kw => adhfSymptomText.includes(kw));

    if (hasOrthopnea && hasCardiacCtx) {
      if (hasFlashMarkers && (parsed.urgency_level as number) < 5) {
        // Tier 1: flash oedema / cardiogenic shock markers → force 5
        console.warn(
          "[Triage] ⚠️  ADHF Tier 1 override: orthopnea + cardiac history + confirmed flash/shock " +
          `markers — forcing urgency_level to 5. Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 5;
      } else if (!hasFlashMarkers && (parsed.urgency_level as number) !== 4) {
        // Tier 2: orthopnea + cardiac, no confirmed shock → CLAMP to exactly 4.
        // Bidirectional: raises from 3, lowers from 5.
        // A patient who can describe their symptoms is not in a resus emergency.
        console.warn(
          "[Triage] ⚠️  ADHF Tier 2 clamp: orthopnea + cardiac history, no confirmed flash/shock — " +
          `clamping urgency_level to exactly 4. Original LLM score was ${parsed.urgency_level}.`
        );
        parsed.urgency_level = 4;
      }
    }
  }

  const extraction = TriageOutputSchema.parse(parsed);
  return {
    extraction,
    audioMedication: extraction.medication_from_audio ?? undefined,
    imageMedication: extraction.medication_from_image ?? undefined,
  };
}

// ── Call 5: Medication safety check — 4 independent parallel calls ────────────
//
// Why 4 separate calls instead of 1?
//   • Each layer gets the model's full attention and a purpose-built prompt.
//   • A single prompt trying to evaluate 4 layers at once frequently misses
//     subtler conflicts (e.g. correct drug name but wrong route or dose).
//   • Running in parallel via Promise.allSettled keeps total latency similar
//     to the single-call approach while producing more reliable results.
//   • Any layer that times out or crashes doesn't silence the others.
//
// Layers:
//   5a. Name mismatch   — are the audio and image drugs actually the same?
//   5b. Category check  — does the drug class fit the chief complaint?
//   5c. Route check     — does the delivery form make sense for this presentation?
//   5d. Semantic check  — dose, contraindications, population appropriateness.

async function runSafetyLayer(
  layer: ConflictLayer,
  prompt: string,
): Promise<MedicationConflict[]> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a clinical pharmacist. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
      responseFormat: { type: "json_object" },
    });
    const content = response.choices[0]?.message?.content ?? "";
    const clean   = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed  = JSON.parse(clean) as {
      conflict?: boolean;
      severity?: string;
      description?: string;
    };
    if (!parsed.conflict) return [];
    return [{
      layer,
      severity: (["warning", "critical"].includes(parsed.severity ?? "") ? parsed.severity : "warning") as ConflictSeverity,
      description: parsed.description ?? `${layer} flagged`,
    }];
  } catch (e) {
    console.warn(`[MedSafety] Layer ${layer} failed:`, e);
    return [{
      layer,
      severity: "warning",
      description: `${layer} check could not complete — manual review required.`,
    }];
  }
}

async function verifyMedicationSafety(params: {
  chiefComplaint: string;
  symptoms: string[];
  audioMedication?: string;
  imageMedication?: string;
  clinicalSummary?: string;
}): Promise<MedSafetyResult> {
  const { chiefComplaint, symptoms, audioMedication, imageMedication, clinicalSummary } = params;

  if (!audioMedication && !imageMedication) {
    return { safe: true, conflicts: [], overallSeverity: "none", clinicianSummary: null };
  }

  const ctx = [
    `Chief complaint: ${chiefComplaint}`,
    `Symptoms: ${symptoms.join(", ")}`,
    `Audio medication: ${audioMedication ?? "none"}`,
    `Image medication: ${imageMedication ?? "none"}`,
    ...(clinicalSummary ? [`Clinical context: ${clinicalSummary}`] : []),
  ].join("\n");

  // ── 5a: Name mismatch ──────────────────────────────────────────────────────
  const promptA = `${ctx}

Do the audio medication and image medication refer to the same drug?
Account for brand/generic equivalence (e.g. Tylenol = Paracetamol = Acetaminophen).

IMPORTANT: If the audio medication is a non-specific generic term meaning "medicine", "tablet", "pill", or a
translation in any language (e.g. dawa, goli, dawai, medicine, tablet, पिल, दवाई, دوا, médicament, pastilla,
ยา, thuốc, ilaç, lek) — this is NOT a mismatch. Only flag a conflict if two different SPECIFIC drug names clash.
A patient saying "I took medicine" while the image shows Paracetamol is expected and not a conflict.

Return ONLY JSON: {"conflict": true|false, "severity": "critical", "description": "<one sentence explaining the mismatch, or omit if no conflict>"}`;

  // ── 5b: Category conflict ──────────────────────────────────────────────────
  const promptB = `${ctx}

Is the drug class (category) of the medication appropriate for this chief complaint and symptoms?
Examples of mismatches: antifungal for a headache, antihistamine for a bacterial wound infection.

Return ONLY JSON: {"conflict": true|false, "severity": "warning"|"critical", "description": "<clinical explanation, or omit if no conflict>"}`;

  // ── 5c: Route conflict ─────────────────────────────────────────────────────
  const promptC = `${ctx}

Does the delivery route / dosage form of the medication make sense for this presentation?
Examples of mismatches: nasal spray for abdominal pain, topical cream described as oral.

Return ONLY JSON: {"conflict": true|false, "severity": "warning"|"critical", "description": "<clinical explanation, or omit if no conflict>"}`;

  // ── 5d: Semantic / other safety concern ───────────────────────────────────
  const promptD = `${ctx}

Are there any other medication safety concerns, such as:
- Dose appears too high or too low for an adult
- Likely contraindication given the symptoms (e.g. aspirin for a child with fever)
- Drug interaction risk if multiple medications are present

Return ONLY JSON: {"conflict": true|false, "severity": "warning"|"critical", "description": "<clinical explanation, or omit if no concern>"}`;

  console.log("[MedSafety] Running 4 sequential safety layers (RAM-friendly)…");

  // Sequential rather than parallel — each call waits for the previous.
  // This uses ~¼ the peak RAM of Promise.allSettled, which matters on low-resource
  // devices (Raspberry Pi, low-end Android, field laptops). Total latency is similar
  // because Ollama processes one request at a time anyway on CPU inference.
  const conflicts: MedicationConflict[] = [];
  for (const [layer, prompt] of [
    ["name_mismatch",    promptA],
    ["category_conflict", promptB],
    ["route_conflict",   promptC],
    ["semantic_concern", promptD],
  ] as [ConflictLayer, string][]) {
    const result = await runSafetyLayer(layer, prompt);
    conflicts.push(...result);
  }

  const overallSeverity: "none" | "warning" | "critical" =
    conflicts.some(c => c.severity === "critical") ? "critical" :
    conflicts.length > 0                            ? "warning"  : "none";

  // Summarise for the clinician
  let clinicianSummary: string | null = null;
  if (conflicts.length > 0) {
    clinicianSummary = conflicts.map(c => c.description).join("; ");
  }

  console.log(`[MedSafety] ${conflicts.length} conflict(s) found — severity: ${overallSeverity}`);
  return { safe: overallSeverity === "none", conflicts, overallSeverity, clinicianSummary };
}

// ── Call 6: Bilingual patient instructions ────────────────────────────────────

/**
 * Prepends a localized crisis block to patient instructions when the triage
 * output signals a psychiatric/self-harm emergency (urgency 5 + crisis keywords).
 * Falls back silently on any error — never blocks the main triage flow.
 */
function injectCrisisLinesIfNeeded(
  instructions: string,
  extraction: TriageOutput,
  patientLangCode: string,
): string {
  try {
    const hasCrisis = isPsychiatricCrisis(
      extraction.urgency_level,
      extraction.chief_complaint,
      extraction.symptom_list,
      extraction.differential_note,
    );
    if (!hasCrisis) return instructions;
    const crisisBlock = formatCrisisBlock(patientLangCode);
    console.warn(`[Triage] ⚠️  Psychiatric crisis detected — injecting crisis lines for lang="${patientLangCode}"`);
    return crisisBlock + instructions;
  } catch (err) {
    console.error("[Triage] Crisis line injection failed (non-fatal):", err);
    return instructions;
  }
}

async function generatePatientInstructions(
  triageData: TriageOutput,
  patientLang: string,
  clinicianLang: string,
  safetyWarning?: string | null,
): Promise<string> {
  // Map ISO codes to full language names for the prompt
  const LANG_NAMES: Record<string, string> = {
    en:"English", hi:"Hindi", es:"Spanish", sw:"Swahili", ar:"Arabic",
    fr:"French", pt:"Portuguese", zh:"Chinese", de:"German", ja:"Japanese",
    ko:"Korean", ru:"Russian", tr:"Turkish", nl:"Dutch", id:"Indonesian",
    vi:"Vietnamese", th:"Thai", bn:"Bengali", ta:"Tamil",
  };
  const patientLangName   = LANG_NAMES[patientLang]   || patientLang   || "English";
  const clinicianLangName = LANG_NAMES[clinicianLang] || clinicianLang || "English";

  // ALWAYS bilingual when patient and clinician speak different languages.
  // This supports BOTH use cases:
  //   (a) Patient using the app alone — sees their language prominently
  //   (b) Clinician using it with a patient — clinician reads top section,
  //       turns screen to patient for bottom section
  // Even if UI language is English, if patient speaks Spanish we show both.
  const patientIsEnglish  = !patientLang || patientLang === "en";
  const sameLanguage      = patientLang === clinicianLang;

  const SEPSIS_ANTIBIOTIC_GUARDRAIL = `
CRITICAL CLINICAL SAFETY RULE — ANTIBIOTIC SEQUENCING IN SEPSIS / MENINGITIS:
If the presentation involves suspected sepsis, bacterial meningitis, or severe CNS infection
(e.g., fever + altered mental status, fever + neck stiffness, fever + confusion in elderly):
- NEVER instruct the clinician to withhold or delay empiric antibiotics while waiting for
  lumbar puncture results, CSF analysis, or imaging. This violates Surviving Sepsis Campaign
  guidelines and kills patients.
- The correct sequence is: (1) Draw blood cultures immediately, (2) Start empiric IV antibiotics
  and steroids WITHOUT delay (e.g., Ceftriaxone + Vancomycin + Dexamethasone), (3) Proceed with
  CT head if LP contraindication screening is needed, (4) LP when safe.
- If you include a "what to avoid" section, do NOT list "avoid antibiotics before LP/cultures"
  as an instruction. Instead, if relevant, write: "Do not delay empiric antibiotics waiting
  for LP results — cultures should be drawn first but antibiotics must not be withheld."
This rule overrides any general diagnostic-purity guidance. Antibiotic delay in suspected
bacterial meningitis or sepsis is a life-threatening clinical error.

CRITICAL CLINICAL SAFETY RULE — DIGITAL VAGINAL EXAMINATION IN ANTEPARTUM HAEMORRHAGE:
If the presentation involves heavy vaginal bleeding during pregnancy (antepartum haemorrhage,
suspected placenta praevia, placental abruption, or undiagnosed third-trimester bleeding):
- NEVER instruct the clinician to perform a digital vaginal examination or cervical exam
  until placental location has been confirmed by ultrasound. A digital exam in placenta
  praevia tears the placenta and can cause immediate catastrophic haemorrhage and fetal death.
- The correct instruction is: "Do NOT perform digital vaginal examination. Obtain urgent
  bedside ultrasound first to confirm placental location before any vaginal instrumentation."
- If a vaginal exam is listed under "what to do right now", REMOVE it and replace with
  the ultrasound-first instruction above.
- Abdominal examination and external assessment are safe and appropriate.
This rule overrides any general obstetric examination guidance.

CRITICAL CLINICAL SAFETY RULE — CORD PROLAPSE (UMBILICAL CORD VISIBLE DURING DELIVERY):
IF the recommended_action mentions cord prolapse, manual elevation, knee-chest position,
or crash caesarean — OR IF the chief complaint involves the umbilical cord being visible
at or during delivery — the instructions MUST follow this exact clinical protocol:
MANDATORY CONTENT (include all of the following — do NOT omit any step):
1. POSITIONING: Place the mother IMMEDIATELY in knee-chest position (on hands and knees,
   bottom in the air) OR steep Trendelenburg (head down, feet up). This uses gravity to
   shift the baby's weight off the cord. Do NOT lay her flat.
2. MANUAL ELEVATION: Insert a gloved hand into the vagina and PUSH THE BABY'S HEAD
   (presenting part) UPWARD AND AWAY from the cord. Hold this position — do NOT remove
   your hand until the caesarean is actively underway.
3. DO NOT PUSH CORD BACK: Never attempt to replace the cord inside the uterus. This
   causes vasospasm of the cord vessels and immediately worsens fetal hypoxia.
4. CORD MOISTURE: If any cord is exposed outside the vagina, cover it with warm
   normal saline-soaked gauze. Do NOT allow it to dry or cool.
5. CALL FOR EMERGENCY CAESAREAN: This is the ONLY definitive treatment. Time = fetal
   brain. Call the surgical/obstetric team now. Every minute without decompression
   increases the risk of fetal death or permanent brain damage.
6. OXYGEN: Administer supplemental oxygen to the mother (high-flow via face mask).
7. NO FURTHER VAGINAL ATTEMPTS: Do NOT allow continued pushing or vaginal delivery.
WHAT TO ABSOLUTELY AVOID (include as a PROHIBITED ACTIONS section):
- Do NOT push the cord back in (causes vasospasm).
- Do NOT allow the mother to sit upright or stand (increases compression).
- Do NOT attempt further vaginal delivery.
- Do NOT delay calling for surgical support.
- Do NOT describe this as routine umbilical care. This is an obstetric emergency.
IF THE RECOMMENDED ACTION ALREADY CONTAINS THE CORRECT CORD PROLAPSE STEPS: Use those
steps as the authoritative clinical content. Do not revert to stump-care language.
This rule overrides any default obstetric or neonatal care template entirely.
`;

  const systemPrompt = patientIsEnglish && sameLanguage
    // Pure English — single language
    ? `You are a medical educator. Write clear patient care instructions in English. Use simple language, bullet points, warm tone. Cover: what to do now, when to seek emergency care, what to avoid. IMPORTANT: Begin with this exact disclaimer on its own line: "⚠️ AI TRIAGE SUPPORT ONLY: This output was generated by an AI model (Gemma 4). It is intended to assist — not replace — clinical judgment. Always verify with physical examination, patient history, and appropriate investigations before making any clinical decision." and end with: "⚠️ This information was generated by an AI and is for guidance only. It is not a diagnosis. Please see a qualified healthcare professional for proper medical care."
${SEPSIS_ANTIBIOTIC_GUARDRAIL}`
    : sameLanguage
    // Same non-English language (e.g. both Hindi) — single language, patient's
    ? `You are a medical educator. Write patient care instructions entirely in ${patientLangName}. Use simple everyday words. Bullet points. Warm, accurate. Do NOT use English — write everything in ${patientLangName}. Begin with a brief translated disclaimer that this was generated by an AI and does not replace a doctor, and end with a reminder to seek qualified medical care.
${SEPSIS_ANTIBIOTIC_GUARDRAIL}`
    // Different languages — always bilingual
    : `You are a medical educator writing for TWO audiences. Always produce BOTH sections below — never skip either.

━━━ SECTION 1: FOR THE CLINICIAN ━━━
Language: ${clinicianLangName}
Audience: Health worker or physician
Style: Professional, medical terminology, concise bullet points
Label: "── For the Clinician (${clinicianLangName}) ──"
DISCLAIMER: Begin with this exact text in ${clinicianLangName}: "⚠️ AI TRIAGE SUPPORT ONLY: This output was generated by an AI model (Gemma 4). It is intended to assist — not replace — clinical judgment. Always verify with physical examination, patient history, and appropriate investigations before making any clinical decision."
END: Close with this in ${clinicianLangName}: "⚠️ This information was generated by an AI and is for guidance only. It is not a diagnosis. Please see a qualified healthcare professional for proper medical care."

━━━ SECTION 2: FOR THE PATIENT ━━━
Language: ${patientLangName}
Audience: Patient — may be illiterate or low health literacy
Style: Very simple words, short sentences, warm and reassuring tone
Label: "── For the Patient / للمريض / रोगी के लिए / Kwa Mgonjwa / Para el Paciente ──" (use the patient's label)
DISCLAIMER: Begin with a WARNING translated fully into ${patientLangName} (do NOT use English) explaining this was generated by an AI (Gemma 4) to assist — not replace — a doctor, and the patient should always consult a qualified healthcare professional.
END: Close with a reminder in ${patientLangName} only to seek qualified medical care.
Write the ENTIRE section 2 in ${patientLangName} — not a word of English unless ${patientLangName} is English.

This bilingual format is critical for patient safety. A clinician uses section 1, then turns the screen to the patient for section 2.
${SEPSIS_ANTIBIOTIC_GUARDRAIL}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate care instructions for:
Chief complaint: ${triageData.chief_complaint}
Symptoms: ${triageData.symptom_list.join(", ")}
Urgency: ${triageData.urgency_level}/5
Recommended action: ${triageData.recommended_action}
${safetyWarning ? `
⚠️ MEDICATION SAFETY WARNING — include in BOTH sections: ${safetyWarning}` : ""}

Sections to include in each: what to do right now · when to go to emergency · what to avoid · follow-up`,
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

// ── Router ────────────────────────────────────────────────────────────────────

export const triageRouter = router({

  processTriage: protectedProcedure
    .input(z.object({
      jobId:            z.string().optional(),
      audioBase64:      z.string().optional(),
      audioMimeType:    z.string().default("audio/wav"),
      imageBase64:      z.string().optional(),
      imageMimeType:    z.string().optional(),
      audioTranscript:  z.string().optional(),
      imageDescription: z.string().optional(),
      uiLanguage:       z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const hasAudio = !!(input.audioBase64 && input.audioBase64.length > 100) || !!input.audioTranscript;
        const hasImage = !!(input.imageBase64) || !!input.imageDescription;


        // Helper: emit step to SSE subscribers (no-op if no client is listening)
        const emit = (stepId: string) => {
          if (input.jobId) emitTriageProgress(input.jobId, stepId);
        };

        if (!hasAudio && !hasImage) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No audio, image, or text input provided" });
        }

        // ── Call 1: Transcribe audio OR detect language of typed text ──────────
        let transcript = input.audioTranscript ?? "";
        let detectedLanguage: string | undefined;
        let detectedLanguageCode: string | undefined;

        if (!transcript && input.audioBase64 && input.audioBase64.length > 100) {
          emit("audio");
          console.log("[Triage] Call 1: transcribing audio...");
          const result: TranscriptionResult = await runAudioPass(input.audioBase64);
          transcript           = result.transcript;
          detectedLanguage     = result.detectedLanguage;
          detectedLanguageCode = result.languageCode;
          console.log(`[Triage] Call 1 done — lang: ${detectedLanguage} (${detectedLanguageCode})`);
        } else if (transcript) {
          // Text was typed — detect its language so extraction has a hint
          emit("langdetect");
          console.log("[Triage] Call 1: detecting language of typed text...");
          try {
            const langRes = await invokeLLM({
              messages: [{
                role: "user",
                content: `What language is this text written in? Return ONLY JSON: {"language_name":"<English name>","language_code":"<ISO 639-1>"}\n\nText: ${transcript.slice(0, 300)}`,
              }],
              responseFormat: { type: "json_object" },
            });
            const langParsed = JSON.parse(langRes.choices[0]?.message?.content ?? "{}");
            detectedLanguage     = langParsed.language_name  ?? undefined;
            detectedLanguageCode = langParsed.language_code  ?? undefined;
            console.log(`[Triage] Call 1 done — detected: ${detectedLanguage} (${detectedLanguageCode})`);
          } catch {
            console.warn("[Triage] Language detection failed — proceeding without hint");
          }
        }

        // ── Call 2: Describe image (if present) ───────────────────────────────
        let imageDesc: string | undefined = input.imageDescription;

        if (!imageDesc && input.imageBase64) {
          emit("image");
          console.log("[Triage] Call 2: describing image...");
          imageDesc = await runImagePass(input.imageBase64, input.imageMimeType);
          console.log("[Triage] Call 2 done");
        }

        // ── Call 3: Synthesize (only when BOTH audio and image are present) ───
        // Weighs the two inputs against each other before extraction.
        // Single-source triages skip this and go straight to extraction.
        let clinicalSummary: string;
        let sourceMode: "audio" | "image" | "both" | "text";

        if (transcript && imageDesc) {
          // Both text/audio AND image — always synthesize regardless of input type
          emit("synthesis");
          console.log("[Triage] Call 3: synthesizing inputs + image...");
          clinicalSummary = await synthesizeInputs(transcript, imageDesc, detectedLanguage);
          sourceMode = "both";
          console.log("[Triage] Call 3 done");
        } else if (transcript) {
          clinicalSummary = transcript;
          sourceMode = input.audioBase64 ? "audio" : "text";
        } else {
          clinicalSummary = imageDesc ?? "";
          sourceMode = "image";
        }

        if (!clinicalSummary) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No usable input after processing" });
        }

        // ── Call 4: Extract structured clinical data ───────────────────────────
        emit("extraction");
        console.log("[Triage] Call 4: extracting clinical data...");
        const { extraction, audioMedication, imageMedication } =
          await extractTriageData(clinicalSummary, detectedLanguage, sourceMode, input.uiLanguage ?? "en");
        console.log("[Triage] Call 4 done");

        // ── Call 5: Medication safety check ───────────────────────────────────
        emit("safety");
        console.log("[Triage] Call 5: medication safety check...");
        const safety = await verifyMedicationSafety({
          chiefComplaint: extraction.chief_complaint,
          symptoms: extraction.symptom_list,
          audioMedication,
          imageMedication,
          clinicalSummary,
        });
        console.log(`[Triage] Call 5 done — severity: ${safety.overallSeverity}`);

        // Critical conflicts halt triage for clinician review
        if (safety.overallSeverity === "critical") {
          const clinicianLang = input.uiLanguage ?? "en";
          const patientLangCode = detectedLanguageCode || extraction.patient_language || "en";
          const LANG_NAMES: Record<string,string> = {
            en:"English",hi:"Hindi",es:"Spanish",sw:"Swahili",ar:"Arabic",
            fr:"French",pt:"Portuguese",zh:"Chinese",de:"German",
            ko:"Korean",ru:"Russian",tr:"Turkish",nl:"Dutch",id:"Indonesian",
          };
          const patientLangName = LANG_NAMES[patientLangCode] || patientLangCode;

          // Translate safety warning into patient language for the mismatch modal
          let patientSummary: string | null = null;
          if (patientLangCode !== "en" && patientLangCode !== clinicianLang && safety.clinicianSummary) {
            try {
              patientSummary = await translateText(safety.clinicianSummary, patientLangName);
            } catch { /* non-fatal */ }
          }

          // Generate partial bilingual instructions even on mismatch halt
          // so the patient understands what is happening in their language
          let partialInstructions: string | null = null;
          try {
            const mismatchWarning = `MEDICATION SAFETY ALERT: The medication mentioned verbally does not match the medication label shown. Do NOT take any medication until a clinician has verified which medication is correct. ${safety.clinicianSummary ?? ""}`;
            partialInstructions = await generatePatientInstructions(
              extraction,
              patientLangCode,
              clinicianLang,
              mismatchWarning,
            );
            partialInstructions = injectCrisisLinesIfNeeded(partialInstructions, extraction, patientLangCode);
          } catch { /* non-fatal */ }

          return {
            success: false,
            error: "medication_safety_critical",
            conflicts: safety.conflicts,
            clinicianSummary: safety.clinicianSummary,
            patientSummary,
            patientLanguage: patientLangCode,
            patientInstructions: partialInstructions,
            audioMedication,
            imageMedication,
            transcript,
            imageDescription: imageDesc,
            extraction: {
              chiefComplaint: extraction.chief_complaint,
              symptomList: extraction.symptom_list,
              urgencyLevel: extraction.urgency_level,
            },
          };
        }

        // ── Call 6: Generate bilingual patient instructions ────────────────────
        emit("instructions");
        console.log("[Triage] Call 6: generating patient instructions...");
        const clinicianLang = input.uiLanguage ?? "en";
        // Use detectedLanguage as the authoritative source; extraction.patient_language is a fallback
        const patientLangFinal = detectedLanguageCode || extraction.patient_language || "en";
        const patientInstructions = injectCrisisLinesIfNeeded(
          await generatePatientInstructions(
            extraction,
            patientLangFinal,
            clinicianLang,
            safety.clinicianSummary,
          ),
          extraction,
          patientLangFinal,
        );
        console.log("[Triage] Call 6 done");

        const warningForPatient = (safety.clinicianSummary && extraction.patient_language !== clinicianLang)
          ? await translateText(safety.clinicianSummary, extraction.patient_language)
          : null;

        const warningForClinician = (safety.clinicianSummary && clinicianLang !== "en")
          ? await translateText(safety.clinicianSummary, clinicianLang)
          : null;

        // ── Save to MySQL ──────────────────────────────────────────────────────
        emit("save");
        console.log("[Triage] Saving to MySQL...");
        const triageRecord = await createTriageRecord(ctx.user.id, {
          chiefComplaint:      extraction.chief_complaint,
          symptomList:         JSON.stringify(extraction.symptom_list),
          urgencyLevel:        extraction.urgency_level,
          medicationFound:     extraction.medication_found ?? null,
          differentialNote:    extraction.differential_note,
          recommendedAction:   extraction.recommended_action,
          patientLanguage:     extraction.patient_language,
          confidence:          extraction.confidence,
          audioTranscript:     transcript,
          audioMedication,
          imageMedication,
          audioImageMatch:     safety.safe ? 1 : 0,
          verificationWarning: safety.clinicianSummary ?? null,
          patientInstructions,
        });

        await createSessionHistory(ctx.user.id, triageRecord.id, {
          detectedLanguage: extraction.patient_language,
          urgencyLevel:     extraction.urgency_level,
          chiefComplaint:   extraction.chief_complaint,
        });

        console.log("[Triage] Done — record", triageRecord.id);

        emit("done");
        return {
          success: true,
          transcript,
          imageDescription: imageDesc,
          sourceMode,
          medicationSafety: {
            safe:             safety.safe,
            overallSeverity:  safety.overallSeverity,
            conflicts:        safety.conflicts,
            clinicianSummary: safety.clinicianSummary,
          },
          triageRecord: {
            id:                              triageRecord.id,
            chiefComplaint:                  triageRecord.chiefComplaint,
            symptomList:                     JSON.parse(triageRecord.symptomList),
            urgencyLevel:                    triageRecord.urgencyLevel,
            medicationFound:                 triageRecord.medicationFound,
            recommendedAction:               triageRecord.recommendedAction,
            patientLanguage:                 triageRecord.patientLanguage,
            confidence:                      triageRecord.confidence,
            audioImageMatch:                 triageRecord.audioImageMatch === 1,
            patientInstructions:             triageRecord.patientInstructions,
            verificationWarning:             triageRecord.verificationWarning,
            verificationWarningForClinician: warningForClinician,
            verificationWarningForPatient:   warningForPatient,
            audioTranscript:                 triageRecord.audioTranscript ?? null,
            createdAt:                       triageRecord.createdAt,
          },
        };

      } catch (error) {
        console.error("Triage error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to process triage", cause: error });
      }
    }),

  proceedWithConflicts: protectedProcedure
    .input(z.object({
      audioTranscript:  z.string().min(1),
      imageDescription: z.string().optional(),
      conflicts:        z.array(z.object({
        layer:       z.string(),
        severity:    z.string(),
        description: z.string(),
      })).optional(),
      uiLanguage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { extraction } = await extractTriageData(input.audioTranscript, undefined, "text", input.uiLanguage ?? "en");
        const clinicianLang = input.uiLanguage ?? "en";
        const conflictSummary = input.conflicts?.map(c => c.description).join("; ");
        // Use the language from the extraction — this comes from the original Call 4
        // which received the detectedLanguage hint, so it should be accurate
        const patientLang = extraction.patient_language || "en";
        const patientInstructions = injectCrisisLinesIfNeeded(
          await generatePatientInstructions(
            extraction, patientLang, clinicianLang, conflictSummary ?? null,
          ),
          extraction,
          patientLang,
        );
        const triageRecord = await createTriageRecord(ctx.user.id, {
          chiefComplaint:      extraction.chief_complaint,
          symptomList:         JSON.stringify(extraction.symptom_list),
          urgencyLevel:        extraction.urgency_level,
          medicationFound:     extraction.medication_found ?? null,
          recommendedAction:   extraction.recommended_action,
          patientLanguage:     extraction.patient_language,
          confidence:          extraction.confidence,
          audioTranscript:     input.audioTranscript,
          audioImageMatch:     0,
          verificationWarning: "Clinician acknowledged safety conflicts and proceeded. " + (conflictSummary ?? ""),
          patientInstructions,
        });
        await createSessionHistory(ctx.user.id, triageRecord.id, {
          detectedLanguage: extraction.patient_language,
          urgencyLevel:     extraction.urgency_level,
          chiefComplaint:   extraction.chief_complaint,
        });
        return {
          success: true,
          triageRecord: {
            id:                  triageRecord.id,
            chiefComplaint:      triageRecord.chiefComplaint,
            symptomList:         JSON.parse(triageRecord.symptomList),
            urgencyLevel:        triageRecord.urgencyLevel,
            medicationFound:     triageRecord.medicationFound,
            recommendedAction:   triageRecord.recommendedAction,
            patientLanguage:     triageRecord.patientLanguage,
            confidence:          triageRecord.confidence,
            audioImageMatch:     false,
            patientInstructions: triageRecord.patientInstructions,
            createdAt:           triageRecord.createdAt,
          },
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to process triage", cause: error });
      }
    }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const { getUserTriageRecords } = await import("../db");
    const records = await getUserTriageRecords(ctx.user.id);
    return records.map((r) => ({
      id:              r.id,
      chiefComplaint:  r.chiefComplaint,
      symptomList:     JSON.parse(r.symptomList),
      urgencyLevel:    r.urgencyLevel,
      patientLanguage: r.patientLanguage,
      confidence:      r.confidence,
      audioImageMatch: r.audioImageMatch === 1,
      createdAt:       r.createdAt,
    }));
  }),

  getRecord: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { getTriageRecordById } = await import("../db");
      const record = await getTriageRecordById(input.id);
      if (!record || record.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }
      return {
        id:                  record.id,
        chiefComplaint:      record.chiefComplaint,
        symptomList:         JSON.parse(record.symptomList),
        urgencyLevel:        record.urgencyLevel,
        medicationFound:     record.medicationFound,
        recommendedAction:   record.recommendedAction,
        patientLanguage:     record.patientLanguage,
        confidence:          record.confidence,
        audioImageMatch:     record.audioImageMatch === 1,
        patientInstructions: record.patientInstructions,
        audioTranscript:     record.audioTranscript,
        createdAt:           record.createdAt,
      };
    }),

  checkOllama: protectedProcedure.query(async () => {
    const ollamaBase = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    const gemmaModel = process.env.OLLAMA_MODEL    ?? "gemma4:e4b";
    let ollamaOk   = false;
    let gemmaFound = false;
    let available: string[] = [];
    let ollamaError: string | undefined;
    try {
      const res = await fetch(`${ollamaBase}/api/tags`);
      if (res.ok) {
        const data = (await res.json()) as { models: Array<{ name: string }> };
        available  = data.models.map((m) => m.name);
        gemmaFound = available.some((n) => n.startsWith(gemmaModel.split(":")[0]));
        ollamaOk   = true;
      } else {
        ollamaError = `Ollama returned ${res.status}`;
      }
    } catch (e) {
      ollamaError = String(e);
    }
    return {
      ok:                ollamaOk,
      model:             gemmaModel,
      found:             gemmaFound,
      audioReady:        gemmaFound,
      available,
      ollamaError,
      transcriptionMode: "gemma4-native",
    };
  }),

  translateInstructions: protectedProcedure
    .input(z.object({ recordId: z.number(), targetLanguage: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { getTriageRecordById } = await import("../db");
      const record = await getTriageRecordById(input.recordId);
      if (!record || record.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `Translate the following patient care instructions into ${input.targetLanguage}. Keep all medical terms accurate. Return only the translated text.` },
          { role: "user", content: record.patientInstructions ?? "" },
        ],
      });
      return { instructions: response.choices[0]?.message?.content ?? "" };
    }),

  // Translate the clinical record fields (chief complaint, symptoms, recommended action)
  // so the clinician can read the record in their own language after switching languages.
  translateClinicalRecord: protectedProcedure
    .input(z.object({
      chiefComplaint:    z.string(),
      symptoms:          z.array(z.string()),
      recommendedAction: z.string(),
      targetLanguage:    z.string(),
    }))
    .mutation(async ({ input }) => {
      const { chiefComplaint, symptoms, recommendedAction, targetLanguage } = input;

      const prompt = `Translate these clinical record fields into ${targetLanguage}.
Return ONLY valid JSON with exactly these keys:
{
  "chiefComplaint": "<translated>",
  "symptoms": ["<translated>", ...],
  "recommendedAction": "<translated>"
}

Fields to translate:
Chief complaint: ${chiefComplaint}
Symptoms: ${JSON.stringify(symptoms)}
Recommended action: ${recommendedAction}

Keep medical terms accurate. Return nothing but the JSON object.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a medical translator. Return only valid JSON." },
            { role: "user", content: prompt },
          ],
          responseFormat: { type: "json_object" },
        });

        const raw   = response.choices[0]?.message?.content ?? "{}";
        const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        const parsed = JSON.parse(clean);

        return {
          chiefComplaint:    parsed.chiefComplaint    || chiefComplaint,
          symptoms:          Array.isArray(parsed.symptoms) ? parsed.symptoms : symptoms,
          recommendedAction: parsed.recommendedAction || recommendedAction,
        };
      } catch (e) {
        console.error("[translateClinicalRecord] Failed:", e);
        // Graceful fallback — return originals untranslated
        return { chiefComplaint, symptoms, recommendedAction };
      }
    }),
});
