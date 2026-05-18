import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Shield, Globe, Wifi, Mic, FileText,
  AlertTriangle, Clock, Cpu, Languages, CheckCircle2,
} from "lucide-react";

const L: Record<string, {
  subtitle: string;
  missionP1: string;
  missionP2: string;
  multimodalDesc: string;
  safetyDesc: string;
  multilingualDesc: string;
  offlineDesc: string;
  urgencyTitle: string;
  urgencyDesc: string;
  dualTitle: string;
  dualDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;
  langSectionTitle: string;
  langSectionSubtitle: string;
  safetyTitle: string;
  privacyLabel: string;
  privacyDesc: string;
  confidenceLabel: string;
  confidenceDesc: string;
  medLabel: string;
  medDesc: string;
  urgencyTransLabel: string;
  urgencyTransDesc: string;
  disclaimer2: string;
}> = {
  "en": {
    subtitle: `An AI-powered clinical triage assistant built for frontline healthcare workers in low-resource and remote settings`,
    missionP1: `GemmaCare was built to address a critical gap in global healthcare: trained health workers in remote and under-resourced communities often lack the digital tools to quickly assess, document, and act on patient presentations. By running entirely on-device using the Gemma 4 E4B multimodal model, GemmaCare delivers instant clinical reasoning — with no internet required and no patient data ever leaving the device.`,
    missionP2: `Whether a community health worker is listening to a patient describe symptoms in Swahili, photographing a medication label in Hindi, or typing a chief complaint in Arabic, GemmaCare understands and responds — producing structured clinical records and patient-facing instructions in seconds.`,
    multimodalDesc: `Accepts patient audio recordings, spoken symptom descriptions, and medication label photos. Gemma 4 E4B natively transcribes audio and reads images — no separate speech or OCR model needed.`,
    safetyDesc: `Automatically cross-checks medications mentioned in audio against those visible in uploaded photos. Mismatches trigger a mandatory acknowledgment before triage can proceed.`,
    multilingualDesc: `Full UI in 25 languages. Gemma 4 E4B understands and responds in 35+ languages — patient instructions are automatically generated in the detected patient language.`,
    offlineDesc: `Runs entirely on-device via Ollama. Once the model is pulled, no internet connection is required. Patient data never leaves your hardware.`,
    urgencyTitle: `Urgency Scoring`,
    urgencyDesc: `Every triage produces a 1–5 urgency level (Routine → Emergency) with a confidence score. Results below 60% confidence are flagged with a visual warning.`,
    dualTitle: `Dual-Format Output`,
    dualDesc: `Generates a structured JSON clinical record for the healthcare worker and a plain-language patient instruction sheet — both automatically tailored to the detected language.`,
    step1Title: `Capture Patient Input`,
    step1Desc: `Upload or record patient audio (WAV / MP3) and optionally attach a photo of a medication label or wound. Text entry is also supported for typed symptom descriptions.`,
    step2Title: `AI Extraction`,
    step2Desc: `Gemma 4 E4B transcribes the audio, detects the patient's language, extracts symptoms, identifies any medications mentioned, and interprets image content — all in a single multimodal pass.`,
    step3Title: `Medication Cross-Check`,
    step3Desc: `If a medication label photo is provided, the model compares it against medications mentioned in audio. Any discrepancy halts the flow and requires explicit clinician acknowledgment.`,
    step4Title: `Clinical Record Generation`,
    step4Desc: `Produces a structured clinical record (chief complaint, symptoms, urgency level 1–5, recommended action, confidence score) and patient instructions in the detected language.`,
    step5Title: `Save & Review`,
    step5Desc: `All records are stored locally and accessible via the History tab, filterable by date, urgency level, and language. Nothing is transmitted to a server.`,
    langSectionTitle: `UI Languages — 25 Supported`,
    langSectionSubtitle: `The interface is fully translated into all 25 languages below. Gemma 4 E4B additionally understands and responds in 35+ languages for patient-language detection and instruction generation.`,
    safetyTitle: `Safety & Privacy`,
    privacyLabel: `Data Privacy`,
    privacyDesc: `All patient data is processed and stored exclusively on the local device. GemmaCare does not transmit audio, images, transcripts, or clinical records to any external server.`,
    confidenceLabel: `Confidence Scoring`,
    confidenceDesc: `Every triage result includes a model confidence score (0–100%). Results below 60% are visually flagged to prompt additional clinical review.`,
    medLabel: `Medication Safety`,
    medDesc: `The cross-verification system compares audio-reported medications against photo-identified labels. Mismatches require explicit acknowledgment and display a prominent warning before the triage record is finalised.`,
    urgencyTransLabel: `Urgency Transparency`,
    urgencyTransDesc: `Urgency levels 1–5 map to clinical categories (Routine / Priority / Urgent / Very Urgent / Emergency) with colour-coded indicators in all output views.`,
    disclaimer2: `Confidence scores reflect model certainty about its outputs — they are not a measure of clinical accuracy or diagnostic correctness. GemmaCare is designed to support, not replace, clinical decision-making by qualified healthcare professionals. Always apply clinical judgment before acting on any AI-generated recommendation.`
  },
  "fr": {
    subtitle: `Un assistant IA de triage clinique conçu pour les agents de santé de première ligne en milieu isolé ou à ressources limitées`,
    missionP1: `GemmaCare a été créé pour combler un vide critique dans la santé mondiale : les agents de santé formés dans les communautés éloignées manquent souvent d'outils numériques pour évaluer, documenter et réagir rapidement. En fonctionnant entièrement sur l'appareil via Gemma 4 E4B, GemmaCare offre un raisonnement clinique instantané — sans internet et sans que les données patient ne quittent jamais l'appareil.`,
    missionP2: `Qu'un agent écoute un patient décrire ses symptômes en swahili, photographie une étiquette en hindi ou saisisse un motif en arabe, GemmaCare comprend et répond — produisant des dossiers cliniques structurés et des instructions pour le patient en quelques secondes.`,
    multimodalDesc: `Accepte des enregistrements audio, des descriptions orales de symptômes et des photos d'étiquettes de médicaments. Gemma 4 E4B transcrit l'audio et lit les images nativement — aucun modèle vocal ou OCR séparé n'est nécessaire.`,
    safetyDesc: `Vérifie automatiquement les médicaments mentionnés dans l'audio par rapport à ceux visibles sur les photos téléchargées. Les discordances déclenchent une confirmation obligatoire.`,
    multilingualDesc: `Interface complète en 25 langues. Gemma 4 E4B comprend et répond dans 35+ langues — les instructions au patient sont automatiquement générées dans la langue détectée.`,
    offlineDesc: `Fonctionne entièrement sur l'appareil via Ollama. Une fois le modèle téléchargé, aucune connexion internet n'est requise. Les données patient ne quittent jamais votre matériel.`,
    urgencyTitle: `Niveau d'Urgence`,
    urgencyDesc: `Chaque triage produit un niveau d'urgence de 1 à 5 (Routine → Urgence) avec un score de confiance. Les résultats inférieurs à 60 % sont signalés visuellement.`,
    dualTitle: `Sortie Double Format`,
    dualDesc: `Génère un dossier clinique JSON structuré pour le professionnel et une fiche d'instructions en langage simple pour le patient — les deux automatiquement adaptés à la langue détectée.`,
    step1Title: `Saisir les Données Patient`,
    step1Desc: `Téléchargez ou enregistrez l'audio du patient (WAV / MP3) et joignez éventuellement une photo d'une étiquette de médicament ou d'une plaie.`,
    step2Title: `Extraction par IA`,
    step2Desc: `Gemma 4 E4B transcrit l'audio, détecte la langue du patient, extrait les symptômes, identifie les médicaments mentionnés et interprète le contenu des images — le tout en une seule analyse multimodale.`,
    step3Title: `Vérification des Médicaments`,
    step3Desc: `Si une photo d'étiquette est fournie, le modèle la compare aux médicaments mentionnés dans l'audio. Toute discordance interrompt le flux et exige une confirmation explicite.`,
    step4Title: `Génération du Dossier Clinique`,
    step4Desc: `Produit un dossier clinique structuré (motif, symptômes, niveau d'urgence 1–5, action recommandée, score de confiance) et des instructions dans la langue détectée.`,
    step5Title: `Enregistrer et Consulter`,
    step5Desc: `Tous les dossiers sont stockés localement et accessibles via l'onglet Historique, filtrables par date, niveau d'urgence et langue. Rien n'est transmis à un serveur.`,
    langSectionTitle: `Langues d'Interface — 25 Prises en Charge`,
    langSectionSubtitle: `L'interface est entièrement traduite dans les 25 langues ci-dessous. Gemma 4 E4B comprend et répond dans 35+ langues pour la détection de la langue patient et la génération d'instructions.`,
    safetyTitle: `Sécurité et Confidentialité`,
    privacyLabel: `Confidentialité des Données`,
    privacyDesc: `Toutes les données patient sont traitées et stockées exclusivement sur l'appareil local. GemmaCare ne transmet ni audio, ni images, ni transcriptions, ni dossiers cliniques à un serveur externe.`,
    confidenceLabel: `Score de Confiance`,
    confidenceDesc: `Chaque résultat de triage inclut un score de confiance du modèle (0–100%). Les résultats inférieurs à 60% sont signalés visuellement.`,
    medLabel: `Sécurité Médicamenteuse`,
    medDesc: `Le système de vérification croisée compare les médicaments rapportés dans l'audio aux étiquettes identifiées sur les photos. Les discordances requièrent une confirmation explicite avant la finalisation du dossier.`,
    urgencyTransLabel: `Transparence de l'Urgence`,
    urgencyTransDesc: `Les niveaux d'urgence 1–5 correspondent aux catégories cliniques (Routine / Prioritaire / Urgent / Très Urgent / Urgence) avec des indicateurs colorés dans toutes les vues.`,
    disclaimer2: `Les scores de confiance reflètent la certitude du modèle quant à ses sorties — ils ne mesurent pas la précision clinique. GemmaCare est conçu pour soutenir, et non remplacer, la prise de décision clinique par des professionnels qualifiés.`
  },
  "de": {
    subtitle: `Ein KI-gestützter klinischer Triage-Assistent für Gesundheitspersonal in ressourcenarmen und abgelegenen Gebieten`,
    missionP1: `GemmaCare wurde entwickelt, um eine kritische Lücke in der globalen Gesundheitsversorgung zu schließen: Ausgebildete Fachkräfte in abgelegenen Gemeinden fehlen oft digitale Werkzeuge zur schnellen Beurteilung und Dokumentation. Durch den Betrieb ausschließlich auf dem Gerät mit Gemma 4 E4B liefert GemmaCare sofortige klinische Einschätzungen — ohne Internet und ohne dass Patientendaten das Gerät verlassen.`,
    missionP2: `Ob ein Gemeindekrankenpfleger Symptome auf Swahili hört, ein Medikamentenetikett auf Hindi fotografiert oder eine Hauptbeschwerde auf Arabisch eintippt — GemmaCare versteht und antwortet, in Sekunden.`,
    multimodalDesc: `Nimmt Patientenaudioaufnahmen, Symptombeschreibungen und Fotos von Medikamentenetiketten entgegen. Gemma 4 E4B transkribiert Audio und liest Bilder nativ — kein separates Sprach- oder OCR-Modell erforderlich.`,
    safetyDesc: `Vergleicht automatisch im Audio erwähnte Medikamente mit denen auf hochgeladenen Fotos. Abweichungen lösen eine obligatorische Bestätigung aus.`,
    multilingualDesc: `Vollständige Benutzeroberfläche in 25 Sprachen. Gemma 4 E4B versteht und antwortet in 35+ Sprachen — Patientenanweisungen werden automatisch in der erkannten Sprache erstellt.`,
    offlineDesc: `Läuft vollständig auf dem Gerät über Ollama. Sobald das Modell heruntergeladen wurde, ist keine Internetverbindung erforderlich. Patientendaten verlassen Ihre Hardware nie.`,
    urgencyTitle: `Dringlichkeitsbewertung`,
    urgencyDesc: `Jedes Triage ergibt eine Dringlichkeitsstufe 1–5 (Routine → Notfall) mit einem Konfidenzscore. Ergebnisse unter 60 % werden visuell markiert.`,
    dualTitle: `Doppelformat-Ausgabe`,
    dualDesc: `Erstellt eine strukturierte JSON-Krankenakte für den Gesundheitsfachmann und eine leicht verständliche Patientenanleitung — beide automatisch an die erkannte Sprache angepasst.`,
    step1Title: `Patienteneingabe Erfassen`,
    step1Desc: `Laden Sie Patientenaudio (WAV / MP3) hoch oder nehmen Sie es auf und fügen Sie optional ein Foto eines Medikamentenetiketts oder einer Wunde hinzu.`,
    step2Title: `KI-Extraktion`,
    step2Desc: `Gemma 4 E4B transkribiert das Audio, erkennt die Patientensprache, extrahiert Symptome, identifiziert Medikamente und interpretiert Bildinhalte — alles in einem multimodalen Durchgang.`,
    step3Title: `Medikamenten-Gegenprüfung`,
    step3Desc: `Wenn ein Etikett-Foto bereitgestellt wird, vergleicht das Modell es mit den im Audio erwähnten Medikamenten. Jede Abweichung erfordert eine ausdrückliche Bestätigung.`,
    step4Title: `Klinische Akte Erstellen`,
    step4Desc: `Erstellt eine strukturierte Krankenakte (Hauptbeschwerde, Symptome, Dringlichkeitsstufe 1–5, empfohlene Maßnahme, Konfidenzscore) und Patientenanweisungen in der erkannten Sprache.`,
    step5Title: `Speichern und Prüfen`,
    step5Desc: `Alle Akten werden lokal gespeichert und sind über den Verlauf-Tab zugänglich, filterbar nach Datum, Dringlichkeitsstufe und Sprache. Nichts wird an einen Server übertragen.`,
    langSectionTitle: `UI-Sprachen — 25 Unterstützt`,
    langSectionSubtitle: `Die Benutzeroberfläche ist vollständig in alle 25 Sprachen unten übersetzt. Gemma 4 E4B versteht und antwortet zudem in 35+ Sprachen für die Patientensprachenerkennung.`,
    safetyTitle: `Sicherheit & Datenschutz`,
    privacyLabel: `Datenschutz`,
    privacyDesc: `Alle Patientendaten werden ausschließlich auf dem lokalen Gerät verarbeitet und gespeichert. GemmaCare überträgt weder Audio, Bilder, Transkripte noch Krankenakten an externe Server.`,
    confidenceLabel: `Konfidenzwertung`,
    confidenceDesc: `Jedes Triage-Ergebnis enthält einen Modell-Konfidenzscore (0–100%). Ergebnisse unter 60% werden visuell markiert.`,
    medLabel: `Medikamentensicherheit`,
    medDesc: `Das Querprüfungssystem vergleicht im Audio gemeldete Medikamente mit den auf Fotos identifizierten Etiketten. Abweichungen erfordern eine ausdrückliche Bestätigung.`,
    urgencyTransLabel: `Dringlichkeitstransparenz`,
    urgencyTransDesc: `Dringlichkeitsstufen 1–5 entsprechen klinischen Kategorien (Routine / Priorität / Dringend / Sehr Dringend / Notfall) mit farbcodierten Indikatoren.`,
    disclaimer2: `Konfidenzscores spiegeln die Modellsicherheit über seine Ausgaben wider — sie sind kein Maß für klinische Genauigkeit. GemmaCare unterstützt, ersetzt nicht die klinische Entscheidungsfindung qualifizierter Fachkräfte.`
  },
  "es": {
    subtitle: `Un asistente de triaje clínico con IA para trabajadores de salud en zonas remotas y con recursos limitados`,
    missionP1: `GemmaCare fue creado para abordar una brecha crítica en la salud global: los trabajadores de salud en comunidades remotas carecen a menudo de herramientas digitales para evaluar y documentar rápidamente. Al funcionar completamente en el dispositivo con Gemma 4 E4B, GemmaCare ofrece razonamiento clínico instantáneo — sin internet y sin que los datos del paciente abandonen el dispositivo.`,
    missionP2: `Ya sea que un agente escuche síntomas en suajili, fotografíe una etiqueta en hindi o escriba una queja en árabe, GemmaCare entiende y responde — generando registros clínicos e instrucciones para el paciente en segundos.`,
    multimodalDesc: `Acepta grabaciones de audio, descripciones habladas de síntomas y fotos de etiquetas de medicamentos. Gemma 4 E4B transcribe audio y lee imágenes de forma nativa — no se necesita modelo de voz u OCR separado.`,
    safetyDesc: `Coteja automáticamente los medicamentos mencionados en el audio con los visibles en las fotos subidas. Las discrepancias activan una confirmación obligatoria.`,
    multilingualDesc: `Interfaz completa en 25 idiomas. Gemma 4 E4B comprende y responde en 35+ idiomas — las instrucciones al paciente se generan automáticamente en el idioma detectado.`,
    offlineDesc: `Se ejecuta completamente en el dispositivo mediante Ollama. Una vez descargado el modelo, no se requiere internet. Los datos del paciente nunca abandonan su hardware.`,
    urgencyTitle: `Puntuación de Urgencia`,
    urgencyDesc: `Cada triaje produce un nivel de urgencia del 1 al 5 (Rutina → Emergencia) con una puntuación de confianza. Los resultados con confianza inferior al 60% se marcan visualmente.`,
    dualTitle: `Salida de Doble Formato`,
    dualDesc: `Genera un expediente clínico JSON estructurado para el profesional y una hoja de instrucciones en lenguaje sencillo para el paciente — ambos adaptados automáticamente al idioma detectado.`,
    step1Title: `Capturar Datos del Paciente`,
    step1Desc: `Suba o grabe el audio del paciente (WAV / MP3) y adjunte opcionalmente una foto de etiqueta de medicamento o herida.`,
    step2Title: `Extracción por IA`,
    step2Desc: `Gemma 4 E4B transcribe el audio, detecta el idioma del paciente, extrae síntomas, identifica medicamentos e interpreta imágenes — todo en un solo análisis multimodal.`,
    step3Title: `Verificación de Medicamentos`,
    step3Desc: `Si se proporciona una foto de etiqueta, el modelo la compara con los medicamentos del audio. Cualquier discrepancia detiene el flujo y requiere confirmación explícita.`,
    step4Title: `Generación del Expediente Clínico`,
    step4Desc: `Produce un expediente clínico estructurado (motivo, síntomas, nivel de urgencia 1–5, acción recomendada, puntuación de confianza) e instrucciones en el idioma detectado.`,
    step5Title: `Guardar y Revisar`,
    step5Desc: `Todos los registros se almacenan localmente y son accesibles desde el historial, filtrables por fecha, nivel de urgencia e idioma. Nada se transmite a un servidor.`,
    langSectionTitle: `Idiomas de la Interfaz — 25 Disponibles`,
    langSectionSubtitle: `La interfaz está completamente traducida a los 25 idiomas que se muestran a continuación. Gemma 4 E4B también comprende y responde en 35+ idiomas para la detección del idioma del paciente.`,
    safetyTitle: `Seguridad y Privacidad`,
    privacyLabel: `Privacidad de Datos`,
    privacyDesc: `Todos los datos del paciente se procesan y almacenan exclusivamente en el dispositivo local. GemmaCare no transmite audio, imágenes, transcripciones ni expedientes a ningún servidor externo.`,
    confidenceLabel: `Puntuación de Confianza`,
    confidenceDesc: `Cada resultado de triaje incluye una puntuación de confianza del modelo (0–100%). Los resultados por debajo del 60% se marcan visualmente.`,
    medLabel: `Seguridad Medicamentosa`,
    medDesc: `El sistema de verificación cruzada compara los medicamentos reportados en el audio con las etiquetas en las fotos. Las discrepancias requieren confirmación explícita.`,
    urgencyTransLabel: `Transparencia de Urgencia`,
    urgencyTransDesc: `Los niveles de urgencia 1–5 corresponden con categorías clínicas (Rutina / Prioridad / Urgente / Muy Urgente / Emergencia) con indicadores de colores.`,
    disclaimer2: `Las puntuaciones de confianza reflejan la certeza del modelo — no miden precisión clínica. GemmaCare está diseñado para apoyar, no reemplazar, la toma de decisiones clínicas de profesionales calificados.`
  },
  "it": {
    subtitle: `Un assistente di triage clinico basato su IA per operatori sanitari di prima linea in contesti remoti e a risorse limitate`,
    missionP1: `GemmaCare è stato creato per colmare una lacuna critica nell'assistenza sanitaria globale: gli operatori nelle comunità remote spesso mancano di strumenti digitali per valutare e documentare rapidamente. Funzionando interamente sul dispositivo tramite Gemma 4 E4B, GemmaCare fornisce ragionamento clinico istantaneo — senza internet e senza che i dati del paziente lascino mai il dispositivo.`,
    missionP2: `Che un operatore ascolti un paziente in swahili, fotografi un'etichetta in hindi o digiti un motivo in arabo, GemmaCare comprende e risponde — producendo cartelle cliniche strutturate e istruzioni per il paziente in pochi secondi.`,
    multimodalDesc: `Accetta registrazioni audio, descrizioni verbali dei sintomi e foto di etichette farmaceutiche. Gemma 4 E4B trascrive l'audio e legge le immagini in modo nativo — nessun modello vocale o OCR separato richiesto.`,
    safetyDesc: `Confronta automaticamente i farmaci menzionati nell'audio con quelli visibili nelle foto caricate. Le discrepanze richiedono una conferma obbligatoria.`,
    multilingualDesc: `Interfaccia completa in 25 lingue. Gemma 4 E4B comprende e risponde in 35+ lingue — le istruzioni al paziente vengono generate automaticamente nella lingua rilevata.`,
    offlineDesc: `Funziona interamente sul dispositivo tramite Ollama. Una volta scaricato il modello, non è necessaria alcuna connessione internet. I dati del paziente non lasciano mai il vostro hardware.`,
    urgencyTitle: `Punteggio di Urgenza`,
    urgencyDesc: `Ogni triage produce un livello di urgenza da 1 a 5 (Routine → Emergenza) con un punteggio di confidenza. I risultati inferiori al 60% vengono contrassegnati visivamente.`,
    dualTitle: `Output Doppio Formato`,
    dualDesc: `Genera una cartella clinica JSON strutturata per l'operatore e un foglio di istruzioni in linguaggio semplice per il paziente — entrambi adattati automaticamente alla lingua rilevata.`,
    step1Title: `Acquisire i Dati del Paziente`,
    step1Desc: `Carica o registra l'audio del paziente (WAV / MP3) e allega facoltativamente una foto di un'etichetta farmaceutica o di una ferita.`,
    step2Title: `Estrazione AI`,
    step2Desc: `Gemma 4 E4B trascrive l'audio, rileva la lingua del paziente, estrae i sintomi, identifica i farmaci e interpreta le immagini — il tutto in un'unica analisi multimodale.`,
    step3Title: `Verifica Incrociata dei Farmaci`,
    step3Desc: `Se viene fornita una foto dell'etichetta, il modello la confronta con i farmaci dell'audio. Qualsiasi discrepanza interrompe il flusso e richiede una conferma esplicita.`,
    step4Title: `Generazione della Cartella Clinica`,
    step4Desc: `Produce una cartella clinica strutturata (motivo, sintomi, livello di urgenza 1–5, azione raccomandata, punteggio di confidenza) e istruzioni nella lingua rilevata.`,
    step5Title: `Salvare e Revisionare`,
    step5Desc: `Tutte le cartelle sono memorizzate localmente e accessibili dalla scheda Cronologia, filtrabili per data, livello di urgenza e lingua. Nulla viene trasmesso a un server.`,
    langSectionTitle: `Lingue UI — 25 Supportate`,
    langSectionSubtitle: `L'interfaccia è completamente tradotta in tutte e 25 le lingue seguenti. Gemma 4 E4B comprende e risponde in 35+ lingue per il rilevamento della lingua del paziente.`,
    safetyTitle: `Sicurezza e Privacy`,
    privacyLabel: `Privacy dei Dati`,
    privacyDesc: `Tutti i dati del paziente vengono elaborati e memorizzati esclusivamente sul dispositivo locale. GemmaCare non trasmette audio, immagini, trascrizioni o cartelle cliniche a nessun server esterno.`,
    confidenceLabel: `Punteggio di Confidenza`,
    confidenceDesc: `Ogni risultato del triage include un punteggio di confidenza del modello (0–100%). I risultati inferiori al 60% vengono contrassegnati visivamente.`,
    medLabel: `Sicurezza Farmacologica`,
    medDesc: `Il sistema di verifica incrociata confronta i farmaci riportati nell'audio con le etichette nelle foto. Le discrepanze richiedono una conferma esplicita prima di finalizzare la cartella.`,
    urgencyTransLabel: `Trasparenza dell'Urgenza`,
    urgencyTransDesc: `I livelli di urgenza 1–5 corrispondono alle categorie cliniche (Routine / Priorità / Urgente / Molto Urgente / Emergenza) con indicatori a colori.`,
    disclaimer2: `I punteggi di confidenza riflettono la certezza del modello — non sono una misura della precisione clinica. GemmaCare è progettato per supportare, non sostituire, il processo decisionale clinico di professionisti qualificati.`
  },
  "nl": {
    subtitle: `Een AI-gestuurde klinische triage-assistent voor eerstelijnszorgverleners in afgelegen en resource-arme omgevingen`,
    missionP1: `GemmaCare is gebouwd om een kritieke kloof in de mondiale gezondheidszorg te dichten: opgeleide zorgverleners in afgelegen gemeenschappen missen vaak de digitale tools voor snelle beoordeling en documentatie. Door volledig op het apparaat te draaien via Gemma 4 E4B levert GemmaCare directe klinische redenering — zonder internet en zonder dat patiëntgegevens het apparaat verlaten.`,
    missionP2: `Of een zorgverlener luistert naar symptomen in het Swahili, een etiket fotografeert in het Hindi of een klacht typt in het Arabisch — GemmaCare begrijpt en reageert, in seconden.`,
    multimodalDesc: `Accepteert audioopnames, symptoomomschrijvingen en foto's van medicijnetiketten. Gemma 4 E4B transcribeert audio en leest afbeeldingen native — geen apart spraak- of OCR-model nodig.`,
    safetyDesc: `Controleert automatisch of medicijnen in de audio overeenkomen met die op geüploade foto's. Afwijkingen vereisen een verplichte bevestiging.`,
    multilingualDesc: `Volledige interface in 25 talen. Gemma 4 E4B begrijpt en antwoordt in 35+ talen — patiëntinstructies worden automatisch gegenereerd in de gedetecteerde taal.`,
    offlineDesc: `Draait volledig op het apparaat via Ollama. Zodra het model is gedownload, is geen internetverbinding nodig. Patiëntgegevens verlaten nooit uw hardware.`,
    urgencyTitle: `Urgentiebeoordeling`,
    urgencyDesc: `Elke triage levert een urgentieniveau 1–5 op (Routine → Noodsituatie) met een betrouwbaarheidsscore. Resultaten onder 60% worden gemarkeerd met een visuele waarschuwing.`,
    dualTitle: `Dubbel Formaat Uitvoer`,
    dualDesc: `Genereert een gestructureerd JSON-klinisch dossier voor de zorgverlener en een eenvoudige patiëntinstructiekaart — beide automatisch afgestemd op de gedetecteerde taal.`,
    step1Title: `Patiëntinvoer Vastleggen`,
    step1Desc: `Upload of neem patiëntaudio op (WAV / MP3) en voeg optioneel een foto van een medicijnetiket of wond toe.`,
    step2Title: `AI-extractie`,
    step2Desc: `Gemma 4 E4B transcribeert het audio, detecteert de taal, extraheert symptomen, identificeert medicijnen en interpreteert beeldinhoud — in één multimodale doorloop.`,
    step3Title: `Medicatieverificatie`,
    step3Desc: `Als er een foto van een medicijnetiket wordt verstrekt, vergelijkt het model dit met medicijnen in de audio. Afwijkingen stoppen de stroom en vereisen expliciete bevestiging.`,
    step4Title: `Klinisch Dossier Aanmaken`,
    step4Desc: `Produceert een gestructureerd klinisch dossier (hoofdklacht, symptomen, urgentieniveau 1–5, aanbevolen actie, betrouwbaarheidsscore) en patiëntinstructies in de gedetecteerde taal.`,
    step5Title: `Opslaan en Bekijken`,
    step5Desc: `Alle dossiers worden lokaal opgeslagen en zijn toegankelijk via het tabblad Geschiedenis, filterbaar op datum, urgentieniveau en taal. Er wordt niets naar een server verzonden.`,
    langSectionTitle: `UI-talen — 25 Ondersteund`,
    langSectionSubtitle: `De interface is volledig vertaald in alle 25 onderstaande talen. Gemma 4 E4B begrijpt en antwoordt bovendien in 35+ talen voor de detectie van de patiënttaal.`,
    safetyTitle: `Veiligheid & Privacy`,
    privacyLabel: `Gegevensprivacy`,
    privacyDesc: `Alle patiëntgegevens worden uitsluitend op het lokale apparaat verwerkt en opgeslagen. GemmaCare stuurt geen audio, afbeeldingen, transcripties of klinische dossiers naar externe servers.`,
    confidenceLabel: `Betrouwbaarheidsscore`,
    confidenceDesc: `Elk triageresultaat bevat een modelbetrouwbaarheidsscore (0–100%). Resultaten onder 60% worden visueel gemarkeerd.`,
    medLabel: `Medicatieveiligheid`,
    medDesc: `Het kruisverificatiesysteem vergelijkt in audio gemelde medicijnen met foto-geïdentificeerde etiketten. Afwijkingen vereisen expliciete bevestiging.`,
    urgencyTransLabel: `Urgentietransparantie`,
    urgencyTransDesc: `Urgentieniveaus 1–5 komen overeen met klinische categorieën (Routine / Prioriteit / Urgent / Zeer Urgent / Noodsituatie) met kleurgecodeerde indicatoren.`,
    disclaimer2: `Betrouwbaarheidsscores weerspiegelen de modelzekerheid — geen maatstaf voor klinische nauwkeurigheid. GemmaCare ondersteunt, vervangt niet de klinische besluitvorming van gekwalificeerde zorgverleners.`
  },
  "pt": {
    subtitle: `Um assistente de triagem clínica com IA para profissionais de saúde da linha de frente em ambientes remotos e com poucos recursos`,
    missionP1: `O GemmaCare foi criado para colmatar uma lacuna crítica nos cuidados de saúde globais: os profissionais em comunidades remotas frequentemente carecem de ferramentas digitais para avaliar e documentar rapidamente. Ao funcionar inteiramente no dispositivo com o Gemma 4 E4B, o GemmaCare fornece raciocínio clínico instantâneo — sem internet e sem que os dados do paciente saiam do dispositivo.`,
    missionP2: `Quer um agente esteja a ouvir sintomas em suaíli, a fotografar um rótulo em hindi ou a escrever uma queixa em árabe, o GemmaCare compreende e responde — produzindo registos clínicos e instruções para o paciente em segundos.`,
    multimodalDesc: `Aceita gravações de áudio, descrições orais de sintomas e fotos de rótulos de medicamentos. O Gemma 4 E4B transcreve áudio e lê imagens de forma nativa — não é necessário nenhum modelo de fala ou OCR separado.`,
    safetyDesc: `Verifica automaticamente os medicamentos do áudio em relação aos visíveis nas fotos enviadas. Discrepâncias requerem confirmação obrigatória.`,
    multilingualDesc: `Interface completa em 25 idiomas. O Gemma 4 E4B compreende e responde em 35+ idiomas — as instruções ao paciente são geradas automaticamente no idioma detectado.`,
    offlineDesc: `Funciona inteiramente no dispositivo via Ollama. Uma vez transferido o modelo, não é necessária ligação à internet. Os dados do paciente nunca saem do seu hardware.`,
    urgencyTitle: `Pontuação de Urgência`,
    urgencyDesc: `Cada triagem produz um nível de urgência de 1 a 5 (Rotina → Emergência) com uma pontuação de confiança. Resultados abaixo de 60% são assinalados visualmente.`,
    dualTitle: `Saída de Formato Duplo`,
    dualDesc: `Gera um registo clínico JSON estruturado para o profissional e uma folha de instruções em linguagem simples para o paciente — ambos adaptados automaticamente ao idioma detectado.`,
    step1Title: `Capturar Dados do Paciente`,
    step1Desc: `Carregue ou grave áudio do paciente (WAV / MP3) e anexe opcionalmente uma foto de rótulo de medicamento ou ferida.`,
    step2Title: `Extração por IA`,
    step2Desc: `O Gemma 4 E4B transcreve o áudio, deteta o idioma, extrai sintomas, identifica medicamentos e interpreta as imagens — tudo numa única passagem multimodal.`,
    step3Title: `Verificação Cruzada de Medicamentos`,
    step3Desc: `Se uma foto de rótulo for fornecida, o modelo compara-a com os medicamentos do áudio. Qualquer discrepância interrompe o fluxo e requer confirmação explícita.`,
    step4Title: `Geração do Registo Clínico`,
    step4Desc: `Produz um registo clínico estruturado (queixa principal, sintomas, nível de urgência 1–5, ação recomendada, pontuação de confiança) e instruções no idioma detectado.`,
    step5Title: `Guardar e Rever`,
    step5Desc: `Todos os registos são armazenados localmente e acessíveis pelo separador Histórico, filtráveis por data, nível de urgência e idioma. Nada é transmitido a um servidor.`,
    langSectionTitle: `Idiomas da Interface — 25 Suportados`,
    langSectionSubtitle: `A interface está totalmente traduzida em todos os 25 idiomas abaixo. O Gemma 4 E4B também compreende e responde em 35+ idiomas para deteção de idioma do paciente.`,
    safetyTitle: `Segurança e Privacidade`,
    privacyLabel: `Privacidade de Dados`,
    privacyDesc: `Todos os dados do paciente são processados e armazenados exclusivamente no dispositivo local. O GemmaCare não transmite áudio, imagens, transcrições ou registos clínicos para qualquer servidor externo.`,
    confidenceLabel: `Pontuação de Confiança`,
    confidenceDesc: `Cada resultado de triagem inclui uma pontuação de confiança do modelo (0–100%). Os resultados abaixo de 60% são assinalados visualmente.`,
    medLabel: `Segurança Medicamentosa`,
    medDesc: `O sistema de verificação cruzada compara os medicamentos do áudio com os rótulos nas fotos. As discrepâncias requerem confirmação explícita antes de finalizar o registo.`,
    urgencyTransLabel: `Transparência de Urgência`,
    urgencyTransDesc: `Os níveis de urgência 1–5 mapeiam para categorias clínicas (Rotina / Prioridade / Urgente / Muito Urgente / Emergência) com indicadores codificados por cores.`,
    disclaimer2: `As pontuações de confiança refletem a certeza do modelo — não são uma medida de precisão clínica. O GemmaCare foi concebido para apoiar, não substituir, a tomada de decisão clínica por profissionais qualificados.`
  },
  "pt_br": {
    subtitle: `Um assistente de triagem clínica com IA para profissionais de saúde da linha de frente em ambientes remotos e com recursos limitados`,
    missionP1: `O GemmaCare foi criado para preencher uma lacuna crítica nos cuidados de saúde globais: profissionais em comunidades remotas frequentemente não têm ferramentas digitais para avaliar e documentar rapidamente. Funcionando inteiramente no dispositivo com o Gemma 4 E4B, o GemmaCare oferece raciocínio clínico instantâneo — sem internet e sem que dados do paciente saiam do dispositivo.`,
    missionP2: `Seja um agente ouvindo sintomas em suaíli, fotografando um rótulo em hindi ou digitando uma queixa em árabe, o GemmaCare entende e responde — produzindo registros clínicos e instruções para o paciente em segundos.`,
    multimodalDesc: `Aceita gravações de áudio, descrições orais de sintomas e fotos de rótulos de medicamentos. O Gemma 4 E4B transcreve áudio e lê imagens nativamente — nenhum modelo de fala ou OCR separado é necessário.`,
    safetyDesc: `Verifica automaticamente os medicamentos do áudio em relação aos visíveis nas fotos enviadas. Discrepâncias acionam uma confirmação obrigatória.`,
    multilingualDesc: `Interface completa em 25 idiomas. O Gemma 4 E4B compreende e responde em 35+ idiomas — as instruções ao paciente são geradas automaticamente no idioma detectado.`,
    offlineDesc: `Funciona inteiramente no dispositivo via Ollama. Uma vez baixado o modelo, não é necessária conexão à internet. Os dados do paciente nunca saem do seu hardware.`,
    urgencyTitle: `Pontuação de Urgência`,
    urgencyDesc: `Cada triagem produz um nível de urgência de 1 a 5 (Rotina → Emergência) com pontuação de confiança. Resultados abaixo de 60% são sinalizados visualmente.`,
    dualTitle: `Saída em Formato Duplo`,
    dualDesc: `Gera um registro clínico JSON estruturado para o profissional e uma folha de instruções em linguagem simples para o paciente — ambos adaptados automaticamente ao idioma detectado.`,
    step1Title: `Capturar Dados do Paciente`,
    step1Desc: `Faça upload ou grave áudio do paciente (WAV / MP3) e opcionalmente anexe uma foto de rótulo de medicamento ou ferida.`,
    step2Title: `Extração por IA`,
    step2Desc: `O Gemma 4 E4B transcreve o áudio, detecta o idioma, extrai sintomas, identifica medicamentos e interpreta imagens — tudo em uma única passagem multimodal.`,
    step3Title: `Verificação Cruzada de Medicamentos`,
    step3Desc: `Se uma foto de rótulo for fornecida, o modelo a compara com os medicamentos do áudio. Qualquer discrepância interrompe o fluxo e requer confirmação explícita.`,
    step4Title: `Geração do Registro Clínico`,
    step4Desc: `Produz um registro clínico estruturado (queixa principal, sintomas, nível de urgência 1–5, ação recomendada, pontuação de confiança) e instruções no idioma detectado.`,
    step5Title: `Salvar e Revisar`,
    step5Desc: `Todos os registros são armazenados localmente e acessíveis pela guia Histórico, filtrável por data, nível de urgência e idioma. Nada é transmitido para um servidor.`,
    langSectionTitle: `Idiomas da Interface — 25 Suportados`,
    langSectionSubtitle: `A interface está completamente traduzida em todos os 25 idiomas abaixo. O Gemma 4 E4B também compreende e responde em 35+ idiomas para detecção de idioma do paciente.`,
    safetyTitle: `Segurança e Privacidade`,
    privacyLabel: `Privacidade de Dados`,
    privacyDesc: `Todos os dados do paciente são processados e armazenados exclusivamente no dispositivo local. O GemmaCare não transmite áudio, imagens, transcrições ou registros a nenhum servidor externo.`,
    confidenceLabel: `Pontuação de Confiança`,
    confidenceDesc: `Cada resultado de triagem inclui uma pontuação de confiança do modelo (0–100%). Resultados abaixo de 60% são sinalizados visualmente.`,
    medLabel: `Segurança Medicamentosa`,
    medDesc: `O sistema de verificação cruzada compara os medicamentos do áudio com os rótulos nas fotos. Discrepâncias requerem confirmação explícita antes de finalizar o registro.`,
    urgencyTransLabel: `Transparência de Urgência`,
    urgencyTransDesc: `Os níveis de urgência 1–5 correspondem a categorias clínicas (Rotina / Prioridade / Urgente / Muito Urgente / Emergência) com indicadores codificados por cores.`,
    disclaimer2: `As pontuações de confiança refletem a certeza do modelo — não são uma medida de precisão clínica. O GemmaCare é projetado para apoiar, não substituir, a tomada de decisões clínicas por profissionais qualificados.`
  },
  "ru": {
    subtitle: `ИИ-ассистент клинической сортировки для медработников первичного звена в отдалённых и малообеспеченных регионах`,
    missionP1: `GemmaCare создан для устранения критического пробела в глобальном здравоохранении: обученным медработникам в отдалённых сообществах часто не хватает цифровых инструментов для быстрой оценки и документирования. Работая полностью на устройстве через Gemma 4 E4B, GemmaCare обеспечивает мгновенное клиническое заключение — без интернета и без передачи данных пациента за пределы устройства.`,
    missionP2: `Слушает ли медработник симптомы на суахили, фотографирует этикетку на хинди или вводит жалобу на арабском — GemmaCare понимает и отвечает, создавая структурированные записи и инструкции за секунды.`,
    multimodalDesc: `Принимает аудиозаписи пациентов, устные описания симптомов и фотографии этикеток. Gemma 4 E4B нативно транскрибирует аудио и читает изображения — отдельная модель OCR не требуется.`,
    safetyDesc: `Автоматически сопоставляет лекарства из аудио с теми, что видны на загруженных фотографиях. Несоответствия требуют обязательного подтверждения.`,
    multilingualDesc: `Полный интерфейс на 25 языках. Gemma 4 E4B понимает и отвечает на 35+ языках — инструкции для пациентов генерируются на определённом языке автоматически.`,
    offlineDesc: `Работает полностью на устройстве через Ollama. После загрузки модели интернет не требуется. Данные пациента никогда не покидают ваше оборудование.`,
    urgencyTitle: `Оценка Срочности`,
    urgencyDesc: `Каждая сортировка даёт уровень срочности 1–5 (Плановый → Экстренный) с оценкой уверенности. Результаты ниже 60% отмечаются визуальным предупреждением.`,
    dualTitle: `Двойной Формат Вывода`,
    dualDesc: `Генерирует структурированную медицинскую карточку JSON для медработника и простые инструкции для пациента — оба автоматически адаптированы к определённому языку.`,
    step1Title: `Получить Данные Пациента`,
    step1Desc: `Загрузите или запишите аудио пациента (WAV / MP3) и при необходимости прикрепите фото этикетки или раны.`,
    step2Title: `Извлечение ИИ`,
    step2Desc: `Gemma 4 E4B транскрибирует аудио, определяет язык пациента, извлекает симптомы, идентифицирует лекарства и интерпретирует изображения — всё в одном мультимодальном проходе.`,
    step3Title: `Перекрёстная Проверка Лекарств`,
    step3Desc: `Если предоставлено фото этикетки, модель сравнивает его с лекарствами из аудио. Любое несоответствие останавливает процесс и требует явного подтверждения.`,
    step4Title: `Создание Клинической Карты`,
    step4Desc: `Создаёт структурированную медицинскую карту (главная жалоба, симптомы, уровень срочности 1–5, рекомендуемые действия, оценка уверенности) и инструкции на определённом языке.`,
    step5Title: `Сохранить и Проверить`,
    step5Desc: `Все карточки хранятся локально и доступны через вкладку История, фильтруемую по дате, уровню срочности и языку. Ничего не передаётся на сервер.`,
    langSectionTitle: `Языки интерфейса — 25 поддерживается`,
    langSectionSubtitle: `Интерфейс полностью переведён на все 25 языков ниже. Gemma 4 E4B дополнительно понимает и отвечает на 35+ языках для определения языка пациента.`,
    safetyTitle: `Безопасность и Конфиденциальность`,
    privacyLabel: `Конфиденциальность Данных`,
    privacyDesc: `Все данные пациентов обрабатываются и хранятся исключительно на локальном устройстве. GemmaCare не передаёт аудио, изображения, транскрипты или медицинские записи на внешние серверы.`,
    confidenceLabel: `Оценка Уверенности`,
    confidenceDesc: `Каждый результат сортировки включает оценку уверенности модели (0–100%). Результаты ниже 60% визуально отмечаются.`,
    medLabel: `Лекарственная Безопасность`,
    medDesc: `Система перекрёстной проверки сравнивает лекарства из аудио с этикетками на фотографиях. Несоответствия требуют явного подтверждения перед завершением карточки.`,
    urgencyTransLabel: `Прозрачность Срочности`,
    urgencyTransDesc: `Уровни срочности 1–5 соответствуют клиническим категориям (Плановый / Приоритетный / Срочный / Очень Срочный / Экстренный) с цветовыми индикаторами.`,
    disclaimer2: `Оценки уверенности отражают достоверность модели — они не являются мерой клинической точности. GemmaCare предназначен для поддержки, а не замены клинического принятия решений квалифицированными специалистами.`
  },
  "tr": {
    subtitle: `Uzak ve kısıtlı kaynaklı ortamlarda ön saflardaki sağlık çalışanları için yapay zeka destekli klinik triyaj asistanı`,
    missionP1: `GemmaCare, küresel sağlıktaki kritik bir boşluğu doldurmak için oluşturuldu: uzak topluluklardaki sağlık çalışanları genellikle hızlı değerlendirme için dijital araçlardan yoksundur. Gemma 4 E4B ile tamamen cihazda çalışarak anlık klinik akıl yürütme sağlar — internet olmadan ve hasta verileri cihazı terk etmeden.`,
    missionP2: `Bir sağlık çalışanı Swahili'de semptom dinliyor, Hindi'de etiket fotoğraflıyor veya Arapça şikayet yazıyor olsun — GemmaCare anlar ve yanıt verir, saniyeler içinde klinik kayıtlar üretir.`,
    multimodalDesc: `Hasta ses kayıtlarını, sözlü semptom tanımlarını ve ilaç etiketi fotoğraflarını kabul eder. Gemma 4 E4B sesi nativ olarak transkribe eder ve görüntüleri okur — ayrı OCR modeline gerek yoktur.`,
    safetyDesc: `Seste bahsedilen ilaçları yüklenen fotoğraflardakilerle otomatik olarak karşılaştırır. Uyuşmazlıklar zorunlu onay gerektirir.`,
    multilingualDesc: `25 dilde tam arayüz. Gemma 4 E4B 35+ dilde anlayıp yanıt verir — hasta talimatları otomatik olarak algılanan dilde oluşturulur.`,
    offlineDesc: `Tamamen Ollama aracılığıyla cihazda çalışır. Model indirildikten sonra internet bağlantısı gerekmez. Hasta verileri hiçbir zaman donanımınızı terk etmez.`,
    urgencyTitle: `Aciliyet Puanlaması`,
    urgencyDesc: `Her triyaj 1–5 aciliyet seviyesi (Rutin → Acil) ve güven puanı üretir. %60 altındaki sonuçlar görsel uyarıyla işaretlenir.`,
    dualTitle: `Çift Format Çıktısı`,
    dualDesc: `Sağlık çalışanı için yapılandırılmış JSON klinik kaydı ve hasta için sade dilli talimat sayfası oluşturur — her ikisi de algılanan dile otomatik olarak uyarlanır.`,
    step1Title: `Hasta Verisini Kaydet`,
    step1Desc: `Hasta sesini (WAV / MP3) yükleyin veya kaydedin; isteğe bağlı olarak ilaç etiketi veya yara fotoğrafı ekleyin.`,
    step2Title: `AI Çıkarımı`,
    step2Desc: `Gemma 4 E4B sesi transkribe eder, dili algılar, semptomları çıkarır, ilaçları belirler ve görüntü içeriğini yorumlar — tek bir çok modlu geçişte.`,
    step3Title: `İlaç Karşılaştırması`,
    step3Desc: `Bir ilaç etiketi fotoğrafı sağlanırsa, model bunu sestekilerle karşılaştırır. Tutarsızlık akışı durdurur ve klinisyenin açık onayını gerektirir.`,
    step4Title: `Klinik Kayıt Oluşturma`,
    step4Desc: `Yapılandırılmış klinik kayıt (ana şikayet, semptomlar, aciliyet 1–5, önerilen eylem, güven puanı) ve algılanan dilde hasta talimatları oluşturur.`,
    step5Title: `Kaydet ve İncele`,
    step5Desc: `Tüm kayıtlar yerel olarak saklanır ve Geçmiş sekmesinden tarih, aciliyet ve dile göre filtrelenebilir. Hiçbir şey sunucuya iletilmez.`,
    langSectionTitle: `Arayüz Dilleri — 25 Destekleniyor`,
    langSectionSubtitle: `Arayüz aşağıdaki 25 dilin tamamına çevrilmiştir. Gemma 4 E4B ayrıca hasta dili tespiti için 35+ dili anlayıp yanıt verir.`,
    safetyTitle: `Güvenlik ve Gizlilik`,
    privacyLabel: `Veri Gizliliği`,
    privacyDesc: `Tüm hasta verileri yalnızca yerel cihazda işlenir ve saklanır. GemmaCare herhangi bir harici sunucuya ses, görüntü, transkript veya klinik kayıt iletmez.`,
    confidenceLabel: `Güven Puanlaması`,
    confidenceDesc: `Her triyaj sonucu model güven puanı (0–100%) içerir. %60'ın altındaki sonuçlar görsel olarak işaretlenir.`,
    medLabel: `İlaç Güvenliği`,
    medDesc: `Çapraz doğrulama sistemi, sesteki ilaçları fotoğraflardaki etiketlerle karşılaştırır. Uyuşmazlıklar açık onay ve belirgin uyarı gerektirir.`,
    urgencyTransLabel: `Aciliyet Şeffaflığı`,
    urgencyTransDesc: `Aciliyet seviyeleri 1–5, renk kodlu göstergelerle klinik kategorilere karşılık gelir (Rutin / Öncelikli / Acil / Çok Acil / Emergencia).`,
    disclaimer2: `Güven puanları modelin çıktı kesinliğini yansıtır — klinik doğruluk ölçüsü değildir. GemmaCare nitelikli profesyonellerin klinik kararlarını desteklemek için tasarlanmıştır, yerini almak için değil.`
  },
  "zh": {
    subtitle: `专为低资源和偏远地区一线医疗工作者打造的 AI 临床分诊助手`,
    missionP1: `GemmaCare 的诞生是为了填补全球医疗的关键空白：偏远社区的医疗工作者往往缺乏快速评估和记录患者情况的数字工具。通过 Gemma 4 E4B 完全在设备上运行，GemmaCare 提供即时临床推理——无需互联网，患者数据也永远不会离开设备。`,
    missionP2: `无论社区医疗工作者是在听患者用斯瓦希里语描述症状、用印地语拍摄药品标签，还是用阿拉伯语输入主诉，GemmaCare 都能理解并回应——在几秒钟内生成结构化临床记录和患者指导说明。`,
    multimodalDesc: `接受患者音频录音、口语症状描述和药品标签照片。Gemma 4 E4B 原生转录音频并读取图像——无需单独的语音识别或 OCR 模型。`,
    safetyDesc: `自动将音频中提到的药物与上传照片中可见的药物进行交叉核对。不匹配时，在分诊继续进行之前需要强制确认。`,
    multilingualDesc: `完整界面支持 25 种语言。Gemma 4 E4B 能理解并以 35+ 种语言回应——患者指示自动以检测到的患者语言生成。`,
    offlineDesc: `完全通过 Ollama 在设备上运行。模型下载后不需要互联网连接。患者数据永远不会离开您的硬件。`,
    urgencyTitle: `紧迫性评分`,
    urgencyDesc: `每次分诊生成 1–5 级紧迫性级别（常规 → 紧急）和置信度分数。置信度低于 60% 的结果会附上视觉警告标记。`,
    dualTitle: `双格式输出`,
    dualDesc: `为医疗工作者生成结构化 JSON 临床记录，并为患者生成简明语言的指示表——两者均自动适配检测到的语言。`,
    step1Title: `采集患者信息`,
    step1Desc: `上传或录制患者音频（WAV / MP3），可选附上药品标签或伤口照片。同样支持文本输入症状描述。`,
    step2Title: `AI 提取`,
    step2Desc: `Gemma 4 E4B 转录音频、检测患者语言、提取症状、识别提及的药物并解读图像内容——全部在单次多模态推理中完成。`,
    step3Title: `药物交叉核对`,
    step3Desc: `如果提供了药品标签照片，模型会将其与音频中提到的药品进行比较。任何差异都会中止流程，需要临床人员明确确认。`,
    step4Title: `生成临床记录`,
    step4Desc: `生成结构化临床记录（主诉、症状、1–5 级紧迫性、建议行动、置信度分数）及检测语言的患者指导。`,
    step5Title: `保存与查看`,
    step5Desc: `所有记录均本地存储，可通过历史记录选项卡访问，可按日期、紧迫程度和语言筛选。没有任何内容传输到服务器。`,
    langSectionTitle: `界面语言 — 支持 25 种`,
    langSectionSubtitle: `界面已完整翻译为以下全部 25 种语言。Gemma 4 E4B 另外支持 35+ 种语言，用于患者语言检测和指导生成。`,
    safetyTitle: `安全与隐私`,
    privacyLabel: `数据隐私`,
    privacyDesc: `所有患者数据仅在本地设备上处理和存储。GemmaCare 不会将音频、图像、文本记录或临床记录传输到任何外部服务器。`,
    confidenceLabel: `置信度评分`,
    confidenceDesc: `每次分诊结果包含模型置信度分数（0–100%）。低于 60% 的结果会被视觉标记，以提示进行额外临床审查。`,
    medLabel: `药物安全`,
    medDesc: `交叉验证系统将音频中报告的药物与照片识别的标签进行比较。不匹配需要明确确认，并在分诊记录完成前显示醒目警告。`,
    urgencyTransLabel: `紧急程度透明度`,
    urgencyTransDesc: `紧迫性级别 1–5 对应临床类别（常规 / 优先 / 紧急 / 非常紧急 / 急救），所有输出视图均有颜色编码指示器。`,
    disclaimer2: `置信度分数反映的是模型对其输出的确定性——而非临床准确性或诊断正确性的衡量标准。GemmaCare 旨在支持而非取代合格医疗专业人员的临床决策。`
  },
  "zh_tw": {
    subtitle: `專為低資源及偏遠地區前線醫療工作者打造的 AI 臨床分流助手`,
    missionP1: `GemmaCare 的誕生是為了填補全球醫療的關鍵空白：偏遠社區受過訓練的醫療工作者往往缺乏快速評估和記錄患者情況的數位工具。透過 Gemma 4 E4B 完全在裝置上運行，GemmaCare 提供即時臨床推理——無需網路，患者資料也永遠不會離開裝置。`,
    missionP2: `無論社區醫療工作者是聆聽患者以斯瓦希里語描述症狀、用印地語拍攝藥品標籤，還是用阿拉伯語輸入主訴，GemmaCare 都能理解並回應——在數秒內產生結構化臨床記錄和患者指導說明。`,
    multimodalDesc: `接受患者音訊錄音、口頭症狀描述和藥品標籤照片。Gemma 4 E4B 原生轉錄音訊並讀取圖像——無需單獨的語音辨識或 OCR 模型。`,
    safetyDesc: `自動將音訊中提到的藥物與上傳照片中可見的藥物進行交叉核對。不符時，需在分流繼續進行前強制確認。`,
    multilingualDesc: `完整介面支援 25 種語言。Gemma 4 E4B 能理解並以 35+ 種語言回應——患者指示自動以偵測到的患者語言生成。`,
    offlineDesc: `完全透過 Ollama 在裝置上運行。模型下載後不需要網路連接。患者資料永遠不會離開您的硬體。`,
    urgencyTitle: `緊迫性評分`,
    urgencyDesc: `每次分流生成 1–5 級緊迫性級別（常規 → 緊急）和置信度分數。置信度低於 60% 的結果會附上視覺警告標記。`,
    dualTitle: `雙格式輸出`,
    dualDesc: `為醫療工作者生成結構化 JSON 臨床記錄，並為患者生成簡明語言的指示表——兩者均自動適配偵測到的語言。`,
    step1Title: `採集患者資訊`,
    step1Desc: `上傳或錄製患者音訊（WAV / MP3），可選附上藥品標籤或傷口照片。同樣支援文字輸入症狀描述。`,
    step2Title: `AI 提取`,
    step2Desc: `Gemma 4 E4B 轉錄音訊、偵測患者語言、提取症狀、識別提及的藥物並解讀圖像內容——全部在單次多模態推理中完成。`,
    step3Title: `藥物交叉核對`,
    step3Desc: `如果提供了藥品標籤照片，模型會將其與音訊中提到的藥品進行比較。任何差異都會中止流程，需要臨床人員明確確認。`,
    step4Title: `生成臨床記錄`,
    step4Desc: `生成結構化臨床記錄（主訴、症狀、1–5 級緊迫性、建議行動、置信度分數）及偵測語言的患者指導。`,
    step5Title: `儲存與查看`,
    step5Desc: `所有記錄均本地儲存，可透過歷史記錄分頁訪問，可按日期、緊迫程度和語言篩選。沒有任何內容傳輸到伺服器。`,
    langSectionTitle: `介面語言 — 支援 25 種`,
    langSectionSubtitle: `介面已完整翻譯為以下全部 25 種語言。Gemma 4 E4B 另外支援 35+ 種語言，用於患者語言偵測和指導生成。`,
    safetyTitle: `安全與隱私`,
    privacyLabel: `資料隱私`,
    privacyDesc: `所有患者資料僅在本地裝置上處理和儲存。GemmaCare 不會將音訊、圖像、文字記錄或臨床記錄傳輸到任何外部伺服器。`,
    confidenceLabel: `置信度評分`,
    confidenceDesc: `每次分流結果包含模型置信度分數（0–100%）。低於 60% 的結果會被視覺標記，以提示進行額外臨床審查。`,
    medLabel: `藥物安全`,
    medDesc: `交叉驗證系統將音訊中報告的藥物與照片識別的標籤進行比較。不匹配需要明確確認，並在分流記錄完成前顯示醒目警告。`,
    urgencyTransLabel: `緊急程度透明度`,
    urgencyTransDesc: `緊迫性級別 1–5 對應臨床類別（常規 / 優先 / 緊急 / 非常緊急 / 急救），所有輸出視圖均有顏色編碼指示器。`,
    disclaimer2: `置信度分數反映的是模型對其輸出的確定性——而非臨床準確性或診斷正確性的衡量標準。GemmaCare 旨在支持而非取代合格醫療專業人員的臨床決策。`
  },
  "ja": {
    subtitle: `資源の乏しい地域や遠隔地の最前線の医療従事者向けに構築されたAI臨床トリアージアシスタント`,
    missionP1: `GemmaCareは、グローバルヘルスケアの重大なギャップを解消するために構築されました。遠隔地のコミュニティで訓練された医療従事者は、患者の状態を迅速に評価・記録するためのデジタルツールが不足していることが多いです。Gemma 4 E4Bを使用してデバイス上で完全に動作するGemmaCareは、インターネット不要かつ患者データが外部に出ることなく、即時の臨床推論を提供します。`,
    missionP2: `コミュニティヘルスワーカーがスワヒリ語で症状を説明する患者の話を聞いていても、ヒンディー語で薬のラベルを撮影していても、アラビア語で主訴を入力していても、GemmaCareは理解して応答し、数秒で構造化された臨床記録と患者向け指示を作成します。`,
    multimodalDesc: `患者の音声録音、症状の口頭説明、薬のラベル写真を受け付けます。Gemma 4 E4Bはネイティブで音声を文字に変換し、画像を読み取ります—別の音声認識モデルやOCRモデルは不要です。`,
    safetyDesc: `音声で言及された薬と、アップロードされた写真に見える薬を自動的に照合します。不一致がある場合、トリアージを続ける前に必須の確認が求められます。`,
    multilingualDesc: `25言語で完全なUI。Gemma 4 E4Bは35以上の言語を理解して回答します。患者向けの指示は検出された患者の言語で自動的に生成されます。`,
    offlineDesc: `Ollamaを介してデバイス上で完全に動作します。モデルをダウンロードすれば、インターネット接続は不要です。患者データはハードウェアの外に出ることはありません。`,
    urgencyTitle: `緊急度スコアリング`,
    urgencyDesc: `すべてのトリアージは緊急度レベル1–5（日常 → 緊急）と信頼度スコアを生成します。信頼度60%未満の結果はビジュアル警告で表示されます。`,
    dualTitle: `デュアルフォーマット出力`,
    dualDesc: `医療従事者向けの構造化されたJSON臨床記録と、平易な言葉で書かれた患者向け指示シートを生成します。どちらも検出された言語に自動的に調整されます。`,
    step1Title: `患者情報を取得`,
    step1Desc: `患者の音声（WAV / MP3）をアップロードまたは録音し、必要に応じて薬のラベルや傷の写真を添付します。症状のテキスト入力も対応しています。`,
    step2Title: `AI抽出`,
    step2Desc: `Gemma 4 E4Bは音声を文字化し、患者の言語を検出し、症状を抽出し、言及された薬を特定し、画像の内容を解釈します—これらすべてを1回のマルチモーダル処理で行います。`,
    step3Title: `薬の照合`,
    step3Desc: `薬のラベル写真が提供された場合、モデルは音声で言及された薬と照合します。不一致があれば処理が中止され、臨床家の明示的な確認が必要になります。`,
    step4Title: `臨床記録の生成`,
    step4Desc: `構造化された臨床記録（主訴、症状、緊急度レベル1–5、推奨処置、信頼度スコア）と検出された言語での患者向け指示を作成します。`,
    step5Title: `保存とレビュー`,
    step5Desc: `すべての記録はローカルに保存され、履歴タブから日付、緊急度、言語でフィルタリングしてアクセスできます。サーバーへは何も送信されません。`,
    langSectionTitle: `UI言語 — 25言語対応`,
    langSectionSubtitle: `インターフェースは以下の25言語すべてに完全翻訳されています。Gemma 4 E4Bはさらに35以上の言語を理解・応答し、患者の言語検出と指示生成に対応しています。`,
    safetyTitle: `安全性とプライバシー`,
    privacyLabel: `データプライバシー`,
    privacyDesc: `すべての患者データはローカルデバイスのみで処理・保存されます。GemmaCareは音声、画像、テキスト、臨床記録を外部サーバーへ送信しません。`,
    confidenceLabel: `信頼度スコアリング`,
    confidenceDesc: `すべてのトリアージ結果にモデルの信頼度スコア（0–100%）が含まれます。60%未満の結果は、追加の臨床レビューを促すため視覚的に表示されます。`,
    medLabel: `薬の安全性`,
    medDesc: `交叉確認システムは、音声で報告された薬と写真で確認されたラベルを比較します。不一致の場合、記録が確定される前に明示的な確認と目立つ警告が表示されます。`,
    urgencyTransLabel: `緊急度の透明性`,
    urgencyTransDesc: `緊急度レベル1–5は、すべての出力ビューにおいてカラーコードのインジケーターで臨床カテゴリ（日常 / 優先 / 緊急 / 非常に緊急 / 緊急事態）にマッピングされます。`,
    disclaimer2: `信頼度スコアはモデルが出力に対して持つ確信度を反映しており、臨床精度や診断の正確さを測るものではありません。GemmaCareは、資格のある医療専門家による臨床意思決定を代替するのではなく、支援するために設計されています。`
  },
  "ko": {
    subtitle: `자원이 부족하고 원격 지역의 일선 의료 종사자를 위해 구축된 AI 임상 트리아지 어시스턴트`,
    missionP1: `GemmaCare는 전 세계 의료의 중요한 격차를 해소하기 위해 구축되었습니다. 오지 지역사회의 훈련된 의료 종사자들은 환자 상태를 신속하게 평가하고 문서화할 디지털 도구가 부족한 경우가 많습니다. Gemma 4 E4B를 사용하여 기기에서 완전히 실행되는 GemmaCare는 인터넷 없이, 환자 데이터가 기기 밖으로 나가지 않으면서 즉각적인 임상 추론을 제공합니다.`,
    missionP2: `지역사회 의료 종사자가 스와힐리어로 증상을 설명하는 환자의 말을 듣든, 힌디어로 약 라벨을 촬영하든, 아랍어로 주 호소를 입력하든 — GemmaCare는 이해하고 응답합니다. 몇 초 안에 구조화된 임상 기록과 환자 안내문을 생성합니다.`,
    multimodalDesc: `환자 오디오 녹음, 구두 증상 설명, 약 라벨 사진을 받아들입니다. Gemma 4 E4B는 음성을 기본으로 전사하고 이미지를 읽습니다 — 별도의 음성 인식 또는 OCR 모델이 필요하지 않습니다.`,
    safetyDesc: `오디오에 언급된 약물을 업로드된 사진에 보이는 약물과 자동으로 교차 확인합니다. 불일치 시 트리아지를 계속하기 전에 필수 확인이 요구됩니다.`,
    multilingualDesc: `25개 언어로 완전한 UI. Gemma 4 E4B는 35개 이상의 언어를 이해하고 응답합니다 — 환자 지시사항은 감지된 환자 언어로 자동 생성됩니다.`,
    offlineDesc: `Ollama를 통해 기기에서 완전히 실행됩니다. 모델을 다운로드하면 인터넷 연결이 필요하지 않습니다. 환자 데이터는 절대 하드웨어 밖으로 나가지 않습니다.`,
    urgencyTitle: `긴급도 점수`,
    urgencyDesc: `모든 트리아지는 1–5 긴급도 수준(일상 → 응급)과 신뢰도 점수를 생성합니다. 신뢰도 60% 미만 결과는 시각적 경고로 표시됩니다.`,
    dualTitle: `이중 형식 출력`,
    dualDesc: `의료 종사자를 위한 구조화된 JSON 임상 기록과 평이한 언어의 환자 안내문을 생성합니다 — 둘 다 감지된 언어에 자동으로 맞춰집니다.`,
    step1Title: `환자 정보 수집`,
    step1Desc: `환자 오디오(WAV / MP3)를 업로드하거나 녹음하고, 선택적으로 약 라벨이나 상처 사진을 첨부하세요.`,
    step2Title: `AI 추출`,
    step2Desc: `Gemma 4 E4B는 오디오를 전사하고, 환자의 언어를 감지하고, 증상을 추출하고, 언급된 약물을 식별하고, 이미지 내용을 해석합니다 — 모두 단일 멀티모달 패스로 처리됩니다.`,
    step3Title: `약물 교차 확인`,
    step3Desc: `약 라벨 사진이 제공되면 모델이 오디오에서 언급된 약물과 비교합니다. 불일치 시 흐름이 중단되고 임상의의 명시적 확인이 필요합니다.`,
    step4Title: `임상 기록 생성`,
    step4Desc: `구조화된 임상 기록(주 호소, 증상, 긴급도 수준 1–5, 권장 조치, 신뢰도 점수)과 감지된 언어의 환자 안내문을 생성합니다.`,
    step5Title: `저장 및 검토`,
    step5Desc: `모든 기록은 로컬에 저장되며 기록 탭을 통해 날짜, 긴급도 수준, 언어로 필터링하여 접근할 수 있습니다. 서버에 전송되는 내용은 없습니다.`,
    langSectionTitle: `UI 언어 — 25개 지원`,
    langSectionSubtitle: `인터페이스는 아래의 25개 언어 모두로 완전히 번역되어 있습니다. Gemma 4 E4B는 환자 언어 감지 및 안내문 생성을 위해 추가로 35개 이상의 언어를 이해하고 응답합니다.`,
    safetyTitle: `안전 및 개인정보 보호`,
    privacyLabel: `데이터 개인정보 보호`,
    privacyDesc: `모든 환자 데이터는 로컬 기기에서만 처리되고 저장됩니다. GemmaCare는 오디오, 이미지, 전사본, 임상 기록을 외부 서버로 전송하지 않습니다.`,
    confidenceLabel: `신뢰도 점수`,
    confidenceDesc: `모든 트리아지 결과에는 모델 신뢰도 점수(0–100%)가 포함됩니다. 60% 미만의 결과는 추가 임상 검토를 촉구하기 위해 시각적으로 표시됩니다.`,
    medLabel: `약물 안전`,
    medDesc: `교차 검증 시스템은 오디오에서 보고된 약물과 사진으로 확인된 라벨을 비교합니다. 불일치 시 명시적 확인이 필요하고 기록이 완료되기 전에 눈에 띄는 경고가 표시됩니다.`,
    urgencyTransLabel: `긴급도 투명성`,
    urgencyTransDesc: `긴급도 수준 1–5는 모든 출력 보기에서 색상으로 구분된 표시기와 함께 임상 범주(일상 / 우선 / 긴급 / 매우 긴급 / 응급)에 매핑됩니다.`,
    disclaimer2: `신뢰도 점수는 출력에 대한 모델의 확신도를 반영하며, 임상 정확도나 진단 정확성의 척도가 아닙니다. GemmaCare는 자격 있는 의료 전문가의 임상 의사결정을 대체하는 것이 아니라 지원하도록 설계되었습니다.`
  },
  "vi": {
    subtitle: `Trợ lý phân loại lâm sàng bằng AI được xây dựng cho nhân viên y tế tuyến đầu ở các khu vực xa xôi và thiếu tài nguyên`,
    missionP1: `GemmaCare được xây dựng để giải quyết khoảng trống quan trọng trong y tế toàn cầu: nhân viên y tế ở các cộng đồng xa xôi thường thiếu công cụ kỹ thuật số để đánh giá và ghi chép nhanh chóng. Chạy hoàn toàn trên thiết bị với Gemma 4 E4B, GemmaCare cung cấp lý luận lâm sàng tức thì — không cần internet và dữ liệu bệnh nhân không bao giờ rời khỏi thiết bị.`,
    missionP2: `Dù nhân viên y tế đang lắng nghe triệu chứng bằng tiếng Swahili, chụp nhãn thuốc bằng tiếng Hindi, hay gõ khiếu nại bằng tiếng Ả Rập — GemmaCare hiểu và phản hồi, tạo hồ sơ lâm sàng và hướng dẫn bệnh nhân trong vài giây.`,
    multimodalDesc: `Chấp nhận bản ghi âm bệnh nhân, mô tả triệu chứng bằng lời nói và ảnh nhãn thuốc. Gemma 4 E4B phiên âm âm thanh và đọc hình ảnh theo cách gốc — không cần mô hình nhận dạng giọng nói hay OCR riêng.`,
    safetyDesc: `Tự động đối chiếu các thuốc được đề cập trong âm thanh với những thuốc thấy trong ảnh đã tải lên. Sự không khớp kích hoạt xác nhận bắt buộc.`,
    multilingualDesc: `Giao diện đầy đủ bằng 25 ngôn ngữ. Gemma 4 E4B hiểu và phản hồi bằng 35+ ngôn ngữ — hướng dẫn bệnh nhân được tự động tạo bằng ngôn ngữ bệnh nhân được phát hiện.`,
    offlineDesc: `Chạy hoàn toàn trên thiết bị qua Ollama. Sau khi tải mô hình, không cần kết nối internet. Dữ liệu bệnh nhân không bao giờ rời khỏi phần cứng của bạn.`,
    urgencyTitle: `Đánh Giá Khẩn Cấp`,
    urgencyDesc: `Mỗi lần phân loại tạo ra mức độ khẩn cấp 1–5 (Thông thường → Khẩn cấp) với điểm tin cậy. Kết quả dưới 60% tin cậy được đánh dấu cảnh báo trực quan.`,
    dualTitle: `Đầu Ra Hai Định Dạng`,
    dualDesc: `Tạo hồ sơ lâm sàng JSON có cấu trúc cho nhân viên y tế và tờ hướng dẫn ngôn ngữ đơn giản cho bệnh nhân — cả hai đều tự động điều chỉnh theo ngôn ngữ được phát hiện.`,
    step1Title: `Thu Thập Thông Tin Bệnh Nhân`,
    step1Desc: `Tải lên hoặc ghi âm bệnh nhân (WAV / MP3) và tùy chọn đính kèm ảnh nhãn thuốc hoặc vết thương.`,
    step2Title: `Trích Xuất AI`,
    step2Desc: `Gemma 4 E4B phiên âm âm thanh, phát hiện ngôn ngữ bệnh nhân, trích xuất triệu chứng, nhận dạng thuốc và giải thích nội dung hình ảnh — tất cả trong một lần xử lý đa phương thức.`,
    step3Title: `Kiểm Tra Chéo Thuốc`,
    step3Desc: `Nếu có ảnh nhãn thuốc, mô hình so sánh với các thuốc được đề cập trong âm thanh. Bất kỳ sự không khớp nào đều dừng quy trình và yêu cầu xác nhận rõ ràng từ bác sĩ.`,
    step4Title: `Tạo Hồ Sơ Lâm Sàng`,
    step4Desc: `Tạo ra hồ sơ lâm sàng có cấu trúc (khiếu nại chính, triệu chứng, mức độ khẩn cấp 1–5, hành động khuyến nghị, điểm tin cậy) và hướng dẫn bệnh nhân bằng ngôn ngữ được phát hiện.`,
    step5Title: `Lưu & Xem Lại`,
    step5Desc: `Tất cả hồ sơ được lưu trữ cục bộ và có thể truy cập qua tab Lịch sử, có thể lọc theo ngày, mức độ khẩn cấp và ngôn ngữ. Không có gì được truyền đến máy chủ.`,
    langSectionTitle: `Ngôn Ngữ UI — 25 Được Hỗ Trợ`,
    langSectionSubtitle: `Giao diện được dịch đầy đủ sang tất cả 25 ngôn ngữ bên dưới. Gemma 4 E4B ngoài ra còn hiểu và phản hồi bằng 35+ ngôn ngữ để phát hiện ngôn ngữ bệnh nhân và tạo hướng dẫn.`,
    safetyTitle: `An Toàn & Quyền Riêng Tư`,
    privacyLabel: `Quyền Riêng Tư Dữ Liệu`,
    privacyDesc: `Tất cả dữ liệu bệnh nhân được xử lý và lưu trữ độc lập trên thiết bị cục bộ. GemmaCare không truyền âm thanh, hình ảnh, bản ghi âm hoặc hồ sơ lâm sàng đến bất kỳ máy chủ nào.`,
    confidenceLabel: `Điểm Tin Cậy`,
    confidenceDesc: `Mọi kết quả phân loại đều bao gồm điểm tin cậy mô hình (0–100%). Kết quả dưới 60% tin cậy được đánh dấu trực quan.`,
    medLabel: `An Toàn Thuốc`,
    medDesc: `Hệ thống xác minh chéo so sánh thuốc được báo cáo qua âm thanh với nhãn được xác định qua ảnh. Sự không khớp yêu cầu xác nhận rõ ràng và hiển thị cảnh báo nổi bật.`,
    urgencyTransLabel: `Tính Minh Bạch Về Mức Độ Khẩn Cấp`,
    urgencyTransDesc: `Mức độ khẩn cấp 1–5 tương ứng với các loại lâm sàng (Thông thường / Ưu tiên / Khẩn cấp / Rất Khẩn cấp / Cấp cứu) với các chỉ báo màu sắc trong tất cả các chế độ xem đầu ra.`,
    disclaimer2: `Điểm tin cậy phản ánh sự chắc chắn của mô hình về đầu ra — không phải là thước đo độ chính xác lâm sàng hay tính đúng đắn chẩn đoán. GemmaCare được thiết kế để hỗ trợ, không thay thế, việc ra quyết định lâm sàng của các chuyên gia y tế có trình độ.`
  },
  "th": {
    subtitle: `ผู้ช่วยคัดกรองทางคลินิกด้วย AI สำหรับบุคลากรสาธารณสุขแนวหน้าในพื้นที่ห่างไกลและขาดแคลนทรัพยากร`,
    missionP1: `GemmaCare ถูกสร้างขึ้นเพื่อแก้ไขช่องว่างสำคัญในระบบสาธารณสุขโลก: บุคลากรสาธารณสุขที่ผ่านการฝึกอบรมในชุมชนห่างไกลมักขาดเครื่องมือดิจิทัลในการประเมินและบันทึกข้อมูลผู้ป่วยอย่างรวดเร็ว ด้วยการทำงานบนอุปกรณ์ผ่าน Gemma 4 E4B อย่างสมบูรณ์ GemmaCare มอบการวิเคราะห์ทางคลินิกทันที — ไม่ต้องใช้อินเทอร์เน็ต และข้อมูลผู้ป่วยไม่เคยออกจากอุปกรณ์`,
    missionP2: `ไม่ว่าเจ้าหน้าที่จะฟังอาการเป็นภาษาสวาฮิลี ถ่ายฉลากยาเป็นภาษาฮินดี หรือพิมพ์อาการเป็นภาษาอาหรับ — GemmaCare เข้าใจและตอบสนอง สร้างบันทึกทางคลินิกและคำแนะนำผู้ป่วยภายในไม่กี่วินาที`,
    multimodalDesc: `รับการบันทึกเสียงผู้ป่วย คำอธิบายอาการด้วยเสียง และภาพถ่ายฉลากยา Gemma 4 E4B ถอดเสียงและอ่านรูปภาพได้โดยตรง — ไม่ต้องใช้โมเดลเสียงหรือ OCR แยกต่างหาก`,
    safetyDesc: `ตรวจสอบอัตโนมัติระหว่างยาที่กล่าวถึงในเสียงกับยาที่ปรากฏในรูปภาพที่อัปโหลด ความไม่ตรงกันกระตุ้นให้ต้องยืนยันก่อนดำเนินการคัดกรองต่อ`,
    multilingualDesc: `UI ครบถ้วนใน 25 ภาษา Gemma 4 E4B เข้าใจและตอบสนองใน 35+ ภาษา — คำแนะนำผู้ป่วยถูกสร้างขึ้นโดยอัตโนมัติในภาษาของผู้ป่วยที่ตรวจพบ`,
    offlineDesc: `ทำงานบนอุปกรณ์ทั้งหมดผ่าน Ollama เมื่อดาวน์โหลดโมเดลแล้ว ไม่ต้องใช้การเชื่อมต่ออินเทอร์เน็ต ข้อมูลผู้ป่วยไม่เคยออกจากฮาร์ดแวร์ของคุณ`,
    urgencyTitle: `การให้คะแนนความเร่งด่วน`,
    urgencyDesc: `การคัดกรองทุกครั้งสร้างระดับความเร่งด่วน 1–5 (ปกติ → ฉุกเฉิน) พร้อมคะแนนความมั่นใจ ผลลัพธ์ที่มีความมั่นใจต่ำกว่า 60% จะถูกทำเครื่องหมายพร้อมคำเตือนภาพ`,
    dualTitle: `เอาต์พุตสองรูปแบบ`,
    dualDesc: `สร้างบันทึกทางคลินิก JSON ที่มีโครงสร้างสำหรับบุคลากรสาธารณสุขและแผ่นคำแนะนำภาษาธรรมดาสำหรับผู้ป่วย — ทั้งคู่ถูกปรับให้เหมาะสมกับภาษาที่ตรวจพบโดยอัตโนมัติ`,
    step1Title: `บันทึกข้อมูลผู้ป่วย`,
    step1Desc: `อัปโหลดหรือบันทึกเสียงผู้ป่วย (WAV / MP3) และแนบภาพถ่ายฉลากยาหรือบาดแผลได้ตามต้องการ`,
    step2Title: `การดึงข้อมูล AI`,
    step2Desc: `Gemma 4 E4B ถอดเสียง ตรวจจับภาษาของผู้ป่วย ดึงอาการ ระบุยาที่กล่าวถึง และแปลเนื้อหารูปภาพ — ทั้งหมดในการประมวลผลแบบมัลติโมดัลเดียว`,
    step3Title: `การตรวจสอบยาไขว้`,
    step3Desc: `หากมีภาพถ่ายฉลากยา โมเดลจะเปรียบเทียบกับยาที่กล่าวถึงในเสียง ความไม่ตรงกันใดๆ จะหยุดกระบวนการและต้องการการยืนยันจากแพทย์อย่างชัดเจน`,
    step4Title: `การสร้างบันทึกทางคลินิก`,
    step4Desc: `สร้างบันทึกทางคลินิกที่มีโครงสร้าง (อาการสำคัญ อาการ ระดับความเร่งด่วน 1–5 การดำเนินการที่แนะนำ คะแนนความมั่นใจ) และคำแนะนำผู้ป่วยในภาษาที่ตรวจพบ`,
    step5Title: `บันทึกและตรวจสอบ`,
    step5Desc: `บันทึกทั้งหมดถูกเก็บไว้ในพื้นที่และเข้าถึงได้ผ่านแท็บประวัติ กรองได้ตามวันที่ ระดับความเร่งด่วน และภาษา ไม่มีอะไรถูกส่งไปยังเซิร์ฟเวอร์`,
    langSectionTitle: `ภาษา UI — รองรับ 25 ภาษา`,
    langSectionSubtitle: `อินเทอร์เฟซได้รับการแปลครบถ้วนเป็น 25 ภาษาด้านล่าง Gemma 4 E4B ยังเข้าใจและตอบสนองใน 35+ ภาษาสำหรับการตรวจจับภาษาผู้ป่วยและการสร้างคำแนะนำ`,
    safetyTitle: `ความปลอดภัยและความเป็นส่วนตัว`,
    privacyLabel: `ความเป็นส่วนตัวของข้อมูล`,
    privacyDesc: `ข้อมูลผู้ป่วยทั้งหมดถูกประมวลผลและจัดเก็บเฉพาะบนอุปกรณ์ท้องถิ่นเท่านั้น GemmaCare ไม่ส่งเสียง รูปภาพ คำถอดเสียง หรือบันทึกทางคลินิกไปยังเซิร์ฟเวอร์ภายนอกใดๆ`,
    confidenceLabel: `การให้คะแนนความมั่นใจ`,
    confidenceDesc: `ผลการคัดกรองทุกครั้งรวมคะแนนความมั่นใจของโมเดล (0–100%) ผลลัพธ์ที่ต่ำกว่า 60% จะถูกทำเครื่องหมายเพื่อกระตุ้นให้มีการตรวจสอบทางคลินิกเพิ่มเติม`,
    medLabel: `ความปลอดภัยด้านยา`,
    medDesc: `ระบบตรวจสอบไขว้เปรียบเทียบยาที่รายงานในเสียงกับฉลากที่ระบุในภาพถ่าย ความไม่ตรงกันต้องการการยืนยันและแสดงคำเตือนที่ชัดเจนก่อนสรุปบันทึก`,
    urgencyTransLabel: `ความโปร่งใสด้านความเร่งด่วน`,
    urgencyTransDesc: `ระดับความเร่งด่วน 1–5 จำแนกตามหมวดหมู่ทางคลินิก (ปกติ / สำคัญ / ด่วน / ด่วนมาก / ฉุกเฉิน) พร้อมตัวบ่งชี้สีในทุกมุมมองเอาต์พุต`,
    disclaimer2: `คะแนนความมั่นใจสะท้อนถึงความแน่ใจของโมเดลเกี่ยวกับผลลัพธ์ — ไม่ใช่การวัดความถูกต้องทางคลินิกหรือความถูกต้องของการวินิจฉัย GemmaCare ออกแบบมาเพื่อสนับสนุน ไม่ใช่แทนที่ การตัดสินใจทางคลินิกโดยผู้เชี่ยวชาญด้านสุขภาพที่มีคุณสมบัติ`
  },
  "id": {
    subtitle: `Asisten triase klinis bertenaga AI untuk tenaga kesehatan garis depan di lingkungan terpencil dan minim sumber daya`,
    missionP1: `GemmaCare dibangun untuk mengatasi kesenjangan kritis dalam layanan kesehatan global: petugas kesehatan terlatih di komunitas terpencil sering kekurangan alat digital untuk menilai dan mendokumentasikan pasien dengan cepat. Dengan berjalan sepenuhnya di perangkat menggunakan Gemma 4 E4B, GemmaCare memberikan penalaran klinis instan — tanpa internet dan tanpa data pasien pernah meninggalkan perangkat.`,
    missionP2: `Baik petugas kesehatan sedang mendengarkan gejala dalam bahasa Swahili, memotret label obat dalam bahasa Hindi, atau mengetik keluhan dalam bahasa Arab — GemmaCare memahami dan merespons, menghasilkan catatan klinis dan instruksi pasien dalam hitungan detik.`,
    multimodalDesc: `Menerima rekaman audio pasien, deskripsi gejala lisan, dan foto label obat. Gemma 4 E4B secara native mentranskripsikan audio dan membaca gambar — tidak memerlukan model suara atau OCR terpisah.`,
    safetyDesc: `Secara otomatis memeriksa silang obat yang disebutkan dalam audio terhadap yang terlihat di foto yang diunggah. Ketidakcocokan memerlukan konfirmasi wajib.`,
    multilingualDesc: `UI lengkap dalam 25 bahasa. Gemma 4 E4B memahami dan merespons dalam 35+ bahasa — instruksi pasien secara otomatis dibuat dalam bahasa pasien yang terdeteksi.`,
    offlineDesc: `Berjalan sepenuhnya di perangkat melalui Ollama. Setelah model diunduh, tidak diperlukan koneksi internet. Data pasien tidak pernah meninggalkan perangkat keras Anda.`,
    urgencyTitle: `Penilaian Urgensi`,
    urgencyDesc: `Setiap triase menghasilkan tingkat urgensi 1–5 (Rutin → Darurat) dengan skor kepercayaan. Hasil di bawah kepercayaan 60% ditandai dengan peringatan visual.`,
    dualTitle: `Keluaran Format Ganda`,
    dualDesc: `Menghasilkan catatan klinis JSON terstruktur untuk petugas kesehatan dan lembar instruksi bahasa sederhana untuk pasien — keduanya secara otomatis disesuaikan dengan bahasa yang terdeteksi.`,
    step1Title: `Ambil Data Pasien`,
    step1Desc: `Unggah atau rekam audio pasien (WAV / MP3) dan opsional lampirkan foto label obat atau luka.`,
    step2Title: `Ekstraksi AI`,
    step2Desc: `Gemma 4 E4B mentranskripsikan audio, mendeteksi bahasa pasien, mengekstrak gejala, mengidentifikasi obat, dan menginterpretasikan konten gambar — semua dalam satu pass multimodal.`,
    step3Title: `Pemeriksaan Silang Obat`,
    step3Desc: `Jika foto label obat disediakan, model membandingkannya dengan obat yang disebutkan dalam audio. Perbedaan apapun menghentikan alur dan memerlukan konfirmasi eksplisit dari klinisi.`,
    step4Title: `Pembuatan Catatan Klinis`,
    step4Desc: `Menghasilkan catatan klinis terstruktur (keluhan utama, gejala, tingkat urgensi 1–5, tindakan yang disarankan, skor kepercayaan) dan instruksi pasien dalam bahasa yang terdeteksi.`,
    step5Title: `Simpan & Tinjau`,
    step5Desc: `Semua catatan disimpan secara lokal dan dapat diakses melalui tab Riwayat, dapat difilter berdasarkan tanggal, tingkat urgensi, dan bahasa. Tidak ada yang dikirim ke server.`,
    langSectionTitle: `Bahasa UI — 25 Didukung`,
    langSectionSubtitle: `Antarmuka sepenuhnya diterjemahkan ke dalam semua 25 bahasa di bawah ini. Gemma 4 E4B juga memahami dan merespons dalam 35+ bahasa untuk deteksi bahasa pasien dan pembuatan instruksi.`,
    safetyTitle: `Keamanan & Privasi`,
    privacyLabel: `Privasi Data`,
    privacyDesc: `Semua data pasien diproses dan disimpan secara eksklusif di perangkat lokal. GemmaCare tidak mengirimkan audio, gambar, transkrip, atau catatan klinis ke server eksternal manapun.`,
    confidenceLabel: `Penilaian Kepercayaan`,
    confidenceDesc: `Setiap hasil triase mencakup skor kepercayaan model (0–100%). Hasil di bawah 60% ditandai secara visual untuk mendorong tinjauan klinis tambahan.`,
    medLabel: `Keamanan Obat`,
    medDesc: `Sistem verifikasi silang membandingkan obat yang dilaporkan dalam audio terhadap label yang diidentifikasi dari foto. Ketidakcocokan memerlukan konfirmasi eksplisit dan peringatan menonjol.`,
    urgencyTransLabel: `Transparansi Urgensi`,
    urgencyTransDesc: `Tingkat urgensi 1–5 memetakan ke kategori klinis (Rutin / Prioritas / Mendesak / Sangat Mendesak / Darurat) dengan indikator kode warna di semua tampilan output.`,
    disclaimer2: `Skor kepercayaan mencerminkan keyakinan model terhadap keluarannya — bukan ukuran akurasi klinis atau kebenaran diagnostik. GemmaCare dirancang untuk mendukung, bukan menggantikan, pengambilan keputusan klinis oleh profesional kesehatan yang berkualifikasi.`
  },
  "ms": {
    subtitle: `Pembantu triaj klinikal berkuasa AI untuk pekerja penjagaan kesihatan barisan hadapan di kawasan terpencil dan kurang sumber`,
    missionP1: `GemmaCare dibina untuk menangani jurang kritikal dalam penjagaan kesihatan global: pekerja kesihatan terlatih di komuniti terpencil sering kekurangan alat digital untuk menilai dan mendokumentasikan pesakit dengan cepat. Dengan berjalan sepenuhnya pada peranti menggunakan Gemma 4 E4B, GemmaCare memberikan penaakulan klinikal segera — tanpa internet dan tanpa data pesakit meninggalkan peranti.`,
    missionP2: `Sama ada pekerja kesihatan mendengar gejala dalam bahasa Swahili, memotret label ubat dalam bahasa Hindi, atau menaip aduan dalam bahasa Arab — GemmaCare memahami dan memberi respons, menghasilkan rekod klinikal dan arahan pesakit dalam beberapa saat.`,
    multimodalDesc: `Menerima rakaman audio pesakit, huraian gejala secara lisan, dan foto label ubat. Gemma 4 E4B secara asli menyalin audio dan membaca imej — tidak memerlukan model pertuturan atau OCR yang berasingan.`,
    safetyDesc: `Menyemak silang ubat yang disebut dalam audio berbanding yang kelihatan dalam foto yang dimuat naik secara automatik. Ketidakpadanan mencetuskan pengesahan wajib.`,
    multilingualDesc: `UI penuh dalam 25 bahasa. Gemma 4 E4B memahami dan memberi respons dalam 35+ bahasa — arahan pesakit dijana secara automatik dalam bahasa pesakit yang dikesan.`,
    offlineDesc: `Berjalan sepenuhnya pada peranti melalui Ollama. Setelah model dimuat turun, tiada sambungan internet diperlukan. Data pesakit tidak pernah meninggalkan perkakasan anda.`,
    urgencyTitle: `Penilaian Kecemasan`,
    urgencyDesc: `Setiap triaj menghasilkan tahap urgensi 1–5 (Rutin → Kecemasan) dengan skor keyakinan. Keputusan di bawah 60% keyakinan ditandakan dengan amaran visual.`,
    dualTitle: `Output Format Dwi`,
    dualDesc: `Menjana rekod klinikal JSON berstruktur untuk pekerja penjagaan kesihatan dan helaian arahan bahasa mudah untuk pesakit — kedua-duanya disesuaikan secara automatik dengan bahasa yang dikesan.`,
    step1Title: `Tangkap Input Pesakit`,
    step1Desc: `Muat naik atau rakam audio pesakit (WAV / MP3) dan secara pilihan lampirkan foto label ubat atau luka.`,
    step2Title: `Pengekstrakan AI`,
    step2Desc: `Gemma 4 E4B menyalin audio, mengesan bahasa pesakit, mengekstrak gejala, mengenal pasti ubat, dan mentafsir kandungan imej — semuanya dalam satu laluan berbilang mod.`,
    step3Title: `Pemeriksaan Silang Ubat`,
    step3Desc: `Jika foto label ubat disediakan, model membandingkannya dengan ubat yang disebut dalam audio. Sebarang perbezaan menghentikan aliran dan memerlukan pengesahan eksplisit daripada klinisian.`,
    step4Title: `Penjanaan Rekod Klinikal`,
    step4Desc: `Menghasilkan rekod klinikal berstruktur (aduan utama, gejala, tahap urgensi 1–5, tindakan yang disyorkan, skor keyakinan) dan arahan pesakit dalam bahasa yang dikesan.`,
    step5Title: `Simpan & Semak`,
    step5Desc: `Semua rekod disimpan secara tempatan dan boleh diakses melalui tab Sejarah, boleh ditapis mengikut tarikh, tahap urgensi, dan bahasa. Tiada apa yang dihantar ke pelayan.`,
    langSectionTitle: `Bahasa UI — 25 Disokong`,
    langSectionSubtitle: `Antara muka diterjemahkan sepenuhnya ke dalam semua 25 bahasa di bawah. Gemma 4 E4B juga memahami dan memberi respons dalam 35+ bahasa untuk pengesanan bahasa pesakit dan penjanaan arahan.`,
    safetyTitle: `Keselamatan & Privasi`,
    privacyLabel: `Privasi Data`,
    privacyDesc: `Semua data pesakit diproses dan disimpan secara eksklusif pada peranti tempatan. GemmaCare tidak menghantar audio, imej, transkrip, atau rekod klinikal ke mana-mana pelayan luaran.`,
    confidenceLabel: `Penilaian Keyakinan`,
    confidenceDesc: `Setiap keputusan triaj termasuk skor keyakinan model (0–100%). Keputusan di bawah 60% ditandakan secara visual untuk menggalakkan semakan klinikal tambahan.`,
    medLabel: `Keselamatan Ubat`,
    medDesc: `Sistem pengesahan silang membandingkan ubat yang dilaporkan dalam audio berbanding label yang dikenal pasti daripada foto. Ketidakpadanan memerlukan pengesahan eksplisit dan amaran ketara.`,
    urgencyTransLabel: `Ketelusan Urgensi`,
    urgencyTransDesc: `Tahap urgensi 1–5 memetakan kepada kategori klinikal (Rutin / Keutamaan / Mendesak / Sangat Mendesak / Kecemasan) dengan penunjuk warna dalam semua paparan output.`,
    disclaimer2: `Skor keyakinan mencerminkan kepastian model tentang keluarannya — bukan ukuran ketepatan klinikal atau kebenaran diagnostik. GemmaCare direka untuk menyokong, bukan menggantikan, membuat keputusan klinikal oleh profesional penjagaan kesihatan yang berkelayakan.`
  },
  "hi": {
    subtitle: `दूरदराज और कम संसाधन वाले क्षेत्रों में अग्रिम पंक्ति के स्वास्थ्यकर्मियों के लिए AI-संचालित क्लिनिकल ट्राइएज सहायक`,
    missionP1: `GemmaCare वैश्विक स्वास्थ्य सेवा की एक गंभीर कमी को दूर करने के लिए बनाया गया है: दूरदराज के समुदायों में प्रशिक्षित स्वास्थ्यकर्मियों के पास अक्सर मरीजों की त्वरित जांच और दस्तावेजीकरण के लिए डिजिटल उपकरण नहीं होते। Gemma 4 E4B का उपयोग करके पूरी तरह डिवाइस पर चलते हुए, GemmaCare तत्काल नैदानिक तर्क प्रदान करता है — बिना इंटरनेट के और बिना रोगी डेटा डिवाइस से बाहर जाए।`,
    missionP2: `चाहे एक सामुदायिक स्वास्थ्यकर्मी स्वाहिली में लक्षण सुन रहा हो, हिंदी में दवा का लेबल फोटो खींच रहा हो, या अरबी में मुख्य शिकायत टाइप कर रहा हो — GemmaCare समझता है और जवाब देता है, कुछ ही सेकंड में संरचित क्लिनिकल रिकॉर्ड और मरीज के लिए निर्देश तैयार करता है।`,
    multimodalDesc: `मरीज की ऑडियो रिकॉर्डिंग, बोले गए लक्षणों का विवरण और दवा लेबल की फोटो स्वीकार करता है। Gemma 4 E4B मूल रूप से ऑडियो ट्रांस्क्राइब करता है और छवियां पढ़ता है — कोई अलग स्पीच या OCR मॉडल की जरूरत नहीं।`,
    safetyDesc: `ऑडियो में उल्लिखित दवाओं की अपलोड की गई तस्वीरों में दिखाई देने वाली दवाओं से स्वचालित रूप से क्रॉस-जांच करता है। गड़बड़ी होने पर अनिवार्य पुष्टि की आवश्यकता होती है।`,
    multilingualDesc: `25 भाषाओं में पूर्ण UI। Gemma 4 E4B 35+ भाषाओं को समझता है और जवाब देता है — मरीज की निर्देशिकाएं स्वचालित रूप से पता लगाई गई मरीज की भाषा में तैयार होती हैं।`,
    offlineDesc: `Ollama के माध्यम से पूरी तरह से डिवाइस पर चलता है। मॉडल डाउनलोड होने के बाद कोई इंटरनेट कनेक्शन आवश्यक नहीं है। मरीज का डेटा कभी भी आपके हार्डवेयर से बाहर नहीं जाता।`,
    urgencyTitle: `तात्कालिकता स्कोरिंग`,
    urgencyDesc: `प्रत्येक ट्राइएज एक विश्वास स्कोर के साथ 1–5 तात्कालिकता स्तर (नियमित → आपातकाल) उत्पन्न करता है। 60% से कम विश्वास वाले परिणामों को दृश्य चेतावनी से चिह्नित किया जाता है।`,
    dualTitle: `दोहरे प्रारूप आउटपुट`,
    dualDesc: `स्वास्थ्यकर्मी के लिए संरचित JSON क्लिनिकल रिकॉर्ड और मरीज के लिए सरल भाषा में निर्देश पत्रक तैयार करता है — दोनों स्वचालित रूप से पता लगाई गई भाषा में अनुकूलित।`,
    step1Title: `मरीज का डेटा दर्ज करें`,
    step1Desc: `मरीज का ऑडियो (WAV / MP3) अपलोड करें या रिकॉर्ड करें और वैकल्पिक रूप से दवा लेबल या घाव की फोटो संलग्न करें।`,
    step2Title: `AI निष्कर्षण`,
    step2Desc: `Gemma 4 E4B ऑडियो ट्रांस्क्राइब करता है, मरीज की भाषा का पता लगाता है, लक्षण निकालता है, उल्लिखित दवाओं की पहचान करता है और छवि सामग्री की व्याख्या करता है — सब एक ही मल्टीमोडल पास में।`,
    step3Title: `दवा क्रॉस-चेक`,
    step3Desc: `यदि दवा लेबल की फोटो प्रदान की जाती है, तो मॉडल इसे ऑडियो में उल्लिखित दवाओं से तुलना करता है। किसी भी विसंगति पर प्रवाह रुक जाता है और चिकित्सक की स्पष्ट पुष्टि आवश्यक होती है।`,
    step4Title: `क्लिनिकल रिकॉर्ड तैयार करना`,
    step4Desc: `संरचित क्लिनिकल रिकॉर्ड (मुख्य शिकायत, लक्षण, तात्कालिकता स्तर 1–5, अनुशंसित कार्रवाई, विश्वास स्कोर) और पता लगाई गई भाषा में मरीज के निर्देश तैयार करता है।`,
    step5Title: `सहेजें और समीक्षा करें`,
    step5Desc: `सभी रिकॉर्ड स्थानीय रूप से संग्रहीत हैं और इतिहास टैब के माध्यम से पहुंच योग्य हैं, दिनांक, तात्कालिकता स्तर और भाषा से फ़िल्टर किए जा सकते हैं। कुछ भी सर्वर पर प्रेषित नहीं होता।`,
    langSectionTitle: `UI भाषाएं — 25 समर्थित`,
    langSectionSubtitle: `इंटरफ़ेस नीचे दी गई सभी 25 भाषाओं में पूर्णतः अनुवादित है। Gemma 4 E4B अतिरिक्त रूप से मरीज की भाषा पहचान और निर्देश तैयारी के लिए 35+ भाषाओं को समझता और जवाब देता है।`,
    safetyTitle: `सुरक्षा और गोपनीयता`,
    privacyLabel: `डेटा गोपनीयता`,
    privacyDesc: `सभी मरीज का डेटा केवल स्थानीय डिवाइस पर संसाधित और संग्रहीत किया जाता है। GemmaCare किसी बाहरी सर्वर पर ऑडियो, छवियां, ट्रांस्क्रिप्ट या क्लिनिकल रिकॉर्ड प्रसारित नहीं करता।`,
    confidenceLabel: `विश्वास स्कोरिंग`,
    confidenceDesc: `प्रत्येक ट्राइएज परिणाम में मॉडल विश्वास स्कोर (0–100%) शामिल है। 60% से कम वाले परिणामों को अतिरिक्त नैदानिक समीक्षा के लिए दृश्य रूप से चिह्नित किया जाता है।`,
    medLabel: `दवा सुरक्षा`,
    medDesc: `क्रॉस-वेरिफिकेशन सिस्टम ऑडियो में रिपोर्ट की गई दवाओं की फोटो से पहचाने गए लेबल से तुलना करता है। असंगतता के मामले में स्पष्ट पुष्टि आवश्यक है।`,
    urgencyTransLabel: `तात्कालिकता पारदर्शिता`,
    urgencyTransDesc: `तात्कालिकता स्तर 1–5 सभी आउटपुट दृश्यों में रंग-कोडित संकेतकों के साथ नैदानिक श्रेणियों (नियमित / प्राथमिकता / तत्काल / बहुत तत्काल / आपातकाल) पर मैप होते हैं।`,
    disclaimer2: `विश्वास स्कोर मॉडल की अपने आउटपुट के बारे में निश्चितता को दर्शाते हैं — ये नैदानिक सटीकता या निदान की शुद्धता का माप नहीं हैं। GemmaCare योग्य स्वास्थ्य पेशेवरों द्वारा नैदानिक निर्णय लेने का समर्थन करने के लिए बनाया गया है, न कि उसकी जगह लेने के लिए।`
  },
  "bn": {
    subtitle: `প্রত্যন্ত ও কম সম্পদের অঞ্চলে অগ্রভাগের স্বাস্থ্যসেবা কর্মীদের জন্য তৈরি AI-চালিত ক্লিনিকাল ট্রাইয়েজ সহায়ক`,
    missionP1: `GemmaCare বৈশ্বিক স্বাস্থ্যসেবার একটি গুরুত্বপূর্ণ শূন্যতা পূরণের জন্য তৈরি: দূরবর্তী সম্প্রদায়ের প্রশিক্ষিত স্বাস্থ্যকর্মীরা প্রায়ই রোগীদের দ্রুত মূল্যায়ন ও নথিভুক্ত করার ডিজিটাল সরঞ্জাম থেকে বঞ্চিত। Gemma 4 E4B ব্যবহার করে সম্পূর্ণ ডিভাইসে চলে GemmaCare তাৎক্ষণিক ক্লিনিকাল যুক্তি প্রদান করে — ইন্টারনেট ছাড়া এবং রোগীর ডেটা ডিভাইস ছাড়া কখনো বের না হয়ে।`,
    missionP2: `একজন সামুদায়িক স্বাস্থ্যকর্মী সোয়াহিলিতে লক্ষণ শুনছেন, হিন্দিতে ওষুধের লেবেল ছবি তুলছেন, বা আরবিতে প্রধান অভিযোগ টাইপ করছেন — GemmaCare বুঝে এবং সাড়া দেয়, কয়েক সেকেন্ডে কাঠামোবদ্ধ ক্লিনিকাল রেকর্ড ও রোগীর নির্দেশিকা তৈরি করে।`,
    multimodalDesc: `রোগীর অডিও রেকর্ডিং, মৌখিক লক্ষণ বিবরণ এবং ওষুধের লেবেলের ছবি গ্রহণ করে। Gemma 4 E4B স্বাভাবিকভাবে অডিও ট্রান্সক্রাইব করে এবং ছবি পড়ে — কোনো আলাদা স্পিচ বা OCR মডেলের দরকার নেই।`,
    safetyDesc: `অডিওতে উল্লিখিত ওষুধগুলি আপলোড করা ছবিতে দৃশ্যমান ওষুধগুলির সাথে স্বয়ংক্রিয়ভাবে ক্রস-চেক করে। অমিল হলে বাধ্যতামূলক নিশ্চিতকরণ প্রয়োজন।`,
    multilingualDesc: `25 ভাষায় সম্পূর্ণ UI। Gemma 4 E4B 35+ ভাষায় বোঝে এবং সাড়া দেয় — রোগীর নির্দেশনা স্বয়ংক্রিয়ভাবে সনাক্ত করা রোগীর ভাষায় তৈরি হয়।`,
    offlineDesc: `Ollama এর মাধ্যমে সম্পূর্ণ ডিভাইসে চলে। মডেল ডাউনলোড হলে কোনো ইন্টারনেট সংযোগের প্রয়োজন নেই। রোগীর ডেটা কখনো আপনার হার্ডওয়্যার ছেড়ে যায় না।`,
    urgencyTitle: `জরুরিতা স্কোরিং`,
    urgencyDesc: `প্রতিটি ট্রাইয়েজ একটি বিশ্বাসযোগ্যতা স্কোর সহ 1–5 জরুরিতার স্তর (নিয়মিত → জরুরি) তৈরি করে। 60%-এর কম বিশ্বাসযোগ্যতার ফলাফলগুলি ভিজ্যুয়াল সতর্কতা দিয়ে চিহ্নিত করা হয়।`,
    dualTitle: `দ্বৈত ফরম্যাট আউটপুট`,
    dualDesc: `স্বাস্থ্যকর্মীর জন্য কাঠামোবদ্ধ JSON ক্লিনিকাল রেকর্ড এবং রোগীর জন্য সহজ ভাষার নির্দেশিকা শিট তৈরি করে — উভয়ই স্বয়ংক্রিয়ভাবে সনাক্ত করা ভাষায় তৈরি।`,
    step1Title: `রোগীর ইনপুট নিন`,
    step1Desc: `রোগীর অডিও (WAV / MP3) আপলোড করুন বা রেকর্ড করুন এবং ঐচ্ছিকভাবে একটি ওষুধের লেবেল বা ক্ষতের ছবি সংযুক্ত করুন।`,
    step2Title: `AI নিষ্কাশন`,
    step2Desc: `Gemma 4 E4B অডিও ট্রান্সক্রাইব করে, রোগীর ভাষা সনাক্ত করে, লক্ষণ বের করে, উল্লিখিত ওষুধ চিহ্নিত করে এবং চিত্রের বিষয়বস্তু ব্যাখ্যা করে — সবকিছু একটি মাল্টিমোডাল পাসে।`,
    step3Title: `ওষুধ ক্রস-চেক`,
    step3Desc: `যদি ওষুধের লেবেলের ছবি প্রদান করা হয়, মডেল এটিকে অডিওতে উল্লিখিত ওষুধগুলির সাথে তুলনা করে। যেকোনো পার্থক্য প্রবাহ থামায় এবং ক্লিনিশিয়ানের স্পষ্ট নিশ্চিতকরণ প্রয়োজন।`,
    step4Title: `ক্লিনিকাল রেকর্ড তৈরি`,
    step4Desc: `কাঠামোবদ্ধ ক্লিনিকাল রেকর্ড (প্রধান অভিযোগ, লক্ষণ, জরুরিতা স্তর 1–5, প্রস্তাবিত পদক্ষেপ, বিশ্বাসযোগ্যতা স্কোর) এবং সনাক্ত করা ভাষায় রোগীর নির্দেশনা তৈরি করে।`,
    step5Title: `সংরক্ষণ এবং পর্যালোচনা`,
    step5Desc: `সমস্ত রেকর্ড স্থানীয়ভাবে সংরক্ষিত এবং ইতিহাস ট্যাবের মাধ্যমে অ্যাক্সেসযোগ্য, তারিখ, জরুরিতার স্তর এবং ভাষা দ্বারা ফিল্টারযোগ্য। কিছুই সার্ভারে পাঠানো হয় না।`,
    langSectionTitle: `UI ভাষা — 25 সমর্থিত`,
    langSectionSubtitle: `ইন্টারফেস নিচের সমস্ত 25টি ভাষায় সম্পূর্ণরূপে অনুবাদ করা হয়েছে। Gemma 4 E4B অতিরিক্তভাবে রোগীর ভাষা সনাক্তকরণ এবং নির্দেশনা তৈরির জন্য 35+ ভাষায় বোঝে এবং সাড়া দেয়।`,
    safetyTitle: `নিরাপত্তা ও গোপনীয়তা`,
    privacyLabel: `ডেটা গোপনীয়তা`,
    privacyDesc: `সমস্ত রোগীর ডেটা শুধুমাত্র স্থানীয় ডিভাইসে প্রক্রিয়া করা এবং সংরক্ষিত হয়। GemmaCare কোনো বাহ্যিক সার্ভারে অডিও, ছবি, ট্রান্সক্রিপ্ট বা ক্লিনিকাল রেকর্ড প্রেরণ করে না।`,
    confidenceLabel: `আস্থা স্কোরিং`,
    confidenceDesc: `প্রতিটি ট্রাইয়েজ ফলাফলে মডেল আস্থা স্কোর (0–100%) অন্তর্ভুক্ত থাকে। 60%-এর কম ফলাফলগুলি অতিরিক্ত ক্লিনিকাল পর্যালোচনার জন্য দৃশ্যত চিহ্নিত করা হয়।`,
    medLabel: `ওষুধ নিরাপত্তা`,
    medDesc: `ক্রস-ভেরিফিকেশন সিস্টেম ফোটো থেকে চিহ্নিত লেবেলের বিপরীতে অডিওতে রিপোর্ট করা ওষুধ তুলনা করে। অমিল হলে স্পষ্ট নিশ্চিতকরণ প্রয়োজন।`,
    urgencyTransLabel: `জরুরিতার স্বচ্ছতা`,
    urgencyTransDesc: `জরুরিতার স্তর 1–5 সমস্ত আউটপুট দৃশ্যে রঙ-কোডেড নির্দেশকগুলির সাথে ক্লিনিকাল বিভাগে (নিয়মিত / অগ্রাধিকার / জরুরি / অত্যন্ত জরুরি / জরুরি অবস্থা) ম্যাপ করে।`,
    disclaimer2: `বিশ্বাসযোগ্যতার স্কোর তার আউটপুট সম্পর্কে মডেলের নিশ্চয়তা প্রতিফলিত করে — এটি ক্লিনিকাল নির্ভুলতা বা ডায়াগনস্টিক সঠিকতার পরিমাপ নয়। GemmaCare যোগ্য স্বাস্থ্যসেবা পেশাদারদের দ্বারা ক্লিনিকাল সিদ্ধান্ত গ্রহণকে সমর্থন করতে ডিজাইন করা হয়েছে।`
  },
  "ta": {
    subtitle: `தொலைதூர மற்றும் வளம் குறைந்த சூழல்களில் முன்னணி சுகாதார பணியாளர்களுக்காக உருவாக்கப்பட்ட AI கிளினிக்கல் ட்ரியாஜ் உதவியாளர்`,
    missionP1: `GemmaCare உலகளாவிய சுகாதாரத்தில் ஒரு முக்கியமான இடைவெளியை நிரப்ப உருவாக்கப்பட்டது: தொலைதூர சமூகங்களில் பயிற்சி பெற்ற சுகாதார பணியாளர்களுக்கு நோயாளிகளை விரைவாக மதிப்பீடு செய்யவும் ஆவணப்படுத்தவும் பெரும்பாலும் டிஜிட்டல் கருவிகள் இல்லை. Gemma 4 E4B ஐப் பயன்படுத்தி முழுமையாக சாதனத்தில் இயங்கும் GemmaCare உடனடி மருத்துவ நியாயத்தை வழங்குகிறது — இணையம் தேவையில்லாமல் மற்றும் நோயாளி தரவு சாதனத்திலிருந்து வெளியேறாமல்.`,
    missionP2: `ஒரு சமூக சுகாதார பணியாளர் சுவாஹிலி மொழியில் அறிகுறிகளை கேட்டாலும், இந்தியில் மருந்து லேபிளை புகைப்படம் எடுத்தாலும், அல்லது அரபியில் முக்கிய புகாரை தட்டச்சு செய்தாலும் — GemmaCare புரிந்துகொண்டு பதிலளிக்கிறது, சில நொடிகளில் கட்டமைக்கப்பட்ட மருத்துவ பதிவுகளையும் நோயாளி வழிமுறைகளையும் உருவாக்குகிறது.`,
    multimodalDesc: `நோயாளியின் ஆடியோ பதிவுகள், வாய்மொழி அறிகுறி விளக்கங்கள் மற்றும் மருந்து லேபிள் புகைப்படங்களை ஏற்றுக்கொள்கிறது. Gemma 4 E4B இயல்பாகவே ஆடியோவை மாற்றி படங்களை படிக்கிறது — தனி வாக்கு அல்லது OCR மாதிரி தேவையில்லை.`,
    safetyDesc: `ஆடியோவில் குறிப்பிடப்பட்ட மருந்துகளை பதிவேற்றப்பட்ட புகைப்படங்களில் தெரியும் மருந்துகளுடன் தானாகவே குறுக்கு சரிபார்க்கிறது. பொருந்தாமல் இருந்தால் கட்டாய ஒப்புதல் தேவை.`,
    multilingualDesc: `25 மொழிகளில் முழுமையான UI. Gemma 4 E4B 35+ மொழிகளை புரிந்துகொண்டு பதிலளிக்கிறது — நோயாளி வழிமுறைகள் தானாகவே கண்டறியப்பட்ட நோயாளி மொழியில் உருவாக்கப்படுகின்றன.`,
    offlineDesc: `Ollama மூலம் முழுமையாக சாதனத்தில் இயங்குகிறது. மாதிரி பதிவிறக்கியபின் இணைய இணைப்பு தேவையில்லை. நோயாளி தரவு உங்கள் வன்பொருளிலிருந்து வெளியேறாது.`,
    urgencyTitle: `அவசர மதிப்பீடு`,
    urgencyDesc: `ஒவ்வொரு ட்ரியாஜும் ஒரு நம்பிக்கை மதிப்பெண்ணுடன் 1–5 அவசர நிலை (வழக்கமான → அவசரகாலம்) உருவாக்குகிறது. 60%-க்கும் குறைவான நம்பிக்கையுள்ள முடிவுகள் காட்சி எச்சரிக்கையுடன் கொடியிடப்படுகின்றன.`,
    dualTitle: `இரட்டை வடிவ வெளியீடு`,
    dualDesc: `சுகாதார பணியாளருக்கு கட்டமைக்கப்பட்ட JSON மருத்துவ பதிவு மற்றும் நோயாளிக்கு எளிய மொழியில் வழிமுறை தாள் உருவாக்குகிறது — இரண்டும் தானாகவே கண்டறியப்பட்ட மொழிக்கு ஏற்றவாறு.`,
    step1Title: `நோயாளியின் தரவை பெறுக`,
    step1Desc: `நோயாளியின் ஆடியோவை (WAV / MP3) பதிவேற்றவும் அல்லது பதிவு செய்யவும் மற்றும் விருப்பமாக மருந்து லேபிள் அல்லது காயத்தின் புகைப்படத்தை இணைக்கவும்.`,
    step2Title: `AI பிரிப்பு`,
    step2Desc: `Gemma 4 E4B ஆடியோவை மாற்றி, நோயாளியின் மொழியை கண்டறிந்து, அறிகுறிகளை பிரித்தெடுத்து, குறிப்பிடப்பட்ட மருந்துகளை அடையாளம் காட்டி, படத்தின் உள்ளடக்கத்தை விளக்குகிறது — அனைத்தும் ஒரே பல்-முறை பரிசீலனையில்.`,
    step3Title: `மருந்து குறுக்கு சரிபார்ப்பு`,
    step3Desc: `மருந்து லேபிள் புகைப்படம் வழங்கப்பட்டால், மாதிரியானது ஆடியோவில் குறிப்பிடப்பட்ட மருந்துகளுடன் ஒப்பிட்டுப் பார்க்கிறது. எந்த முரண்பாடும் செயல்முறையை நிறுத்தி வெளிப்படையான ஒப்புதல் தேவைப்படுகிறது.`,
    step4Title: `மருத்துவ பதிவு உருவாக்கம்`,
    step4Desc: `கட்டமைக்கப்பட்ட மருத்துவ பதிவை (முக்கிய புகார், அறிகுறிகள், அவசர நிலை 1–5, பரிந்துரைக்கப்பட்ட நடவடிக்கை, நம்பகத்தன்மை மதிப்பெண்) மற்றும் கண்டறியப்பட்ட மொழியில் நோயாளி வழிமுறைகளை உருவாக்குகிறது.`,
    step5Title: `சேமி & மதிப்பாய்வு செய்`,
    step5Desc: `அனைத்து பதிவுகளும் உள்ளூரில் சேமிக்கப்படுகின்றன மற்றும் வரலாறு தாவல் மூலம் அணுகலாம், தேதி, அவசர நிலை மற்றும் மொழியால் வடிகட்டலாம். எதுவும் சேவையகத்திற்கு அனுப்பப்படவில்லை.`,
    langSectionTitle: `UI மொழிகள் — 25 ஆதரிக்கப்படுகிறது`,
    langSectionSubtitle: `கீழே உள்ள அனைத்து 25 மொழிகளிலும் இடைமுகம் முழுமையாக மொழிபெயர்க்கப்பட்டுள்ளது. Gemma 4 E4B கூடுதலாக நோயாளியின் மொழி கண்டறிதல் மற்றும் வழிமுறை உருவாக்கத்திற்காக 35+ மொழிகளை புரிந்துகொண்டு பதிலளிக்கிறது.`,
    safetyTitle: `பாதுகாப்பு & தனியுரிமை`,
    privacyLabel: `தரவு தனியுரிமை`,
    privacyDesc: `அனைத்து நோயாளி தரவும் உள்ளூர் சாதனத்தில் மட்டுமே செயலாக்கப்பட்டு சேமிக்கப்படுகிறது. GemmaCare எந்த வெளி சேவையகத்திற்கும் ஆடியோ, படங்கள், படியெடுத்தல்கள் அல்லது மருத்துவ பதிவுகளை அனுப்புவதில்லை.`,
    confidenceLabel: `நம்பகத்தன்மை மதிப்பீடு`,
    confidenceDesc: `ஒவ்வொரு ட்ரியாஜ் முடிவும் மாதிரி நம்பகத்தன்மை மதிப்பெண்ணை (0–100%) உள்ளடக்கியது. 60%-க்கும் குறைவான முடிவுகள் கூடுதல் மருத்துவ மதிப்பாய்வுக்காக காட்சி முறையில் கொடியிடப்படுகின்றன.`,
    medLabel: `மருந்து பாதுகாப்பு`,
    medDesc: `குறுக்கு சரிபார்ப்பு அமைப்பு ஆடியோவில் புகாரளிக்கப்பட்ட மருந்துகளை புகைப்படங்களில் அடையாளம் காணப்பட்ட லேபிள்களுடன் ஒப்பிடுகிறது. முரண்பாட்டிற்கு வெளிப்படையான ஒப்புதல் தேவை.`,
    urgencyTransLabel: `அவசர வெளிப்படைத்தன்மை`,
    urgencyTransDesc: `அவசர நிலைகள் 1–5 அனைத்து வெளியீட்டு காட்சிகளிலும் வர்ண-குறியீட்டு குறிகாட்டிகளுடன் மருத்துவ வகைகளுக்கு (வழக்கமான / முன்னுரிமை / அவசரம் / மிகவும் அவசரம் / அவசரகாலம்) வரைபடமாக்குகின்றன.`,
    disclaimer2: `நம்பகத்தன்மை மதிப்பெண்கள் மாதிரியின் வெளியீடுகள் பற்றிய அதன் உறுதியை பிரதிபலிக்கின்றன — இவை மருத்துவ துல்லியம் அல்லது நோய் கண்டறிதல் சரியாக இருப்பதன் அளவுகோல் அல்ல. GemmaCare தகுதிவாய்ந்த சுகாதார நிபுணர்களால் மருத்துவ முடிவெடுப்பதை ஆதரிக்க வடிவமைக்கப்பட்டது.`
  },
  "te": {
    subtitle: `మారుమూల మరియు తక్కువ వనరుల వాతావరణంలో ముందు వరుస ఆరోగ్య సేవా కార్యకర్తల కోసం రూపొందించిన AI క్లినికల్ ట్రియాజ్ సహాయకం`,
    missionP1: `GemmaCare గ్లోబల్ హెల్త్‌కేర్‌లో ఒక కీలకమైన లోపాన్ని పరిష్కరించడానికి నిర్మించబడింది: మారుమూల సమాజాల్లో శిక్షణ పొందిన ఆరోగ్య కార్యకర్తలకు తరచుగా రోగులను వేగంగా అంచనా వేయడానికి మరియు నమోదు చేయడానికి డిజిటల్ సాధనాలు ఉండవు. Gemma 4 E4B ఉపయోగించి పూర్తిగా పరికరంపై నడుస్తూ, GemmaCare తక్షణ క్లినికల్ తర్కాన్ని అందిస్తుంది — ఇంటర్నెట్ అవసరం లేకుండా మరియు రోగి డేటా పరికరం నుండి ఎప్పుడూ వెళ్ళకుండా.`,
    missionP2: `ఒక సమాజ ఆరోగ్య కార్యకర్త స్వాహిలీలో లక్షణాలు వింటున్నా, హిందీలో మందుల లేబుల్ ఫోటో తీస్తున్నా, లేదా అరబిక్‌లో ప్రధాన ఫిర్యాదు టైప్ చేస్తున్నా — GemmaCare అర్థం చేసుకుంటుంది మరియు స్పందిస్తుంది, కొన్ని సెకన్లలో నిర్మాణాత్మక క్లినికల్ రికార్డులు మరియు రోగి సూచనలు రూపొందిస్తుంది.`,
    multimodalDesc: `రోగి ఆడియో రికార్డింగ్‌లు, మాటలలో చెప్పిన లక్షణ వివరణలు మరియు మందుల లేబుల్ ఫోటోలను అంగీకరిస్తుంది. Gemma 4 E4B సహజంగా ఆడియోను లిప్యంతరీకరిస్తుంది మరియు చిత్రాలను చదువుతుంది — వేర్వేరు స్పీచ్ లేదా OCR మోడల్ అవసరం లేదు.`,
    safetyDesc: `ఆడియోలో పేర్కొన్న మందులను అప్‌లోడ్ చేసిన ఫోటోలలో కనిపించే మందులతో స్వయంచాలకంగా క్రాస్-చెక్ చేస్తుంది. అసమానత ఉంటే తప్పనిసరి నిర్ధారణ అవసరం.`,
    multilingualDesc: `25 భాషలలో పూర్తి UI. Gemma 4 E4B 35+ భాషలను అర్థం చేసుకుంటుంది మరియు స్పందిస్తుంది — రోగి సూచనలు స్వయంచాలకంగా గుర్తించిన రోగి భాషలో రూపొందించబడతాయి.`,
    offlineDesc: `Ollama ద్వారా పూర్తిగా పరికరంపై నడుస్తుంది. మోడల్ డౌన్‌లోడ్ అయిన తర్వాత ఇంటర్నెట్ కనెక్షన్ అవసరం లేదు. రోగి డేటా ఎప్పుడూ మీ హార్డ్‌వేర్ నుండి వెళ్ళదు.`,
    urgencyTitle: `అత్యవసరత స్కోరింగ్`,
    urgencyDesc: `ప్రతి ట్రియాజ్ ఒక నమ్మకం స్కోర్‌తో 1–5 అత్యవసరత స్థాయి (సాధారణ → అత్యవసరం) రూపొందిస్తుంది. 60% కంటే తక్కువ నమ్మకంతో ఉన్న ఫలితాలు విజువల్ హెచ్చరికతో గుర్తించబడతాయి.`,
    dualTitle: `ద్వంద్వ-ఫార్మాట్ అవుట్‌పుట్`,
    dualDesc: `ఆరోగ్య సేవా కార్యకర్తకు నిర్మాణాత్మక JSON క్లినికల్ రికార్డ్ మరియు రోగికి సరళమైన భాషలో సూచనల పత్రం రూపొందిస్తుంది — రెండూ స్వయంచాలకంగా గుర్తించిన భాషకు అనుగుణంగా.`,
    step1Title: `రోగి ఇన్‌పుట్ సేకరించండి`,
    step1Desc: `రోగి ఆడియో (WAV / MP3) అప్‌లోడ్ చేయండి లేదా రికార్డ్ చేయండి మరియు ఐచ్ఛికంగా ఒక మందుల లేబుల్ లేదా గాయం యొక్క ఫోటో జతచేయండి.`,
    step2Title: `AI వెలికితీత`,
    step2Desc: `Gemma 4 E4B ఆడియోను లిప్యంతరీకరిస్తుంది, రోగి భాషను గుర్తిస్తుంది, లక్షణాలు వెలికితీస్తుంది, మందులను గుర్తిస్తుంది, మరియు చిత్ర కంటెంట్‌ను వివరిస్తుంది — అన్నీ ఒకే మల్టీమోడల్ పాస్‌లో.`,
    step3Title: `మందుల క్రాస్-చెక్`,
    step3Desc: `మందుల లేబుల్ ఫోటో అందించబడితే, మోడల్ దానిని ఆడియోలో పేర్కొన్న మందులతో పోల్చుతుంది. ఏదైనా అసమానత ప్రవాహాన్ని ఆపుతుంది మరియు వైద్యుని స్పష్టమైన నిర్ధారణ అవసరమవుతుంది.`,
    step4Title: `క్లినికల్ రికార్డ్ రూపకల్పన`,
    step4Desc: `నిర్మాణాత్మక క్లినికల్ రికార్డ్ (ప్రధాన ఫిర్యాదు, లక్షణాలు, అత్యవసరత స్థాయి 1–5, సిఫారసు చేసిన చర్య, నమ్మకం స్కోర్) మరియు గుర్తించిన భాషలో రోగి సూచనలు రూపొందిస్తుంది.`,
    step5Title: `సేవ్ & సమీక్ష`,
    step5Desc: `అన్ని రికార్డులు స్థానికంగా నిల్వ చేయబడతాయి మరియు చరిత్ర ట్యాబ్ ద్వారా యాక్సెస్ చేయవచ్చు, తేదీ, అత్యవసరత స్థాయి మరియు భాష ద్వారా ఫిల్టర్ చేయవచ్చు. సర్వర్‌కు ఏమీ పంపబడదు.`,
    langSectionTitle: `UI భాషలు — 25 మద్దతు`,
    langSectionSubtitle: `ఇంటర్‌ఫేస్ క్రింద ఉన్న అన్ని 25 భాషలలో పూర్తిగా అనువదించబడింది. Gemma 4 E4B అదనంగా రోగి భాష గుర్తింపు మరియు సూచన రూపకల్పన కోసం 35+ భాషలను అర్థం చేసుకుంటుంది మరియు స్పందిస్తుంది.`,
    safetyTitle: `భద్రత & గోపనీయత`,
    privacyLabel: `డేటా గోపనీయత`,
    privacyDesc: `అన్ని రోగి డేటా స్థానిక పరికరంలో మాత్రమే ప్రాసెస్ చేయబడుతుంది మరియు నిల్వ చేయబడుతుంది. GemmaCare ఏ బాహ్య సర్వర్‌కు ఆడియో, చిత్రాలు, ట్రాన్స్‌క్రిప్ట్‌లు లేదా క్లినికల్ రికార్డులను పంపించదు.`,
    confidenceLabel: `నమ్మకం స్కోరింగ్`,
    confidenceDesc: `ప్రతి ట్రియాజ్ ఫలితం మోడల్ నమ్మకం స్కోర్‌ను (0–100%) కలిగి ఉంటుంది. 60% కంటే తక్కువ ఫలితాలు అదనపు క్లినికల్ సమీక్షకు సూచించడానికి దృశ్యమానంగా గుర్తించబడతాయి.`,
    medLabel: `మందుల భద్రత`,
    medDesc: `క్రాస్-వెరిఫికేషన్ సిస్టమ్ ఫోటో నుండి గుర్తించిన లేబుళ్ళకు వ్యతిరేకంగా ఆడియోలో నివేదించిన మందులను పోల్చుతుంది. అసమానత ఉంటే స్పష్టమైన నిర్ధారణ అవసరమవుతుంది.`,
    urgencyTransLabel: `అత్యవసరత పారదర్శకత`,
    urgencyTransDesc: `అత్యవసరత స్థాయిలు 1–5 అన్ని అవుట్‌పుట్ వ్యూలలో రంగు-కోడెడ్ సూచికలతో క్లినికల్ వర్గాలకు (సాధారణ / ప్రాధాన్యత / అత్యవసరం / చాలా అత్యవసరం / అత్యవసర స్థితి) మ్యాప్ చేస్తాయి.`,
    disclaimer2: `నమ్మకం స్కోర్‌లు దాని అవుట్‌పుట్‌ల గురించి మోడల్ యొక్క నిశ్చయతను ప్రతిబింబిస్తాయి — ఇవి క్లినికల్ ఖచ్చితత్వం లేదా రోగ నిర్ధారణ సరిగ్గా ఉండటానికి కొలత కాదు. GemmaCare అర్హత కలిగిన ఆరోగ్య సేవా నిపుణులచే క్లినికల్ నిర్ణయ తీసుకోవడాన్ని మద్దతు ఇవ్వడానికి రూపొందించబడింది.`
  },
  "ar": {
    subtitle: `مساعد فرز سريري بالذكاء الاصطناعي مصمم للعاملين الصحيين في الخطوط الأمامية بالمناطق النائية ومحدودة الموارد`,
    missionP1: `تم بناء GemmaCare لسد فجوة حرجة في الرعاية الصحية العالمية: غالبًا ما يفتقر العاملون الصحيون المدربون في المجتمعات النائية إلى الأدوات الرقمية لتقييم المرضى وتوثيقهم بسرعة. من خلال العمل بالكامل على الجهاز باستخدام Gemma 4 E4B، يوفر GemmaCare استنتاجًا سريريًا فوريًا — دون الحاجة إلى الإنترنت ودون أن تغادر بيانات المريض الجهاز.`,
    missionP2: `سواء كان العامل الصحي يستمع إلى أعراض بالسواحيلية، أو يلتقط صورة لملصق دواء بالهندية، أو يكتب الشكوى الرئيسية بالعربية — يفهم GemmaCare ويستجيب، منتجًا سجلات سريرية منظمة وتعليمات للمرضى في ثوانٍ.`,
    multimodalDesc: `يقبل التسجيلات الصوتية للمرضى وأوصاف الأعراض الشفهية وصور ملصقات الأدوية. يقوم Gemma 4 E4B بنسخ الصوت وقراءة الصور بشكل أصلي — لا حاجة لنموذج كلام أو OCR منفصل.`,
    safetyDesc: `يتحقق تلقائيًا من تطابق الأدوية المذكورة في الصوت مع تلك الظاهرة في الصور المرفوعة. تستلزم التناقضات تأكيدًا إلزاميًا قبل المتابعة.`,
    multilingualDesc: `واجهة مستخدم كاملة بـ 25 لغة. يفهم Gemma 4 E4B ويستجيب بأكثر من 35 لغة — يتم إنشاء تعليمات المريض تلقائيًا باللغة المكتشفة للمريض.`,
    offlineDesc: `يعمل بالكامل على الجهاز عبر Ollama. بعد تنزيل النموذج، لا يلزم اتصال بالإنترنت. بيانات المريض لا تغادر أجهزتك أبدًا.`,
    urgencyTitle: `تقييم الإلحاح`,
    urgencyDesc: `يُنتج كل فرز مستوى إلحاح من 1 إلى 5 (روتيني → طارئ) مع درجة ثقة. تُعلَّم النتائج التي تقل ثقتها عن 60% بتحذير مرئي.`,
    dualTitle: `مخرجات بتنسيق مزدوج`,
    dualDesc: `يُنشئ سجلًا سريريًا منظمًا بصيغة JSON للعامل الصحي وورقة تعليمات بلغة بسيطة للمريض — كلاهما يُكيَّف تلقائيًا وفق اللغة المكتشفة.`,
    step1Title: `التقاط معلومات المريض`,
    step1Desc: `قم بتحميل أو تسجيل صوت المريض (WAV / MP3) وأرفق اختياريًا صورة لملصق الدواء أو الجرح.`,
    step2Title: `استخراج الذكاء الاصطناعي`,
    step2Desc: `يقوم Gemma 4 E4B بنسخ الصوت واكتشاف لغة المريض واستخراج الأعراض وتحديد الأدوية المذكورة وتفسير محتوى الصورة — كل ذلك في مرور متعدد الوسائط واحد.`,
    step3Title: `التحقق المتقاطع من الأدوية`,
    step3Desc: `إذا تم توفير صورة لملصق الدواء، يقارنها النموذج بالأدوية المذكورة في الصوت. أي تناقض يوقف التدفق ويتطلب تأكيدًا صريحًا من الطبيب.`,
    step4Title: `إنشاء السجل السريري`,
    step4Desc: `يُنتج سجلًا سريريًا منظمًا (الشكوى الرئيسية، الأعراض، مستوى الإلحاح 1–5، الإجراء الموصى به، درجة الثقة) وتعليمات للمريض باللغة المكتشفة.`,
    step5Title: `حفظ ومراجعة`,
    step5Desc: `يتم تخزين جميع السجلات محليًا وهي متاحة عبر علامة التبويب السجل، قابلة للتصفية حسب التاريخ ومستوى الإلحاح واللغة. لا شيء يُرسَل إلى خادم.`,
    langSectionTitle: `لغات الواجهة — 25 مدعومة`,
    langSectionSubtitle: `تتم ترجمة الواجهة بالكامل إلى جميع اللغات الـ 25 أدناه. يفهم Gemma 4 E4B بالإضافة إلى ذلك ويستجيب بأكثر من 35 لغة لاكتشاف لغة المريض وتوليد التعليمات.`,
    safetyTitle: `الأمان والخصوصية`,
    privacyLabel: `خصوصية البيانات`,
    privacyDesc: `تتم معالجة جميع بيانات المرضى وتخزينها حصريًا على الجهاز المحلي. لا يرسل GemmaCare أي صوت أو صور أو نصوص أو سجلات سريرية إلى أي خادم خارجي.`,
    confidenceLabel: `تقييم الثقة`,
    confidenceDesc: `تتضمن كل نتيجة فرز درجة ثقة النموذج (0–100%). يتم وضع علامة بصرية على النتائج التي تقل عن 60% لمطالبة بمراجعة سريرية إضافية.`,
    medLabel: `سلامة الأدوية`,
    medDesc: `يقارن نظام التحقق المتقاطع الأدوية المُبلَّغ عنها صوتيًا مع الملصقات المحددة من الصور. تستلزم التناقضات تأكيدًا صريحًا وتعرض تحذيرًا بارزًا قبل إتمام السجل.`,
    urgencyTransLabel: `شفافية الإلحاح`,
    urgencyTransDesc: `تتوافق مستويات الإلحاح 1–5 مع الفئات السريرية (روتيني / أولوية / عاجل / عاجل جدًا / طارئ) مع مؤشرات مرمزة بالألوان في جميع مشاهدات المخرجات.`,
    disclaimer2: `تعكس درجات الثقة يقين النموذج في مخرجاته — وهي ليست مقياسًا للدقة السريرية أو صحة التشخيص. تم تصميم GemmaCare لدعم، وليس استبدال، صنع القرار السريري من قِبل متخصصي الرعاية الصحية المؤهلين. طبّق دائمًا الحكم السريري قبل التصرف بناءً على أي توصية مولّدة من الذكاء الاصطناعي.`
  },
  "sw": {
    subtitle: `Msaidizi wa uchunguzi wa kliniki unaotumia AI ulioundwa kwa wafanyakazi wa afya wa mstari wa mbele katika mazingira ya mbali na yenye rasilimali chache`,
    missionP1: `GemmaCare ilijengwa kushughulikia pengo muhimu katika afya ya kimataifa: wafanyakazi wa afya waliofunzwa katika jamii za mbali mara nyingi hawana zana za kidijitali za kutathmini na kuandika hali za wagonjwa haraka. Kwa kufanya kazi kabisa kwenye kifaa kwa kutumia Gemma 4 E4B, GemmaCare hutoa hoja ya kimatibabu ya papo hapo — bila intaneti na bila data ya mgonjwa kuacha kifaa.`,
    missionP2: `Iwe mfanyakazi wa afya anasikiliza dalili kwa Kiswahili, anapiga picha ya lebo ya dawa kwa Hindi, au anaandika malalamiko kwa Kiarabu — GemmaCare inaelewa na kujibu, ikitoa rekodi za kimatibabu na maelekezo kwa mgonjwa kwa sekunde chache.`,
    multimodalDesc: `Inakubali rekodi za sauti za wagonjwa, maelezo ya dalili kwa mdomo, na picha za lebo za dawa. Gemma 4 E4B inabadilisha sauti na kusoma picha kwa asili — hakuna mfano tofauti wa sauti au OCR unaohitajika.`,
    safetyDesc: `Inakagua kiotomatiki dawa zilizotajwa katika sauti dhidi ya zinazoonekana katika picha zilizopakiwa. Kutofautiana kunasababisha uthibitisho wa lazima.`,
    multilingualDesc: `UI kamili katika lugha 25. Gemma 4 E4B inaelewa na kujibu katika lugha 35+ — maelekezo ya mgonjwa yanazalishwa kiotomatiki katika lugha ya mgonjwa iliyogunduliwa.`,
    offlineDesc: `Inafanya kazi kabisa kwenye kifaa kupitia Ollama. Baada ya mfano kupakuliwa, hakuna muunganisho wa intaneti unaohitajika. Data ya mgonjwa haiacha vifaa vyako kamwe.`,
    urgencyTitle: `Tathmini ya Uharaka`,
    urgencyDesc: `Kila uchunguzi unazalisha kiwango cha uharaka 1–5 (Kawaida → Dharura) na alama ya kuamini. Matokeo chini ya 60% ya kuamini yanawekwa alama ya tahadhari ya kuona.`,
    dualTitle: `Matokeo ya Muundo Mbili`,
    dualDesc: `Inazalisha rekodi ya kimatibabu ya JSON iliyopangwa kwa mfanyakazi wa afya na karatasi ya maelekezo ya lugha rahisi kwa mgonjwa — zote mbili zinabadilishwa kiotomatiki kwa lugha iliyogunduliwa.`,
    step1Title: `Pata Maelezo ya Mgonjwa`,
    step1Desc: `Pakia au rekodi sauti ya mgonjwa (WAV / MP3) na kwa hiari unganisha picha ya lebo ya dawa au jeraha.`,
    step2Title: `Uchimbaji wa AI`,
    step2Desc: `Gemma 4 E4B inabadilisha sauti, inagundua lugha ya mgonjwa, inachimba dalili, inabainisha dawa zilizotajwa, na kutafsiri maudhui ya picha — yote katika mwelekeo mmoja wa multimodal.`,
    step3Title: `Ukaguzi wa Msalaba wa Dawa`,
    step3Desc: `Ikiwa picha ya lebo ya dawa imetolewa, mfano unalinganisha na dawa zilizotajwa katika sauti. Tofauti yoyote inasimamisha mchakato na inahitaji uthibitisho wazi wa daktari.`,
    step4Title: `Kuunda Rekodi ya Kimatibabu`,
    step4Desc: `Inazalisha rekodi ya kimatibabu iliyopangwa (malalamiko makuu, dalili, kiwango cha uharaka 1–5, hatua inayopendekezwa, alama ya kuamini) na maelekezo kwa mgonjwa katika lugha iliyogunduliwa.`,
    step5Title: `Hifadhi na Kagua`,
    step5Desc: `Rekodi zote zimehifadhiwa ndani na zinaweza kufikiwa kupitia kichupo cha Historia, zinaweza kuchujwa kwa tarehe, kiwango cha uharaka, na lugha. Hakuna kinachotumwa kwa seva.`,
    langSectionTitle: `Lugha za UI — 25 Zinazosaidiwa`,
    langSectionSubtitle: `Kiolesura kimefasiriwa kikamilifu katika lugha zote 25 hapa chini. Gemma 4 E4B pia inaelewa na kujibu katika lugha 35+ kwa ugunduzi wa lugha ya mgonjwa na uzalishaji wa maelekezo.`,
    safetyTitle: `Usalama na Faragha`,
    privacyLabel: `Faragha ya Data`,
    privacyDesc: `Data zote za wagonjwa zinashughulikiwa na kuhifadhiwa peke yake kwenye kifaa cha ndani. GemmaCare haipeleki sauti, picha, maandishi, au rekodi za kimatibabu kwa seva yoyote ya nje.`,
    confidenceLabel: `Tathmini ya Kuamini`,
    confidenceDesc: `Kila matokeo ya uchunguzi yanajumuisha alama ya kuamini ya mfano (0–100%). Matokeo chini ya 60% yanawekwa alama ya kuona ili kuhimiza ukaguzi zaidi wa kimatibabu.`,
    medLabel: `Usalama wa Dawa`,
    medDesc: `Mfumo wa uthibitisho wa msalaba unalinganisha dawa zilizoripotiwa katika sauti dhidi ya lebo zilizotambuliwa kutoka picha. Kutofautiana kunahitaji uthibitisho wazi na kuonyesha onyo mahususi.`,
    urgencyTransLabel: `Uwazi wa Uharaka`,
    urgencyTransDesc: `Viwango vya uharaka 1–5 hupanga kwenye makundi ya kimatibabu (Kawaida / Kipaumbele / Haraka / Haraka Sana / Dharura) na viashiria vya rangi katika maoni yote ya matokeo.`,
    disclaimer2: `Alama za kuamini zinaonyesha uhakika wa mfano kuhusu matokeo yake — si kipimo cha usahihi wa kimatibabu au usahihi wa utambuzi. GemmaCare imeundwa kusaidia, si kuchukua nafasi ya, kufanya maamuzi ya kimatibabu na wataalamu wa afya wenye sifa.`
  },
  "yo": {
    subtitle: `Olùrànlọ́wọ́ triage klíníkì tí AI ń ṣe agbára fún awọn oṣiṣẹ ilera ìkọ́kọ̀ ní àwọn àgbègbè jíjìnnà àti àìní àwọn ohun àmúṣọrọ̀`,
    missionP1: `A kọ GemmaCare lati yọ àlàfo to ṣe pàtàkì nínú ìtọ́jú ìlera àgbáyé: àwọn òṣìṣẹ ìlera tí wọn ti kẹ́kọọ̀ nínú àwọn àgbègbè tó jìnnà máa ń kọbi ara àwọn irinṣẹ aláwọ̀ fún ìgbéléwọ̀n àti ìkọsílẹ̀ yára. Nípa ṣísẹ̀ lórí ẹrọ pátápátá nípasẹ̀ Gemma 4 E4B, GemmaCare pèsè ìrò ìṣègùn lẹ́sẹ̀kẹsẹ̀ — láìsí íntánẹ́ẹ̀tì àti data aláìsàn tí kò fi ẹrọ sílẹ̀.`,
    missionP2: `Bíi òṣìṣẹ ìlera tí ń gbọ́ àwọn àmì àrùn ní Swahili, tí ń ya àwòrán àpótí oogun ní Hindi, tàbí tí ń tẹ ẹ̀dùn àkọ́kọ́ ní Lárúbáwá — GemmaCare gbọ́ àti dáhùn, tí ó ń ṣe àgbékalẹ̀ àwọn àkọsílẹ̀ klíníkì àti àwọn ìtọ́nisọ́nà alaisan ní ìṣẹ́jú àáárọ̀.`,
    multimodalDesc: `Gbà àwọn gbigbasilẹ ohun ti alaisan, àpèjúwe àwọn àmì àrùn tí a sọ, àti àwọn àwòrán lábẹ́lì oogun. Gemma 4 E4B ṣe gbigbasilẹ ohun àti kíkà àwọn àwòrán ní ti ara — kò sí awoṣe ọ̀rọ̀ tàbí OCR tó yàtọ̀ tí a nílò.`,
    safetyDesc: `Ṣàyẹwò oogun tí a mẹ́nú kan nínú ohun lòdì sí àwọn tí ó hàn nínú àwọn àwòrán tí a gbe soke. Àìbáradé ń fa ìfọwọ́sowọ́pọ̀ ti o ṣe pàtàkì ṣáájú kí triage lè tẹsiwaju.`,
    multilingualDesc: `UI pípé ní èdè 25. Gemma 4 E4B gbọ́ àti dáhùn ní èdè 35+ — àwọn ìtọ́nisọ́nà alaisan ni a ṣẹ̀dá aifọwọyì ní èdè alaisan tí a ṣàwárí.`,
    offlineDesc: `Ṣísẹ̀ pátápátá lórí ẹrọ nípasẹ̀ Ollama. Lẹ́yìn tí a bá gba awoṣe náà, kò sí àsopọ̀ íntánẹ́ẹ̀tì tí a nílò. Data alaisan kò fi ẹrọ rẹ sílẹ̀ rí.`,
    urgencyTitle: `Ìgbéléwọ̀n Ìpele Pàtàkì`,
    urgencyDesc: `Triage kọ̀ọ̀kan ń ṣe àgbékalẹ̀ ìpele pàtàkì 1–5 (Deede → Ìpàdánù Ìgbésí Ayé) pẹ̀lú àmì ìgbẹ́kẹ̀lé. Àwọn àbájáde tí ó wà ní isalẹ̀ 60% ni a fi àmì ìkìlọ̀ ojú àmì han.`,
    dualTitle: `Ìpèsè Ìdálẹ̀jẹ̀ Ìlọ́po Méjì`,
    dualDesc: `Ṣẹ̀dá àkọsílẹ̀ klíníkì JSON tí a ṣe àgbékalẹ̀ fún òṣìṣẹ ìlera àti àwọn ìtọ́nisọ́nà èdè kéréje fún alaisan — àwọn méjèjì ni a ṣe àmójútó sí èdè tí a ṣàwárí.`,
    step1Title: `Gba Alaye Alaisan`,
    step1Desc: `Gbe soke tàbí ṣe àgbádìí ohun alaisan (WAV / MP3) àti sopọ mọ àwòrán lábẹ́lì oogun tàbí ọgbẹ́ ní ìfẹ́.`,
    step2Title: `Ìmúsíta AI`,
    step2Desc: `Gemma 4 E4B ṣe gbigbasilẹ ohun, ṣàwárí èdè alaisan, mú àwọn àmì àrùn jáde, ṣe ìdámọ̀ àwọn oogun tí a mẹ́nú kan, àti ṣe ìtumọ̀ àwọn àwòrán — gbogbo rẹ̀ ní ìgbésẹ̀ multimodal kan.`,
    step3Title: `Àyẹ̀wò Oogun Ìsopọ̀`,
    step3Desc: `Tí àwòrán lábẹ́lì oogun bá wà, awoṣe náà ń ṣe àfiwé rẹ̀ pẹ̀lú àwọn oogun tí a mẹ́nú kan nínú ohun. Àìbáradé kankan yóò dáwọ́ ìṣísẹ̀ dúró àti béèrè ìfọwọ́sowọ́pọ̀ gbangba dọ́kítà.`,
    step4Title: `Ṣíṣe Àkọsílẹ̀ Klíníkì`,
    step4Desc: `Ṣẹ̀dá àkọsílẹ̀ klíníkì tí a ṣe àgbékalẹ̀ (ẹ̀dùn àkọ́kọ́, àwọn àmì àrùn, ìpele pàtàkì 1–5, ìgbésẹ̀ tí a gba niyanju, àmì ìgbẹ́kẹ̀lé) àti àwọn ìtọ́nisọ́nà alaisan ní èdè tí a ṣàwárí.`,
    step5Title: `Tọ́jú àti Àtúnyẹ̀wò`,
    step5Desc: `Gbogbo àwọn àkọsílẹ̀ ni a tọ́jú ní àdúgbò àti pé a lè wọlé sí wọn nípasẹ̀ àkọlé Ìtàn, a lè àlẹ̀mọ́ wọn nipasẹ ọjọ, ìpele pàtàkì, àti èdè. Kò sí ohun tí a rán lọ sí olupin.`,
    langSectionTitle: `Àwọn Èdè UI — 25 Tí A Ṣe Àtìlẹ́yìn`,
    langSectionSubtitle: `Ìdálẹ̀jẹ̀ ti tumọ sí gbogbo àwọn èdè 25 tí ó wà ní isalẹ̀ yìí. Gemma 4 E4B tún gbọ́ àti dáhùn ní èdè 35+ fún ìdámọ̀ èdè alaisan àti ìṣẹ̀dá ìtọ́nisọ́nà.`,
    safetyTitle: `Àbójútó àti Àṣírí`,
    privacyLabel: `Àṣírí Dátà`,
    privacyDesc: `Gbogbo data alaisan ni a ṣe àmójútó àti tọ́jú lórí ẹrọ àdúgbò nìkan. GemmaCare kò rán ohun, àwòrán, àwọn ìtẹ̀jáde, tàbí àwọn àkọsílẹ̀ klíníkì sí olupin ìta kankan.`,
    confidenceLabel: `Ìgbéléwọ̀n Ìgbẹ́kẹ̀lé`,
    confidenceDesc: `Gbogbo àbájáde triage pẹ̀lú àmì ìgbẹ́kẹ̀lé awoṣe (0–100%). Àwọn àbájáde tí ó wà ní isalẹ̀ 60% ni a ṣe àmì ojú àmì láti gba àyẹ̀wò klíníkì àfikún.`,
    medLabel: `Àbójútó Oogun`,
    medDesc: `Ètò ìṣayẹ̀wò ìsopọ̀ ṣe àfiwé àwọn oogun tí a ròyìn nínú ohun lòdì sí àwọn lábẹ́lì tí a mọ̀ nínú àwọn àwòrán. Àìbáradé nílò ìfọwọ́sowọ́pọ̀ gbangba àti fi àmì ìkìlọ̀ tí ó hàn.`,
    urgencyTransLabel: `Ìṣísí Ìpele Pàtàkì`,
    urgencyTransDesc: `Àwọn ìpele pàtàkì 1–5 ṣe àfiwé àwọn ẹgbẹ klíníkì (Déédé / Ọ̀tẹlẹ̀múyẹ̀ / Pàtàkì / Pàtàkì Jùlọ / Ìpàdánù Ìgbésí Ayé) pẹ̀lú àwọn àmì àwọ̀ nínú gbogbo àwọn ojúwò ìdáhùn.`,
    disclaimer2: `Àwọn àmì ìgbẹ́kẹ̀lé ṣàfihàn ìdánilójú awoṣe nípa àwọn ìdáhùn rẹ̀ — kì í ṣe ìwọ̀n deédéé klíníkì tàbí ìdúfìn ìfọ̀yà. A ṣe apẹrẹ GemmaCare láti ṣe àtìlẹ́yìn, kì í ṣe láti rọ́pò, ìmúsíta ìpinnu klíníkì nípasẹ̀ àwọn ògbógi ìtọ́jú ìlera tí ó ní àbájáde.`
  }
};

function getLang(code: string) { return L[code] ?? L["en"]; }

const UI_LANGUAGES = [
  { code: "en", name: "English" }, { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" }, { code: "es", name: "Español" },
  { code: "it", name: "Italiano" }, { code: "nl", name: "Nederlands" },
  { code: "pt", name: "Português" }, { code: "pt_br", name: "Português (Brasil)" },
  { code: "ru", name: "Русский" }, { code: "tr", name: "Türkçe" },
  { code: "zh", name: "普通话" }, { code: "zh_tw", name: "廣東話" },
  { code: "ja", name: "日本語" }, { code: "ko", name: "한국어" },
  { code: "vi", name: "Tiếng Việt" }, { code: "th", name: "ภาษาไทย" },
  { code: "id", name: "Bahasa Indonesia" }, { code: "ms", name: "Bahasa Melayu" },
  { code: "hi", name: "हिन्दी" }, { code: "bn", name: "বাংলা" },
  { code: "ta", name: "தமிழ்" }, { code: "te", name: "తెలుగు" },
  { code: "ar", name: "العربية" }, { code: "sw", name: "Kiswahili" },
  { code: "yo", name: "Yorùbá" },
];

export default function About() {
  const { t, uiLang } = useLanguage();
  const l = getLang(uiLang);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">About GemmaCare</h1>
        <p className="text-muted-foreground mt-1">{l.subtitle}</p>
      </div>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t.ourMission}</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{l.missionP1}</p>
        <p className="text-muted-foreground text-sm leading-relaxed mt-3">{l.missionP2}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Mic,      title: t.multimodalAnalysis,  desc: l.multimodalDesc },
          { icon: Shield,   title: t.safetyVerification,  desc: l.safetyDesc },
          { icon: Globe,    title: t.multilingualSupport, desc: l.multilingualDesc },
          { icon: Wifi,     title: t.offlineCapable,      desc: l.offlineDesc },
          { icon: Clock,    title: l.urgencyTitle,         desc: l.urgencyDesc },
          { icon: FileText, title: l.dualTitle,            desc: l.dualDesc },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="p-6 border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">{t.howItWorks}</h2>
        <div className="space-y-4">
          {[
            { n: "1", title: l.step1Title, desc: l.step1Desc },
            { n: "2", title: l.step2Title, desc: l.step2Desc },
            { n: "3", title: l.step3Title, desc: l.step3Desc },
            { n: "4", title: l.step4Title, desc: l.step4Desc },
            { n: "5", title: l.step5Title, desc: l.step5Desc },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{n}</span>
              <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{l.langSectionTitle}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{l.langSectionSubtitle}</p>
        <div className="flex flex-wrap gap-2">
          {UI_LANGUAGES.map(({ code, name }) => (
            <Badge key={code} variant="secondary" className="text-xs font-normal">{name}</Badge>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t.technicalDetails}</h2>
        </div>
        <div className="space-y-2 text-sm">
          {([
            ["AI Model", "Gemma 4 E4B — multimodal (vision + audio + text)"],
            ["Runtime", "Ollama — local inference, no cloud dependency"],
            ["Model Languages", "35+ languages understood by Gemma 4 E4B"],
            ["UI Languages", "25 fully translated interface languages"],
            ["Triage Scale", "1–5: Routine → Priority → Urgent → Very Urgent → Emergency"],
            ["Output", "Structured JSON clinical record + patient instruction sheet"],
            ["Processing", "100% on-device — no data leaves the hardware"],
            ["Storage", "Local SQLite database — no cloud sync, no data sharing"],
            ["Frontend", "React 19 + TypeScript + Tailwind CSS 4"],
            ["Backend", "Node.js + Express + tRPC"],
            ["Audio", "Native transcription via Gemma 4 E4B (WAV, MP3)"],
            ["Images", "Native vision processing — medication labels, wound photos"],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="font-semibold text-foreground min-w-36 shrink-0">{label}:</span>
              <span className="text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{l.safetyTitle}</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          {([
            [l.privacyLabel,      l.privacyDesc],
            [l.confidenceLabel,   l.confidenceDesc],
            [l.medLabel,          l.medDesc],
            [l.urgencyTransLabel, l.urgencyTransDesc],
          ] as [string, string][]).map(([label, desc]) => (
            <p key={label}>
              <span className="font-semibold text-foreground">{label}: </span>{desc}
            </p>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-emerald-400">Technology Stack &amp; Credits</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          GemmaCare runs entirely on-device — no cloud APIs, no data transmission. Every component listed below
          operates locally on your hardware.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: "🤖",
              name: "Google Gemma 4 E4B",
              role: "Multimodal LLM",
              desc: "Audio transcription · Image vision · Clinical reasoning · 35+ language translation. All inference runs locally.",
              href: "https://ai.google.dev/gemma",
            },
            {
              icon: "🦙",
              name: "Ollama",
              role: "Local model serving",
              desc: "Runs Gemma 4 on-device via a local REST API. No internet required after model download.",
              href: "https://ollama.com",
            },
            {
              icon: "🗄️",
              name: "SQLite",
              role: "Local database",
              desc: "Patient triage records stored in a local SQLite file (gemmacare.db). Nothing leaves the device.",
              href: "https://sqlite.org",
            },
            {
              icon: "🎞️",
              name: "FFmpeg",
              role: "Audio transcoding",
              desc: "Converts browser audio (WebM/Opus/MP4) to 16 kHz mono WAV for Gemma 4 native audio processing.",
              href: "https://ffmpeg.org",
            },
            {
              icon: "⚡",
              name: "tRPC",
              role: "Type-safe API",
              desc: "End-to-end type safety between the React client and Express server — zero REST boilerplate.",
              href: "https://trpc.io",
            },
            {
              icon: "⚛️",
              name: "React 19 + TypeScript",
              role: "Frontend",
              desc: "Component-based UI with full TypeScript coverage across client and server.",
              href: "https://react.dev",
            },
            {
              icon: "🎨",
              name: "Tailwind CSS 4",
              role: "Styling",
              desc: "Dark-theme UI with navy/teal/green/purple design system. Responsive across desktop and mobile.",
              href: "https://tailwindcss.com",
            },
            {
              icon: "🐉",
              name: "Drizzle ORM",
              role: "Database layer",
              desc: "Type-safe SQL queries and schema migrations for the SQLite triage record store.",
              href: "https://orm.drizzle.team",
            },
          ].map(item => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-3 rounded-lg bg-background/60 border border-border/40 hover:border-emerald-500/40 transition-colors group"
            >
              <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                    {item.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Developed by:</span> Chris Golden
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Version:</span> 3.2 (v32-aph)
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="text-xs text-muted-foreground">
            GemmaCare is open for frontline healthcare use. All rights reserved.
          </span>
        </div>
      </Card>

      <Card className="p-6 border-yellow-500/30 bg-yellow-500/5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-yellow-400">{t.importantDisclaimer}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{t.disclaimerText}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">{l.disclaimer2}</p>
      </Card>
    </div>
  );
}
