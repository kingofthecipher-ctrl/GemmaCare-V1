import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/languages";

const STORAGE_KEY = "gemmacare_ui_language";
const THEME_KEY = "gemmacare_theme";
type Theme = "light" | "dark";

export interface UIStrings {
  triage: string; medications: string; history: string; demoCases: string; about: string;
  clinical: string; info: string; aiEngine: string; appLanguage: string;
  signIn: string; signOut: string; newTriage: string; startTriageAnalysis: string;
  patientAudio: string; photo: string; optional: string; clinicalRecord: string;
  patientInstructions: string; chiefComplaint: string; symptoms: string; urgency: string;
  medication: string; recommendedAction: string; confidence: string; detectedLanguage: string;
  analyzing: string; copyJSON: string; export: string; recordAudio: string; stopRecording: string;
  allProcessingLocal: string; medicationWarning: string; medicationMismatch: string;
  patient: string; clinician: string; typeSymptoms: string; clearAudio: string; clearImage: string;
  ollamaReady: string; ollamaNotFound: string; ollamaOffline: string;
  howItWorks: string; keyFeatures: string; startATriage: string;
  input: string; extract: string; verify: string; record: string;
  multilingualAI: string; localProcessing: string; safetyCheck: string; clinicalRecords: string;
  patientDetails: string; patientName: string; location: string; clinicalNotes: string; uploadAudio: string; uploadPhoto: string;
  welcomeTo: string; multimodalAnalysis: string; safetyVerification: string; multilingualSupport: string; fastProcessing: string;
  ourMission: string; missionText: string; importantDisclaimer: string; disclaimerText: string; technicalDetails: string;
  viewDemos: string; offlineCapable: string; offlineText: string;
  audioSubtitle: string; locationPlaceholder: string;
  takePhoto: string; cameraSubtitle: string; selectFromGallery: string;
  capturePhoto: string; retakePhoto: string; useThisPhoto: string;
  cameraAccessDenied: string; pointAtLabel: string;
}

// Returns hardcoded UI strings for the given language code.
// No module-level const — avoids minifier TDZ issues entirely.
function getStrings(lang: string): UIStrings {
  switch (lang) {
    case "fr": return {
      triage:"Triage",medications:"Médicaments",history:"Historique",demoCases:"Cas démo",about:"À propos",
      clinical:"Clinique",info:"Info",aiEngine:"Moteur IA",appLanguage:"Langue de l'app",
      signIn:"Connexion",signOut:"Déconnexion",newTriage:"Nouveau triage",startTriageAnalysis:"Démarrer l'analyse",
      patientAudio:"Audio patient",photo:"Photo",optional:"Optionnel",clinicalRecord:"Dossier clinique",
      patientInstructions:"Instructions patient",chiefComplaint:"Motif principal",symptoms:"Symptômes",
      urgency:"Urgence",medication:"Médicament",recommendedAction:"Action recommandée",
      confidence:"Confiance",detectedLanguage:"Langue détectée",analyzing:"Gemma 4 E4B analyse…",
      allProcessingLocal:"Traitement local via Ollama. Aucune donnée ne quitte votre appareil.",
      medicationWarning:"Avertissement médicament",medicationMismatch:"Désaccord médicament",
      patient:"patient",clinician:"clinicien",typeSymptoms:"Saisir les symptômes",
      clearAudio:"Effacer audio",clearImage:"Effacer image",
      ollamaReady:"Gemma 4 E4B prêt",ollamaNotFound:"Modèle non trouvé — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama inaccessible — démarrez Ollama puis: ollama pull gemma4:e4b",

      welcomeTo:"Bienvenue sur GemmaCare",
      multimodalAnalysis:"Analyse Multimodale",
      safetyVerification:"Vérification de Sécurité",
      multilingualSupport:"Support Multilingue",
      fastProcessing:"Traitement Rapide",
      ourMission:"Notre Mission",
      missionText:"GemmaCare aide les agents de santé dans les zones reculées avec un triage clinique multimodal rapide.",
      importantDisclaimer:"Avertissement Important",
      disclaimerText:"GemmaCare est un outil d'aide à la décision clinique. Il ne remplace pas le jugement médical professionnel.",
      technicalDetails:"Détails Techniques",
      viewDemos:"Voir les Démos",
      offlineCapable:"Hors Ligne",
      offlineText:"Fonctionne sans connexion internet. Toutes les données restent sur l'appareil.",
      howItWorks:"Comment Ça Marche",keyFeatures:"Fonctionnalités",startATriage:"Démarrer un Triage",
      input:"Entrée",extract:"Extraire",verify:"Vérifier",record:"Enregistrer",
      multilingualAI:"35+ Langues",localProcessing:"Traitement Local",safetyCheck:"Vérification Sécurité",clinicalRecords:"Dossiers Cliniques",
      patientDetails:"Détails patient",patientName:"Nom / ID patient",location:"Lieu / Clinique",clinicalNotes:"Notes cliniques",uploadAudio:"Télécharger audio",uploadPhoto:"Télécharger photo",audioSubtitle:"Gemma 4 — transcription audio native",locationPlaceholder:"ex. : Clinique du village A",
      copyJSON:"Copier JSON",export:"Exporter",recordAudio:"Enregistrer audio",stopRecording:"Arrêter",
      takePhoto:"Prendre une photo",cameraSubtitle:"Ouvre la caméra — demande permission",selectFromGallery:"Choisir dans la galerie",capturePhoto:"Capturer la photo",retakePhoto:"Reprendre",useThisPhoto:"Utiliser cette photo",cameraAccessDenied:"Accès caméra refusé. Veuillez télécharger une photo.",pointAtLabel:"Pointez vers l'étiquette du médicament ou la plaie",
    };
    case "de": return {
      triage:"Triage",medications:"Medikamente",history:"Verlauf",demoCases:"Demos",about:"Über",
      clinical:"Klinisch",info:"Info",aiEngine:"KI-Engine",appLanguage:"App-Sprache",
      signIn:"Anmelden",signOut:"Abmelden",newTriage:"Neue Triage",startTriageAnalysis:"Analyse starten",
      patientAudio:"Patienten-Audio",photo:"Foto",optional:"Optional",clinicalRecord:"Klinische Akte",
      patientInstructions:"Patientenanweisungen",chiefComplaint:"Hauptbeschwerde",symptoms:"Symptome",
      urgency:"Dringlichkeit",medication:"Medikament",recommendedAction:"Empfohlene Maßnahme",
      confidence:"Konfidenz",detectedLanguage:"Erkannte Sprache",analyzing:"Gemma 4 E4B analysiert…",
      allProcessingLocal:"Lokale Verarbeitung via Ollama. Keine Daten verlassen Ihr Gerät.",
      medicationWarning:"Medikamentenwarnung",medicationMismatch:"Medikamentenfehler",
      patient:"Patient",clinician:"Kliniker",typeSymptoms:"Symptome eingeben",
      clearAudio:"Audio löschen",clearImage:"Bild löschen",
      ollamaReady:"Gemma 4 E4B bereit",ollamaNotFound:"Modell nicht gefunden — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama nicht erreichbar — starten Sie Ollama dann: ollama pull gemma4:e4b",

      welcomeTo:"Willkommen bei GemmaCare",
      multimodalAnalysis:"Multimodale Analyse",
      safetyVerification:"Sicherheitsprüfung",
      multilingualSupport:"Mehrsprachige Unterstützung",
      fastProcessing:"Schnelle Verarbeitung",
      ourMission:"Unsere Mission",
      missionText:"GemmaCare unterstützt Gesundheitsarbeiter in abgelegenen Gebieten mit schneller klinischer Triage.",
      importantDisclaimer:"Wichtiger Haftungsausschluss",
      disclaimerText:"GemmaCare ist ein klinisches Entscheidungshilfetool. Es ist kein Ersatz für professionelles medizinisches Urteil.",
      technicalDetails:"Technische Details",
      viewDemos:"Demos ansehen",
      offlineCapable:"Offline-fähig",
      offlineText:"Funktioniert ohne Internetverbindung. Alle Daten bleiben auf dem Gerät.",
      howItWorks:"Wie Es Funktioniert",keyFeatures:"Funktionen",startATriage:"Triage Starten",
      input:"Eingabe",extract:"Extrahieren",verify:"Überprüfen",record:"Aufzeichnen",
      multilingualAI:"35+ Sprachen",localProcessing:"Lokale Verarbeitung",safetyCheck:"Sicherheitsprüfung",clinicalRecords:"Klinische Akten",
      patientDetails:"Patientendetails",patientName:"Name / ID Patient",location:"Standort / Klinik",clinicalNotes:"Klinische Notizen",uploadAudio:"Audio hochladen",uploadPhoto:"Foto hochladen",audioSubtitle:"Gemma 4 — native Audio-Transkription",locationPlaceholder:"z.B. Dorfklinik A",
      copyJSON:"JSON kopieren",export:"Exportieren",recordAudio:"Audio aufnehmen",stopRecording:"Stoppen",
      takePhoto:"Foto aufnehmen",cameraSubtitle:"Öffnet Kamera — fragt Erlaubnis",selectFromGallery:"Aus Galerie wählen",capturePhoto:"Foto aufnehmen",retakePhoto:"Nochmals aufnehmen",useThisPhoto:"Dieses Foto verwenden",cameraAccessDenied:"Kamerazugriff verweigert. Bitte Foto hochladen.",pointAtLabel:"Auf Medikamentenetikett oder Wunde zeigen",
    };
    case "es": return {
      triage:"Triaje",medications:"Medicamentos",history:"Historial",demoCases:"Demos",about:"Acerca",
      clinical:"Clínico",info:"Info",aiEngine:"Motor IA",appLanguage:"Idioma de la app",
      signIn:"Iniciar sesión",signOut:"Cerrar sesión",newTriage:"Nuevo triaje",startTriageAnalysis:"Iniciar análisis",
      patientAudio:"Audio del paciente",photo:"Foto",optional:"Opcional",clinicalRecord:"Expediente clínico",
      patientInstructions:"Instrucciones al paciente",chiefComplaint:"Motivo principal",symptoms:"Síntomas",
      urgency:"Urgencia",medication:"Medicamento",recommendedAction:"Acción recomendada",
      confidence:"Confianza",detectedLanguage:"Idioma detectado",analyzing:"Gemma 4 E4B analizando…",
      allProcessingLocal:"Procesamiento local via Ollama. Ningún dato sale del dispositivo.",
      medicationWarning:"Advertencia de medicamento",medicationMismatch:"Discrepancia de medicamento",
      patient:"paciente",clinician:"clínico",typeSymptoms:"Escribir síntomas",
      clearAudio:"Borrar audio",clearImage:"Borrar imagen",
      ollamaReady:"Gemma 4 E4B listo",ollamaNotFound:"Modelo no encontrado — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama no disponible — inicia Ollama y ejecuta: ollama pull gemma4:e4b",

      welcomeTo:"Bienvenido a GemmaCare",
      multimodalAnalysis:"Análisis Multimodal",
      safetyVerification:"Verificación de Seguridad",
      multilingualSupport:"Soporte Multilingüe",
      fastProcessing:"Procesamiento Rápido",
      ourMission:"Nuestra Misión",
      missionText:"GemmaCare asiste a trabajadores de salud en entornos remotos con triaje clínico multimodal rápido.",
      importantDisclaimer:"Aviso Importante",
      disclaimerText:"GemmaCare es una herramienta de apoyo a decisiones clínicas. No sustituye el juicio médico profesional.",
      technicalDetails:"Detalles Técnicos",
      viewDemos:"Ver Demos",
      offlineCapable:"Funciona Sin Internet",
      offlineText:"Funciona en entornos de baja conectividad. Todos los datos permanecen en el dispositivo.",
      howItWorks:"Cómo Funciona",keyFeatures:"Características",startATriage:"Iniciar Triaje",
      input:"Entrada",extract:"Extraer",verify:"Verificar",record:"Registro",
      multilingualAI:"35+ Idiomas",localProcessing:"Procesamiento Local",safetyCheck:"Verificación de Seguridad",clinicalRecords:"Expedientes Clínicos",
      patientDetails:"Detalles del paciente",patientName:"Nombre / ID del paciente",location:"Ubicación / Clínica",clinicalNotes:"Notas clínicas",uploadAudio:"Subir audio",uploadPhoto:"Subir foto",audioSubtitle:"Gemma 4 — transcripción de audio nativa",locationPlaceholder:"ej. Clínica del pueblo A",
      copyJSON:"Copiar JSON",export:"Exportar",recordAudio:"Grabar audio",stopRecording:"Detener",
      takePhoto:"Tomar foto",cameraSubtitle:"Abre la cámara — solicita permiso",selectFromGallery:"Seleccionar de la galería",capturePhoto:"Capturar foto",retakePhoto:"Repetir",useThisPhoto:"Usar esta foto",cameraAccessDenied:"Acceso a cámara denegado. Por favor suba una foto.",pointAtLabel:"Apunte a la etiqueta del medicamento o herida",
    };
    case "it": return {
      triage:"Triage",medications:"Farmaci",history:"Cronologia",demoCases:"Demo",about:"Informazioni",
      clinical:"Clinico",info:"Info",aiEngine:"Motore IA",appLanguage:"Lingua app",
      signIn:"Accedi",signOut:"Esci",newTriage:"Nuovo triage",startTriageAnalysis:"Avvia analisi",
      patientAudio:"Audio paziente",photo:"Foto",optional:"Opzionale",clinicalRecord:"Cartella clinica",
      patientInstructions:"Istruzioni paziente",chiefComplaint:"Motivo principale",symptoms:"Sintomi",
      urgency:"Urgenza",medication:"Farmaco",recommendedAction:"Azione raccomandata",
      confidence:"Attendibilità",detectedLanguage:"Lingua rilevata",analyzing:"Gemma 4 E4B in analisi…",
      allProcessingLocal:"Elaborazione locale via Ollama. Nessun dato lascia il dispositivo.",
      medicationWarning:"Avviso farmaco",medicationMismatch:"Discrepanza farmaco",
      patient:"paziente",clinician:"clinico",typeSymptoms:"Scrivi sintomi",
      clearAudio:"Rimuovi audio",clearImage:"Rimuovi immagine",
      ollamaReady:"Gemma 4 E4B pronto",ollamaNotFound:"Modello non trovato — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama non raggiungibile — avvia Ollama poi: ollama pull gemma4:e4b",

      welcomeTo:"Benvenuto in GemmaCare",
      multimodalAnalysis:"Analisi Multimodale",
      safetyVerification:"Verifica Sicurezza",
      multilingualSupport:"Supporto Multilingue",
      fastProcessing:"Elaborazione Rapida",
      ourMission:"La Nostra Missione",
      missionText:"GemmaCare assiste gli operatori sanitari in ambienti remoti con triage clinico multimodale rapido.",
      importantDisclaimer:"Avvertenza Importante",
      disclaimerText:"GemmaCare è uno strumento di supporto decisionale clinico. Non sostituisce il giudizio medico professionale.",
      technicalDetails:"Dettagli Tecnici",
      viewDemos:"Vedi Demo",
      offlineCapable:"Funziona Offline",
      offlineText:"Funziona in ambienti con bassa connettività. Tutti i dati restano sul dispositivo.",
      howItWorks:"Come Funziona",keyFeatures:"Caratteristiche",startATriage:"Inizia un Triage",
      input:"Input",extract:"Estrai",verify:"Verifica",record:"Registra",
      multilingualAI:"35+ Lingue",localProcessing:"Elaborazione Locale",safetyCheck:"Controllo Sicurezza",clinicalRecords:"Cartelle Cliniche",
      patientDetails:"Dati paziente",patientName:"Nome / ID paziente",location:"Luogo / Clinica",clinicalNotes:"Note cliniche",uploadAudio:"Carica audio",uploadPhoto:"Carica foto",audioSubtitle:"Gemma 4 — trascrizione audio nativa",locationPlaceholder:"es. Clinica del villaggio A",
      copyJSON:"Copia JSON",export:"Esporta",recordAudio:"Registra audio",stopRecording:"Stop",
      takePhoto:"Scatta foto",cameraSubtitle:"Apre la fotocamera — richiede permesso",selectFromGallery:"Seleziona dalla galleria",capturePhoto:"Cattura foto",retakePhoto:"Riscatta",useThisPhoto:"Usa questa foto",cameraAccessDenied:"Accesso fotocamera negato. Carica una foto.",pointAtLabel:"Punta all'etichetta del farmaco o alla ferita",
    };
    case "pt": case "pt_br": return {
      triage:"Triagem",medications:"Medicamentos",history:"Histórico",demoCases:"Demos",about:"Sobre",
      clinical:"Clínico",info:"Info",aiEngine:"Motor de IA",appLanguage:"Idioma do app",
      signIn:"Entrar",signOut:"Sair",newTriage:"Nova triagem",startTriageAnalysis:"Iniciar análise",
      patientAudio:"Áudio do paciente",photo:"Foto",optional:"Opcional",clinicalRecord:"Registro clínico",
      patientInstructions:"Instruções ao paciente",chiefComplaint:"Queixa principal",symptoms:"Sintomas",
      urgency:"Urgência",medication:"Medicamento",recommendedAction:"Ação recomendada",
      confidence:"Confiança",detectedLanguage:"Idioma detectado",analyzing:"Gemma 4 E4B analisando…",
      allProcessingLocal:"Processamento local via Ollama. Nenhum dado sai do dispositivo.",
      medicationWarning:"Aviso de medicamento",medicationMismatch:"Discrepância de medicamento",
      patient:"paciente",clinician:"clínico",typeSymptoms:"Digitar sintomas",
      clearAudio:"Limpar áudio",clearImage:"Limpar imagem",
      ollamaReady:"Gemma 4 E4B pronto",ollamaNotFound:"Modelo não encontrado — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama inacessível — inicie o Ollama e execute: ollama pull gemma4:e4b",
      patientDetails:"Detalhes do paciente",patientName:"Nome / ID do paciente",location:"Local / Clínica",clinicalNotes:"Notas clínicas",uploadAudio:"Carregar áudio",uploadPhoto:"Carregar foto",audioSubtitle:"Gemma 4 — transcrição de áudio nativa",locationPlaceholder:"ex. Clínica da Aldeia A",
      copyJSON:"Copiar JSON",export:"Exportar",recordAudio:"Gravar áudio",stopRecording:"Parar",
      takePhoto:"Tirar foto",cameraSubtitle:"Abre câmera — pede permissão",selectFromGallery:"Selecionar da galeria",capturePhoto:"Capturar foto",retakePhoto:"Repetir",useThisPhoto:"Usar esta foto",cameraAccessDenied:"Acesso à câmera negado. Faça upload de uma foto.",pointAtLabel:"Aponte para o rótulo do medicamento ou ferida",

      welcomeTo:"Bem-vindo ao GemmaCare",
      multimodalAnalysis:"Análise Multimodal",
      safetyVerification:"Verificação de Segurança",
      multilingualSupport:"Suporte Multilíngue",
      fastProcessing:"Processamento Rápido",
      ourMission:"Nossa Missão",
      missionText:"O GemmaCare auxilia trabalhadores de saúde em ambientes remotos com triagem clínica multimodal rápida.",
      importantDisclaimer:"Aviso Importante",
      disclaimerText:"GemmaCare é uma ferramenta de suporte a decisões clínicas. Não substitui o julgamento médico profissional.",
      technicalDetails:"Detalhes Técnicos",
      viewDemos:"Ver Demos",
      offlineCapable:"Funciona Offline",
      offlineText:"Funciona em ambientes de baixa conectividade. Todos os dados ficam no dispositivo.",
      howItWorks:"Como Funciona",keyFeatures:"Funcionalidades",startATriage:"Iniciar Triagem",input:"Entrada",extract:"Extrair",verify:"Verificar",record:"Registrar",multilingualAI:"35+ Idiomas",localProcessing:"Processamento Local",safetyCheck:"Verificação",clinicalRecords:"Registros Clínicos",
      takePhoto:"Tirar foto",cameraSubtitle:"Abre câmera — pede permissão",selectFromGallery:"Selecionar da galeria",capturePhoto:"Capturar foto",retakePhoto:"Repetir",useThisPhoto:"Usar esta foto",cameraAccessDenied:"Acesso à câmera negado. Faça upload de uma foto.",pointAtLabel:"Aponte para o rótulo do medicamento ou ferida",
    };
    case "zh": case "zh_tw": return {
      triage:"分诊",medications:"药物",history:"历史",demoCases:"演示",about:"关于",
      clinical:"临床",info:"信息",aiEngine:"AI引擎",appLanguage:"应用语言",
      signIn:"登录",signOut:"退出",newTriage:"新分诊",startTriageAnalysis:"开始分析",
      patientAudio:"患者音频",photo:"照片",optional:"可选",clinicalRecord:"临床记录",
      patientInstructions:"患者须知",chiefComplaint:"主诉",symptoms:"症状",
      urgency:"紧急程度",medication:"药物",recommendedAction:"建议措施",
      confidence:"置信度",detectedLanguage:"检测到的语言",analyzing:"Gemma 4 E4B 分析中…",
      allProcessingLocal:"通过Ollama在本地处理，数据不会离开您的设备。",
      medicationWarning:"药物警告",medicationMismatch:"药物不匹配",
      patient:"患者",clinician:"医护人员",typeSymptoms:"输入症状",
      clearAudio:"清除音频",clearImage:"清除图片",
      ollamaReady:"Gemma 4 E4B 就绪",ollamaNotFound:"未找到模型 — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama 无法访问 — 启动 Ollama 然后: ollama pull gemma4:e4b",

      welcomeTo:"欢迎使用 GemmaCare",
      multimodalAnalysis:"多模态分析",
      safetyVerification:"安全验证",
      multilingualSupport:"多语言支持",
      fastProcessing:"快速处理",
      ourMission:"我们的使命",
      missionText:"GemmaCare 通过快速多模态临床分诊协助偏远地区的医疗工作者。",
      importantDisclaimer:"重要声明",
      disclaimerText:"GemmaCare 是临床决策支持工具，不能替代专业医疗判断。所有临床决策必须由合格的医疗专业人员做出。",
      technicalDetails:"技术详情",
      viewDemos:"查看演示",
      offlineCapable:"离线可用",
      offlineText:"在低连接环境中工作。所有数据保留在设备上。",
      howItWorks:"工作原理",keyFeatures:"主要功能",startATriage:"开始分诊",
      input:"输入",extract:"提取",verify:"验证",record:"记录",
      multilingualAI:"35+语言",localProcessing:"本地处理",safetyCheck:"安全检查",clinicalRecords:"临床记录",
      patientDetails:"患者详情",patientName:"患者姓名/ID",location:"地点/诊所",clinicalNotes:"临床备注",uploadAudio:"上传音频",uploadPhoto:"上传照片",audioSubtitle:"Gemma 4 — 原生音频转录",locationPlaceholder:"例：村卫生室 A",
      copyJSON:"复制JSON",export:"导出",recordAudio:"录音",stopRecording:"停止",
      takePhoto:"拍照",cameraSubtitle:"打开相机 — 请求权限",selectFromGallery:"从相册选择",capturePhoto:"拍摄照片",retakePhoto:"重拍",useThisPhoto:"使用此照片",cameraAccessDenied:"相机访问被拒绝。请上传照片。",pointAtLabel:"对准药品标签或伤口",
    };
    case "ja": return {
      triage:"トリアージ",medications:"薬",history:"履歴",demoCases:"デモ",about:"について",
      clinical:"臨床",info:"情報",aiEngine:"AIエンジン",appLanguage:"アプリ言語",
      signIn:"サインイン",signOut:"サインアウト",newTriage:"新規トリアージ",startTriageAnalysis:"分析開始",
      patientAudio:"患者音声",photo:"写真",optional:"任意",clinicalRecord:"診療記録",
      patientInstructions:"患者への指示",chiefComplaint:"主訴",symptoms:"症状",
      urgency:"緊急度",medication:"薬剤",recommendedAction:"推奨アクション",
      confidence:"信頼度",detectedLanguage:"検出言語",analyzing:"Gemma 4 E4B 分析中…",
      allProcessingLocal:"Ollamaを通じてローカルで処理。データは外部に送信されません。",
      medicationWarning:"薬剤警告",medicationMismatch:"薬剤不一致",
      patient:"患者",clinician:"医療者",typeSymptoms:"症状を入力",
      clearAudio:"音声削除",clearImage:"画像削除",
      ollamaReady:"Gemma 4 E4B 準備完了",ollamaNotFound:"モデル未検出 — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama 未起動 — 起動後: ollama pull gemma4:e4b",
      patientDetails:"患者詳細",patientName:"患者名/ID",location:"場所/クリニック",clinicalNotes:"臨床メモ",uploadAudio:"音声をアップロード",uploadPhoto:"写真をアップロード",audioSubtitle:"Gemma 4 — ネイティブ音声文字起こし",locationPlaceholder:"例: 村クリニック A",

      welcomeTo:"GemmaCare へようこそ",
      multimodalAnalysis:"マルチモーダル分析",
      safetyVerification:"安全確認",
      multilingualSupport:"多言語サポート",
      fastProcessing:"高速処理",
      ourMission:"私たちの使命",
      missionText:"GemmaCareは遠隔地の医療従事者を迅速なマルチモーダル臨床トリアージで支援します。",
      importantDisclaimer:"重要な免責事項",
      disclaimerText:"GemmaCareは臨床意思決定支援ツールです。専門的な医学的判断の代替ではありません。",
      technicalDetails:"技術的詳細",
      viewDemos:"デモを見る",
      offlineCapable:"オフライン対応",
      offlineText:"低接続環境で動作します。すべてのデータはデバイスに保存されます。",
      howItWorks:"仕組み",keyFeatures:"主な機能",startATriage:"トリアージを開始",input:"入力",extract:"抽出",verify:"確認",record:"記録",multilingualAI:"35+言語",localProcessing:"ローカル処理",safetyCheck:"安全確認",clinicalRecords:"診療記録",
      copyJSON:"JSONをコピー",export:"エクスポート",recordAudio:"音声録音",stopRecording:"停止",
      takePhoto:"写真を撮る",cameraSubtitle:"カメラを起動 — 許可を要求",selectFromGallery:"ギャラリーから選択",capturePhoto:"写真を撮影",retakePhoto:"撮り直す",useThisPhoto:"この写真を使用",cameraAccessDenied:"カメラのアクセスが拒否されました。写真をアップロードしてください。",pointAtLabel:"薬のラベルまたは傷口に向けてください",
    };
    case "ko": return {
      triage:"트리아지",medications:"약물",history:"기록",demoCases:"데모",about:"정보",
      clinical:"임상",info:"정보",aiEngine:"AI 엔진",appLanguage:"앱 언어",
      signIn:"로그인",signOut:"로그아웃",newTriage:"새 트리아지",startTriageAnalysis:"분석 시작",
      patientAudio:"환자 음성",photo:"사진",optional:"선택사항",clinicalRecord:"임상 기록",
      patientInstructions:"환자 지침",chiefComplaint:"주요 호소",symptoms:"증상",
      urgency:"긴급도",medication:"약물",recommendedAction:"권장 조치",
      confidence:"신뢰도",detectedLanguage:"감지된 언어",analyzing:"Gemma 4 E4B 분석 중…",
      allProcessingLocal:"Ollama를 통해 로컬에서 처리. 데이터는 기기를 떠나지 않습니다.",
      medicationWarning:"약물 경고",medicationMismatch:"약물 불일치",
      patient:"환자",clinician:"임상의",typeSymptoms:"증상 입력",
      clearAudio:"오디오 삭제",clearImage:"이미지 삭제",
      ollamaReady:"Gemma 4 E4B 준비 완료",ollamaNotFound:"모델 없음 — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama 연결 불가 — 실행 후: ollama pull gemma4:e4b",
      patientDetails:"환자 세부사항",patientName:"환자 이름/ID",location:"위치/클리닉",clinicalNotes:"임상 메모",uploadAudio:"오디오 업로드",uploadPhoto:"사진 업로드",audioSubtitle:"Gemma 4 — 네이티브 오디오 전사",locationPlaceholder:"예: 마을 클리닉 A",

      welcomeTo:"GemmaCare에 오신 것을 환영합니다",
      multimodalAnalysis:"멀티모달 분석",
      safetyVerification:"안전 검증",
      multilingualSupport:"다국어 지원",
      fastProcessing:"빠른 처리",
      ourMission:"우리의 사명",
      missionText:"GemmaCare는 오지 의료 종사자들을 빠른 멀티모달 임상 트리아지로 지원합니다.",
      importantDisclaimer:"중요 면책 조항",
      disclaimerText:"GemmaCare는 임상 의사결정 지원 도구입니다. 전문적인 의학적 판단을 대체하지 않습니다.",
      technicalDetails:"기술적 세부사항",
      viewDemos:"데모 보기",
      offlineCapable:"오프라인 사용 가능",
      offlineText:"저연결 환경에서 작동합니다. 모든 데이터는 기기에 저장됩니다.",
      howItWorks:"작동 방식",keyFeatures:"주요 기능",startATriage:"트리아지 시작",input:"입력",extract:"추출",verify:"확인",record:"기록",multilingualAI:"35+언어",localProcessing:"로컬 처리",safetyCheck:"안전 확인",clinicalRecords:"임상 기록",
      copyJSON:"JSON 복사",export:"내보내기",recordAudio:"오디오 녹음",stopRecording:"중지",
      takePhoto:"사진 찍기",cameraSubtitle:"카메라 열기 — 권한 요청",selectFromGallery:"갤러리에서 선택",capturePhoto:"사진 캡처",retakePhoto:"다시 찍기",useThisPhoto:"이 사진 사용",cameraAccessDenied:"카메라 접근이 거부됐습니다. 사진을 업로드하세요.",pointAtLabel:"약 라벨 또는 상처를 향해 주세요",
    };
    case "ar": return {
      triage:"الفرز",medications:"الأدوية",history:"السجل",demoCases:"العروض",about:"حول",
      clinical:"سريري",info:"معلومات",aiEngine:"محرك الذكاء",appLanguage:"لغة التطبيق",
      signIn:"تسجيل الدخول",signOut:"تسجيل الخروج",newTriage:"فرز جديد",startTriageAnalysis:"بدء التحليل",
      patientAudio:"صوت المريض",photo:"صورة",optional:"اختياري",clinicalRecord:"السجل الطبي",
      patientInstructions:"تعليمات المريض",chiefComplaint:"الشكوى الرئيسية",symptoms:"الأعراض",
      urgency:"الإلحاح",medication:"الدواء",recommendedAction:"الإجراء الموصى به",
      confidence:"الثقة",detectedLanguage:"اللغة المكتشفة",analyzing:"Gemma 4 E4B يحلل…",
      allProcessingLocal:"المعالجة محلياً عبر Ollama. لا تغادر أي بيانات جهازك.",
      medicationWarning:"تحذير دواء",medicationMismatch:"تعارض الدواء",
      patient:"مريض",clinician:"طبيب",typeSymptoms:"اكتب الأعراض",
      clearAudio:"حذف الصوت",clearImage:"حذف الصورة",
      ollamaReady:"Gemma 4 E4B جاهز",ollamaNotFound:"النموذج غير موجود — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama غير متاح — شغّل Ollama ثم: ollama pull gemma4:e4b",
      patientDetails:"تفاصيل المريض",patientName:"اسم / معرف المريض",location:"الموقع / العيادة",clinicalNotes:"ملاحظات سريرية",uploadAudio:"رفع صوت",uploadPhoto:"رفع صورة",audioSubtitle:"Gemma 4 — نسخ صوتي أصلي",locationPlaceholder:"مثال: عيادة القرية أ",

      welcomeTo:"مرحباً بك في GemmaCare",
      multimodalAnalysis:"التحليل متعدد الوسائط",
      safetyVerification:"التحقق من الأمان",
      multilingualSupport:"الدعم متعدد اللغات",
      fastProcessing:"المعالجة السريعة",
      ourMission:"مهمتنا",
      missionText:"يساعد GemmaCare عمال الصحة في البيئات النائية بالفرز السريري السريع متعدد الوسائط.",
      importantDisclaimer:"إخلاء مسؤولية مهم",
      disclaimerText:"GemmaCare أداة دعم قرار سريري. إنها ليست بديلاً عن الحكم الطبي المهني.",
      technicalDetails:"التفاصيل التقنية",
      viewDemos:"عرض التجارب",
      offlineCapable:"يعمل بلا إنترنت",
      offlineText:"يعمل في بيئات ذات اتصال منخفض. جميع البيانات تبقى على الجهاز.",
      howItWorks:"كيف يعمل",keyFeatures:"الميزات الرئيسية",startATriage:"بدء الفرز",input:"إدخال",extract:"استخراج",verify:"تحقق",record:"تسجيل",multilingualAI:"+35 لغة",localProcessing:"معالجة محلية",safetyCheck:"فحص الأمان",clinicalRecords:"السجلات السريرية",
      copyJSON:"نسخ JSON",export:"تصدير",recordAudio:"تسجيل صوت",stopRecording:"إيقاف",
      takePhoto:"التقط صورة",cameraSubtitle:"يفتح الكاميرا — يطلب الإذن",selectFromGallery:"اختر من المعرض",capturePhoto:"التقط الصورة",retakePhoto:"أعد التصوير",useThisPhoto:"استخدم هذه الصورة",cameraAccessDenied:"تم رفض الوصول إلى الكاميرا. يرجى رفع صورة بدلاً من ذلك.",pointAtLabel:"وجّه نحو ملصق الدواء أو الجرح",
    };
    case "hi": return {
      triage:"ट्राइएज",medications:"दवाइयाँ",history:"इतिहास",demoCases:"डेमो",about:"के बारे में",
      clinical:"चिकित्सा",info:"जानकारी",aiEngine:"AI इंजन",appLanguage:"ऐप भाषा",
      signIn:"साइन इन",signOut:"साइन आउट",newTriage:"नया ट्राइएज",startTriageAnalysis:"विश्लेषण शुरू करें",
      patientAudio:"रोगी ऑडियो",photo:"फोटो",optional:"वैकल्पिक",clinicalRecord:"चिकित्सा रिकॉर्ड",
      patientInstructions:"रोगी निर्देश",chiefComplaint:"मुख्य शिकायत",symptoms:"लक्षण",
      urgency:"तात्कालिकता",medication:"दवा",recommendedAction:"अनुशंसित कार्रवाई",
      confidence:"विश्वास",detectedLanguage:"पहचानी गई भाषा",analyzing:"Gemma 4 E4B विश्लेषण कर रहा है…",
      allProcessingLocal:"सभी प्रोसेसिंग Ollama के माध्यम से स्थानीय। कोई डेटा नहीं जाता।",
      medicationWarning:"दवा चेतावनी",medicationMismatch:"दवा असंगति",
      patient:"रोगी",clinician:"चिकित्सक",typeSymptoms:"लक्षण टाइप करें",
      clearAudio:"ऑडियो हटाएं",clearImage:"छवि हटाएं",
      ollamaReady:"Gemma 4 E4B तैयार",ollamaNotFound:"मॉडल नहीं मिला — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama उपलब्ध नहीं — शुरू करें फिर: ollama pull gemma4:e4b",
      patientDetails:"रोगी विवरण",patientName:"रोगी नाम / ID",location:"स्थान / क्लिनिक",clinicalNotes:"नैदानिक नोट्स",uploadAudio:"ऑडियो अपलोड करें",uploadPhoto:"फोटो अपलोड करें",audioSubtitle:"Gemma 4 — मूल ऑडियो ट्रांसक्रिप्शन",locationPlaceholder:"उदा. ग्राम क्लिनिक A",

      welcomeTo:"GemmaCare में आपका स्वागत है",
      multimodalAnalysis:"बहु-मोडल विश्लेषण",
      safetyVerification:"सुरक्षा सत्यापन",
      multilingualSupport:"बहुभाषी समर्थन",
      fastProcessing:"तेज़ प्रोसेसिंग",
      ourMission:"हमारा मिशन",
      missionText:"GemmaCare दूरस्थ क्षेत्रों में स्वास्थ्य कर्मियों की त्वरित बहु-मोडल क्लिनिकल ट्राइएज में सहायता करता है।",
      importantDisclaimer:"महत्वपूर्ण अस्वीकरण",
      disclaimerText:"GemmaCare एक क्लिनिकल निर्णय सहायता उपकरण है। यह पेशेवर चिकित्सा निर्णय का विकल्प नहीं है।",
      technicalDetails:"तकनीकी विवरण",
      viewDemos:"डेमो देखें",
      offlineCapable:"ऑफलाइन सक्षम",
      offlineText:"कम कनेक्टिविटी में काम करता है। सभी डेटा डिवाइस पर रहता है।",
      howItWorks:"यह कैसे काम करता है",keyFeatures:"मुख्य विशेषताएं",startATriage:"ट्राइएज शुरू करें",input:"इनपुट",extract:"निकालें",verify:"सत्यापित करें",record:"रिकॉर्ड",multilingualAI:"35+ भाषाएं",localProcessing:"स्थानीय प्रोसेसिंग",safetyCheck:"सुरक्षा जांच",clinicalRecords:"चिकित्सा रिकॉर्ड",
      copyJSON:"JSON कॉपी करें",export:"निर्यात",recordAudio:"ऑडियो रिकॉर्ड",stopRecording:"रोकें",
      takePhoto:"फोटो लें",cameraSubtitle:"कैमरा खोलें — अनुमति मांगें",selectFromGallery:"गैलरी से चुनें",capturePhoto:"फोटो कैप्चर करें",retakePhoto:"दोबारा लें",useThisPhoto:"यह फोटो उपयोग करें",cameraAccessDenied:"कैमरा एक्सेस अस्वीकृत। कृपया फोटो अपलोड करें।",pointAtLabel:"दवा के लेबल या घाव पर इंगित करें",
    };
    case "sw": return {
      triage:"Uchunguzi",medications:"Dawa",history:"Historia",demoCases:"Maonyesho",about:"Kuhusu",
      clinical:"Kliniki",info:"Habari",aiEngine:"Injini ya AI",appLanguage:"Lugha ya App",
      signIn:"Ingia",signOut:"Toka",newTriage:"Uchunguzi mpya",startTriageAnalysis:"Anza uchambuzi",
      patientAudio:"Sauti ya mgonjwa",photo:"Picha",optional:"Hiari",clinicalRecord:"Rekodi ya kliniki",
      patientInstructions:"Maelekezo ya mgonjwa",chiefComplaint:"Malalamiko kuu",symptoms:"Dalili",
      urgency:"Dharura",medication:"Dawa",recommendedAction:"Hatua inayopendekezwa",
      confidence:"Uhakika",detectedLanguage:"Lugha iliyogunduliwa",analyzing:"Gemma 4 E4B inachambua…",
      allProcessingLocal:"Uchakataji wa ndani via Ollama. Hakuna data inayotoka.",
      medicationWarning:"Onyo la dawa",medicationMismatch:"Kutofautiana kwa dawa",
      patient:"mgonjwa",clinician:"daktari",typeSymptoms:"Andika dalili",
      clearAudio:"Futa sauti",clearImage:"Futa picha",
      ollamaReady:"Gemma 4 E4B tayari",ollamaNotFound:"Mfano haujapatikana — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama haifiki — anzisha Ollama kisha: ollama pull gemma4:e4b",
      patientDetails:"Maelezo ya mgonjwa",patientName:"Jina / ID ya mgonjwa",location:"Mahali / Kliniki",clinicalNotes:"Maelezo ya kliniki",uploadAudio:"Pakia sauti",uploadPhoto:"Pakia picha",audioSubtitle:"Gemma 4 — unukuzi wa sauti asili",locationPlaceholder:"mf. Kliniki ya Kijiji A",

      welcomeTo:"Karibu GemmaCare",
      multimodalAnalysis:"Uchambuzi wa Njia Nyingi",
      safetyVerification:"Uhakiki wa Usalama",
      multilingualSupport:"Msaada wa Lugha Nyingi",
      fastProcessing:"Usindikaji wa Haraka",
      ourMission:"Dhamira Yetu",
      missionText:"GemmaCare husaidia wafanyakazi wa afya katika mazingira ya mbali na uchunguzi wa haraka wa kimulimuli.",
      importantDisclaimer:"Kanusho Muhimu",
      disclaimerText:"GemmaCare ni zana ya msaada wa maamuzi ya kliniki. Si mbadala wa hukumu ya kitaalamu ya matibabu.",
      technicalDetails:"Maelezo ya Kiufundi",
      viewDemos:"Tazama Maonyesho",
      offlineCapable:"Inafanya Kazi Nje ya Mtandao",
      offlineText:"Inafanya kazi katika mazingira ya muunganisho mdogo. Data yote inabaki kwenye kifaa.",
      howItWorks:"Jinsi Inavyofanya Kazi",keyFeatures:"Vipengele Vikuu",startATriage:"Anza Uchunguzi",input:"Ingiza",extract:"Toa",verify:"Thibitisha",record:"Rekodi",multilingualAI:"Lugha 35+",localProcessing:"Usindikaji wa Ndani",safetyCheck:"Ukaguzi wa Usalama",clinicalRecords:"Rekodi za Kliniki",
      copyJSON:"Nakili JSON",export:"Hamisha",recordAudio:"Rekodi sauti",stopRecording:"Simama",
      takePhoto:"Piga picha",cameraSubtitle:"Inafungua kamera — inauliza ruhusa",selectFromGallery:"Chagua kutoka kwenye jalada",capturePhoto:"Piga picha",retakePhoto:"Piga tena",useThisPhoto:"Tumia picha hii",cameraAccessDenied:"Ufikiaji wa kamera ulikataliwa. Tafadhali pakia picha.",pointAtLabel:"Elekeza kwenye lebo ya dawa au jeraha",
    };
    case "nl": return {
      triage:"Triage",medications:"Medicijnen",history:"Geschiedenis",demoCases:"Demo's",about:"Over",
      clinical:"Klinisch",info:"Info",aiEngine:"AI-motor",appLanguage:"App-taal",
      signIn:"Inloggen",signOut:"Uitloggen",newTriage:"Nieuwe triage",startTriageAnalysis:"Analyse starten",
      patientAudio:"Patiëntaudio",photo:"Foto",optional:"Optioneel",clinicalRecord:"Klinisch dossier",
      patientInstructions:"Patiëntinstructies",chiefComplaint:"Hoofdklacht",symptoms:"Symptomen",
      urgency:"Urgentie",medication:"Medicijn",recommendedAction:"Aanbevolen actie",
      confidence:"Betrouwbaarheid",detectedLanguage:"Gedetecteerde taal",analyzing:"Gemma 4 E4B analyseert…",
      allProcessingLocal:"Alle verwerking lokaal via Ollama. Geen gegevens verlaten uw apparaat.",
      medicationWarning:"Medicijnwaarschuwing",medicationMismatch:"Medicijnfout",
      patient:"patiënt",clinician:"clinicus",typeSymptoms:"Symptomen typen",
      clearAudio:"Audio wissen",clearImage:"Afbeelding wissen",
      ollamaReady:"Gemma 4 E4B gereed",ollamaNotFound:"Model niet gevonden — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama niet bereikbaar — start Ollama dan: ollama pull gemma4:e4b",
      patientDetails:"Patiëntgegevens",patientName:"Patiëntnaam / ID",location:"Locatie / Kliniek",clinicalNotes:"Klinische notities",uploadAudio:"Audio uploaden",uploadPhoto:"Foto uploaden",audioSubtitle:"Gemma 4 — native audiotranscriptie",locationPlaceholder:"bijv. Dorpskliniek A",
      howItWorks:"Hoe het werkt",keyFeatures:"Kernfuncties",startATriage:"Triage starten",input:"Invoer",extract:"Extraheren",verify:"Verifiëren",record:"Vastleggen",multilingualAI:"35+ talen",localProcessing:"Lokale verwerking",safetyCheck:"Veiligheidscontrole",clinicalRecords:"Klinische dossiers",
      copyJSON:"JSON kopiëren",export:"Exporteren",recordAudio:"Audio opnemen",stopRecording:"Stoppen",
      takePhoto:"Foto nemen",cameraSubtitle:"Opent camera — vraagt toestemming",selectFromGallery:"Kies uit galerij",capturePhoto:"Foto maken",retakePhoto:"Opnieuw",useThisPhoto:"Gebruik deze foto",cameraAccessDenied:"Cameratoegang geweigerd. Upload een foto.",pointAtLabel:"Wijs naar medicijnetiket of wond",
    };
    case "ru": return {
      triage:"Триаж",medications:"Лекарства",history:"История",demoCases:"Демо",about:"О приложении",
      clinical:"Клинический",info:"Инфо",aiEngine:"AI-движок",appLanguage:"Язык приложения",
      signIn:"Войти",signOut:"Выйти",newTriage:"Новый триаж",startTriageAnalysis:"Начать анализ",
      patientAudio:"Аудио пациента",photo:"Фото",optional:"Необязательно",clinicalRecord:"Клиническая запись",
      patientInstructions:"Инструкции пациенту",chiefComplaint:"Основная жалоба",symptoms:"Симптомы",
      urgency:"Срочность",medication:"Лекарство",recommendedAction:"Рекомендуемые действия",
      confidence:"Уверенность",detectedLanguage:"Определённый язык",analyzing:"Gemma 4 E4B анализирует…",
      allProcessingLocal:"Вся обработка локально через Ollama. Данные не покидают устройство.",
      medicationWarning:"Предупреждение о лекарстве",medicationMismatch:"Несоответствие лекарств",
      patient:"пациент",clinician:"клиницист",typeSymptoms:"Введите симптомы",
      clearAudio:"Удалить аудио",clearImage:"Удалить изображение",
      ollamaReady:"Gemma 4 E4B готов",ollamaNotFound:"Модель не найдена — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama недоступна — запустите Ollama, затем: ollama pull gemma4:e4b",
      patientDetails:"Данные пациента",patientName:"Имя / ID пациента",location:"Место / Клиника",clinicalNotes:"Клинические заметки",uploadAudio:"Загрузить аудио",uploadPhoto:"Загрузить фото",audioSubtitle:"Gemma 4 — нативная транскрипция аудио",locationPlaceholder:"напр. Сельская клиника А",
      howItWorks:"Как это работает",keyFeatures:"Ключевые функции",startATriage:"Начать триаж",input:"Ввод",extract:"Извлечь",verify:"Проверить",record:"Запись",multilingualAI:"35+ языков",localProcessing:"Локальная обработка",safetyCheck:"Проверка безопасности",clinicalRecords:"Клинические записи",
      copyJSON:"Копировать JSON",export:"Экспорт",recordAudio:"Запись аудио",stopRecording:"Стоп",
      takePhoto:"Сделать фото",cameraSubtitle:"Открывает камеру — запрашивает разрешение",selectFromGallery:"Выбрать из галереи",capturePhoto:"Снять фото",retakePhoto:"Переснять",useThisPhoto:"Использовать фото",cameraAccessDenied:"Доступ к камере запрещён. Загрузите фото.",pointAtLabel:"Направьте на этикетку лекарства или рану",
    };
    case "tr": return {
      triage:"Triyaj",medications:"İlaçlar",history:"Geçmiş",demoCases:"Demolar",about:"Hakkında",
      clinical:"Klinik",info:"Bilgi",aiEngine:"Yapay Zeka",appLanguage:"Uygulama Dili",
      signIn:"Giriş Yap",signOut:"Çıkış Yap",newTriage:"Yeni Triyaj",startTriageAnalysis:"Analizi Başlat",
      patientAudio:"Hasta Sesi",photo:"Fotoğraf",optional:"İsteğe Bağlı",clinicalRecord:"Klinik Kayıt",
      patientInstructions:"Hasta Talimatları",chiefComplaint:"Ana Şikayet",symptoms:"Belirtiler",
      urgency:"Aciliyet",medication:"İlaç",recommendedAction:"Önerilen Eylem",
      confidence:"Güven",detectedLanguage:"Algılanan Dil",analyzing:"Gemma 4 E4B analiz ediyor…",
      allProcessingLocal:"Tüm işlem Ollama aracılığıyla yerel olarak yapılır. Veri cihazı terk etmez.",
      medicationWarning:"İlaç Uyarısı",medicationMismatch:"İlaç Uyuşmazlığı",
      patient:"hasta",clinician:"klinisyen",typeSymptoms:"Belirtileri Yazın",
      clearAudio:"Sesi Temizle",clearImage:"Resmi Temizle",
      ollamaReady:"Gemma 4 E4B hazır",ollamaNotFound:"Model bulunamadı — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama erişilemiyor — Ollama'yı başlatın: ollama pull gemma4:e4b",
      patientDetails:"Hasta Detayları",patientName:"Hasta Adı / ID",location:"Konum / Klinik",clinicalNotes:"Klinik Notlar",uploadAudio:"Ses Yükle",uploadPhoto:"Fotoğraf Yükle",audioSubtitle:"Gemma 4 — yerel ses dönüşümü",locationPlaceholder:"ör. Köy Kliniği A",
      howItWorks:"Nasıl Çalışır",keyFeatures:"Temel Özellikler",startATriage:"Triyaj Başlat",input:"Giriş",extract:"Çıkar",verify:"Doğrula",record:"Kayıt",multilingualAI:"35+ Dil",localProcessing:"Yerel İşleme",safetyCheck:"Güvenlik Kontrolü",clinicalRecords:"Klinik Kayıtlar",
      copyJSON:"JSON Kopyala",export:"Dışa Aktar",recordAudio:"Ses Kaydet",stopRecording:"Durdur",
      takePhoto:"Fotoğraf çek",cameraSubtitle:"Kamerayı açar — izin ister",selectFromGallery:"Galeriden seç",capturePhoto:"Fotoğrafı yakala",retakePhoto:"Yeniden çek",useThisPhoto:"Bu fotoğrafı kullan",cameraAccessDenied:"Kamera erişimi reddedildi. Lütfen fotoğraf yükleyin.",pointAtLabel:"İlaç etiketine veya yaraya doğrultun",
    };
    case "id": case "ms": return {
      triage:"Triase",medications:"Obat-obatan",history:"Riwayat",demoCases:"Demo",about:"Tentang",
      clinical:"Klinis",info:"Info",aiEngine:"Mesin AI",appLanguage:"Bahasa Aplikasi",
      signIn:"Masuk",signOut:"Keluar",newTriage:"Triase Baru",startTriageAnalysis:"Mulai Analisis",
      patientAudio:"Audio Pasien",photo:"Foto",optional:"Opsional",clinicalRecord:"Rekam Medis",
      patientInstructions:"Instruksi Pasien",chiefComplaint:"Keluhan Utama",symptoms:"Gejala",
      urgency:"Urgensi",medication:"Obat",recommendedAction:"Tindakan yang Dianjurkan",
      confidence:"Kepercayaan",detectedLanguage:"Bahasa Terdeteksi",analyzing:"Gemma 4 E4B menganalisis…",
      allProcessingLocal:"Semua pemrosesan lokal via Ollama. Tidak ada data yang keluar dari perangkat.",
      medicationWarning:"Peringatan Obat",medicationMismatch:"Ketidakcocokan Obat",
      patient:"pasien",clinician:"klinisi",typeSymptoms:"Ketik Gejala",
      clearAudio:"Hapus Audio",clearImage:"Hapus Gambar",
      ollamaReady:"Gemma 4 E4B siap",ollamaNotFound:"Model tidak ditemukan — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama tidak terjangkau — jalankan Ollama lalu: ollama pull gemma4:e4b",
      patientDetails:"Detail Pasien",patientName:"Nama / ID Pasien",location:"Lokasi / Klinik",clinicalNotes:"Catatan Klinis",uploadAudio:"Unggah Audio",uploadPhoto:"Unggah Foto",audioSubtitle:"Gemma 4 — transkripsi audio asli",locationPlaceholder:"mis. Klinik Desa A",
      howItWorks:"Cara Kerja",keyFeatures:"Fitur Utama",startATriage:"Mulai Triase",input:"Input",extract:"Ekstrak",verify:"Verifikasi",record:"Rekam",multilingualAI:"35+ Bahasa",localProcessing:"Pemrosesan Lokal",safetyCheck:"Pemeriksaan Keamanan",clinicalRecords:"Rekam Medis",
      copyJSON:"Salin JSON",export:"Ekspor",recordAudio:"Rekam Audio",stopRecording:"Berhenti",
      takePhoto:"Ambil foto",cameraSubtitle:"Buka kamera — minta izin",selectFromGallery:"Pilih dari galeri",capturePhoto:"Ambil foto",retakePhoto:"Ulangi",useThisPhoto:"Gunakan foto ini",cameraAccessDenied:"Akses kamera ditolak. Silakan unggah foto.",pointAtLabel:"Arahkan ke label obat atau luka",
    };
    case "vi": return {
      triage:"Phân loại",medications:"Thuốc",history:"Lịch sử",demoCases:"Demo",about:"Giới thiệu",
      clinical:"Lâm sàng",info:"Thông tin",aiEngine:"Động cơ AI",appLanguage:"Ngôn ngữ ứng dụng",
      signIn:"Đăng nhập",signOut:"Đăng xuất",newTriage:"Phân loại mới",startTriageAnalysis:"Bắt đầu phân tích",
      patientAudio:"Âm thanh bệnh nhân",photo:"Ảnh",optional:"Tùy chọn",clinicalRecord:"Hồ sơ lâm sàng",
      patientInstructions:"Hướng dẫn bệnh nhân",chiefComplaint:"Phàn nàn chính",symptoms:"Triệu chứng",
      urgency:"Mức độ cấp bách",medication:"Thuốc",recommendedAction:"Hành động được đề xuất",
      confidence:"Độ tin cậy",detectedLanguage:"Ngôn ngữ phát hiện",analyzing:"Gemma 4 E4B đang phân tích…",
      allProcessingLocal:"Xử lý hoàn toàn cục bộ qua Ollama. Không có dữ liệu nào rời thiết bị.",
      medicationWarning:"Cảnh báo thuốc",medicationMismatch:"Không khớp thuốc",
      patient:"bệnh nhân",clinician:"bác sĩ",typeSymptoms:"Nhập triệu chứng",
      clearAudio:"Xóa âm thanh",clearImage:"Xóa ảnh",
      ollamaReady:"Gemma 4 E4B sẵn sàng",ollamaNotFound:"Không tìm thấy mô hình — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama không thể truy cập — khởi động Ollama rồi: ollama pull gemma4:e4b",
      patientDetails:"Chi tiết bệnh nhân",patientName:"Tên / ID bệnh nhân",location:"Địa điểm / Phòng khám",clinicalNotes:"Ghi chú lâm sàng",uploadAudio:"Tải lên âm thanh",uploadPhoto:"Tải lên ảnh",audioSubtitle:"Gemma 4 — chuyển đổi âm thanh gốc",locationPlaceholder:"vd. Phòng khám Làng A",
      howItWorks:"Cách hoạt động",keyFeatures:"Tính năng chính",startATriage:"Bắt đầu phân loại",input:"Đầu vào",extract:"Trích xuất",verify:"Xác minh",record:"Ghi lại",multilingualAI:"35+ ngôn ngữ",localProcessing:"Xử lý cục bộ",safetyCheck:"Kiểm tra an toàn",clinicalRecords:"Hồ sơ lâm sàng",
      copyJSON:"Sao chép JSON",export:"Xuất",recordAudio:"Ghi âm",stopRecording:"Dừng",
      takePhoto:"Chụp ảnh",cameraSubtitle:"Mở camera — yêu cầu quyền",selectFromGallery:"Chọn từ thư viện",capturePhoto:"Chụp ảnh",retakePhoto:"Chụp lại",useThisPhoto:"Dùng ảnh này",cameraAccessDenied:"Quyền camera bị từ chối. Vui lòng tải ảnh lên.",pointAtLabel:"Hướng vào nhãn thuốc hoặc vết thương",
    };
    case "th": return {
      triage:"การคัดกรอง",medications:"ยา",history:"ประวัติ",demoCases:"เดโม",about:"เกี่ยวกับ",
      clinical:"ทางคลินิก",info:"ข้อมูล",aiEngine:"AI Engine",appLanguage:"ภาษาแอป",
      signIn:"เข้าสู่ระบบ",signOut:"ออกจากระบบ",newTriage:"การคัดกรองใหม่",startTriageAnalysis:"เริ่มการวิเคราะห์",
      patientAudio:"เสียงผู้ป่วย",photo:"รูปภาพ",optional:"ไม่บังคับ",clinicalRecord:"บันทึกทางคลินิก",
      patientInstructions:"คำแนะนำผู้ป่วย",chiefComplaint:"อาการหลัก",symptoms:"อาการ",
      urgency:"ความเร่งด่วน",medication:"ยา",recommendedAction:"การดำเนินการที่แนะนำ",
      confidence:"ความมั่นใจ",detectedLanguage:"ภาษาที่ตรวจพบ",analyzing:"Gemma 4 E4B กำลังวิเคราะห์…",
      allProcessingLocal:"ประมวลผลในเครื่องผ่าน Ollama ไม่มีข้อมูลออกจากอุปกรณ์",
      medicationWarning:"คำเตือนยา",medicationMismatch:"ยาไม่ตรงกัน",
      patient:"ผู้ป่วย",clinician:"แพทย์",typeSymptoms:"พิมพ์อาการ",
      clearAudio:"ล้างเสียง",clearImage:"ล้างรูปภาพ",
      ollamaReady:"Gemma 4 E4B พร้อม",ollamaNotFound:"ไม่พบโมเดล — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama ไม่พร้อมใช้งาน — เริ่ม Ollama แล้ว: ollama pull gemma4:e4b",
      patientDetails:"รายละเอียดผู้ป่วย",patientName:"ชื่อ / ID ผู้ป่วย",location:"สถานที่ / คลินิก",clinicalNotes:"บันทึกทางคลินิก",uploadAudio:"อัปโหลดเสียง",uploadPhoto:"อัปโหลดรูปภาพ",audioSubtitle:"Gemma 4 — การถอดเสียงดั้งเดิม",locationPlaceholder:"เช่น คลินิกหมู่บ้าน A",
      howItWorks:"วิธีการทำงาน",keyFeatures:"คุณสมบัติหลัก",startATriage:"เริ่มการคัดกรอง",input:"ป้อนข้อมูล",extract:"สกัด",verify:"ตรวจสอบ",record:"บันทึก",multilingualAI:"35+ ภาษา",localProcessing:"ประมวลผลในเครื่อง",safetyCheck:"ตรวจสอบความปลอดภัย",clinicalRecords:"บันทึกทางการแพทย์",
      copyJSON:"คัดลอก JSON",export:"ส่งออก",recordAudio:"บันทึกเสียง",stopRecording:"หยุด",
      takePhoto:"ถ่ายรูป",cameraSubtitle:"เปิดกล้อง — ขอสิทธิ์",selectFromGallery:"เลือกจากแกลเลอรี",capturePhoto:"ถ่ายภาพ",retakePhoto:"ถ่ายใหม่",useThisPhoto:"ใช้รูปนี้",cameraAccessDenied:"ถูกปฏิเสธการเข้าถึงกล้อง กรุณาอัปโหลดรูปภาพ",pointAtLabel:"ชี้ที่ฉลากยาหรือบาดแผล",
    };
    case "bn": return {
      triage:"ট্রাইয়েজ",medications:"ওষুধ",history:"ইতিহাস",demoCases:"ডেমো",about:"সম্পর্কে",
      clinical:"ক্লিনিকাল",info:"তথ্য",aiEngine:"AI ইঞ্জিন",appLanguage:"অ্যাপ ভাষা",
      signIn:"সাইন ইন",signOut:"সাইন আউট",newTriage:"নতুন ট্রাইয়েজ",startTriageAnalysis:"বিশ্লেষণ শুরু করুন",
      patientAudio:"রোগীর অডিও",photo:"ছবি",optional:"ঐচ্ছিক",clinicalRecord:"ক্লিনিকাল রেকর্ড",
      patientInstructions:"রোগীর নির্দেশনা",chiefComplaint:"প্রধান অভিযোগ",symptoms:"উপসর্গ",
      urgency:"জরুরিতা",medication:"ওষুধ",recommendedAction:"প্রস্তাবিত পদক্ষেপ",
      confidence:"আস্থা",detectedLanguage:"শনাক্ত ভাষা",analyzing:"Gemma 4 E4B বিশ্লেষণ করছে…",
      allProcessingLocal:"সব প্রক্রিয়াকরণ Ollama এর মাধ্যমে স্থানীয়ভাবে। কোনো ডেটা বের হয় না।",
      medicationWarning:"ওষুধ সতর্কতা",medicationMismatch:"ওষুধ অমিল",
      patient:"রোগী",clinician:"চিকিৎসক",typeSymptoms:"উপসর্গ লিখুন",
      clearAudio:"অডিও মুছুন",clearImage:"ছবি মুছুন",
      ollamaReady:"Gemma 4 E4B প্রস্তুত",ollamaNotFound:"মডেল পাওয়া যায়নি — ollama pull gemma4:e4b",
      ollamaOffline:"Ollama অনুপলব্ধ — Ollama শুরু করুন তারপর: ollama pull gemma4:e4b",
      patientDetails:"রোগীর বিবরণ",patientName:"রোগীর নাম / ID",location:"অবস্থান / ক্লিনিক",clinicalNotes:"ক্লিনিকাল নোট",uploadAudio:"অডিও আপলোড করুন",uploadPhoto:"ছবি আপলোড করুন",audioSubtitle:"Gemma 4 — নেটিভ অডিও ট্রান্সক্রিপশন",locationPlaceholder:"যেমন গ্রাম ক্লিনিক A",
      howItWorks:"এটি কীভাবে কাজ করে",keyFeatures:"মূল বৈশিষ্ট্য",startATriage:"ট্রাইয়েজ শুরু করুন",input:"ইনপুট",extract:"বের করুন",verify:"যাচাই করুন",record:"রেকর্ড",multilingualAI:"৩৫+ ভাষা",localProcessing:"স্থানীয় প্রক্রিয়াকরণ",safetyCheck:"নিরাপত্তা পরীক্ষা",clinicalRecords:"ক্লিনিকাল রেকর্ড",
      copyJSON:"JSON কপি করুন",export:"রপ্তানি করুন",recordAudio:"অডিও রেকর্ড",stopRecording:"থামান",
      takePhoto:"ছবি তুলুন",cameraSubtitle:"ক্যামেরা খুলুন — অনুমতি চাইবে",selectFromGallery:"গ্যালারি থেকে নির্বাচন করুন",capturePhoto:"ফটো ক্যাপচার করুন",retakePhoto:"আবার তুলুন",useThisPhoto:"এই ছবি ব্যবহার করুন",cameraAccessDenied:"ক্যামেরা অ্যাক্সেস প্রত্যাখ্যান। দয়া করে ছবি আপলোড করুন।",pointAtLabel:"ওষুধের লেবেল বা ক্ষতস্থানে নির্দেশ করুন",
    };
    case "ta": return {
      triage:"டிரியாஜ்",medications:"மருந்துகள்",history:"வரலாறு",demoCases:"டெமோ",about:"பற்றி",clinical:"மருத்துவ",info:"தகவல்",aiEngine:"AI இயந்திரம்",appLanguage:"பயன்பாட்டு மொழி",signIn:"உள்நுழை",signOut:"வெளியேறு",startTriageAnalysis:"பகுப்பாய்வு தொடங்கு",patientAudio:"நோயாளி ஆடியோ",photo:"படம்",optional:"விருப்பத்திற்கு",clinicalRecord:"மருத்துவ பதிவு",patientInstructions:"நோயாளி வழிமுறைகள்",chiefComplaint:"முக்கிய புகார்",symptoms:"அறிகுறிகள்",urgency:"அவசரம்",medication:"மருந்து",recommendedAction:"பரிந்துரைக்கப்பட்ட நடவடிக்கை",confidence:"நம்பகத்தன்மை",detectedLanguage:"கண்டறியப்பட்ட மொழி",analyzing:"Gemma 4 E4B பகுப்பாய்கிறது…",export:"ஏற்றுமதி",recordAudio:"ஆடியோ பதிவு",stopRecording:"நிறுத்து",allProcessingLocal:"அனைத்து செயலாக்கமும் Ollama மூலம் உள்ளூரில். தரவு வெளியேறாது.",medicationWarning:"மருந்து எச்சரிக்கை",medicationMismatch:"மருந்து பொருந்தவில்லை",patient:"நோயாளி",clinician:"மருத்துவர்",typeSymptoms:"அறிகுறிகளை தட்டச்சு செய்",clearAudio:"ஆடியோ அழி",clearImage:"படம் அழி",ollamaReady:"Gemma 4 E4B தயார்",ollamaNotFound:"மாதிரி கிடைக்கவில்லை — ollama pull gemma4:e4b",ollamaOffline:"Ollama இல்லை — தொடங்கி: ollama pull gemma4:e4b",patientDetails:"நோயாளி விவரங்கள்",patientName:"நோயாளி பெயர் / ID",location:"இடம் / கிளினிக்",clinicalNotes:"மருத்துவ குறிப்புகள்",uploadAudio:"ஆடியோ பதிவேற்று",uploadPhoto:"படம் பதிவேற்று",audioSubtitle:"Gemma 4 — சொல்லெழுத்து",locationPlaceholder:"எ.கா. கிராம மருத்துவமனை A",howItWorks:"எவ்வாறு செயல்படுகிறது",keyFeatures:"முக்கிய அம்சங்கள்",startATriage:"டிரியாஜ் தொடங்கு",input:"உள்ளீடு",extract:"பிரி",verify:"சரிபார்",record:"பதிவு",multilingualAI:"35+ மொழிகள்",localProcessing:"உள்ளூர் செயலாக்கம்",safetyCheck:"பாதுகாப்பு சரிபார்ப்பு",clinicalRecords:"மருத்துவ பதிவுகள்",welcomeTo:"GemmaCare-க்கு வரவேற்கிறோம்",multimodalAnalysis:"பல-முறை பகுப்பாய்வு",safetyVerification:"பாதுகாப்பு சரிபார்ப்பு",multilingualSupport:"பல மொழி ஆதரவு",fastProcessing:"வேகமான செயலாக்கம்",ourMission:"எங்கள் நோக்கம்",missionText:"GemmaCare தொலைதூர சுகாதார ஊழியர்களுக்கு விரைவான மருத்துவ திரியாஜ் வழங்குகிறது.",importantDisclaimer:"முக்கியமான மறுப்பு",disclaimerText:"GemmaCare ஒரு மருத்துவ முடிவு ஆதரவு கருவி. இது தொழில்முறை மருத்துவ தீர்ப்புக்கு மாற்றாக இல்லை.",technicalDetails:"தொழில்நுட்ப விவரங்கள்",viewDemos:"டெமோ பார்",offlineCapable:"ஆஃப்லைன் செயல்படும்",offlineText:"குறைந்த இணைப்பில் வேலை செய்கிறது. தரவு சாதனத்தில் இருக்கும்.",
      takePhoto:"புகைப்படம் எடு",cameraSubtitle:"கேமரா திற — அனுமதி கோரும்",selectFromGallery:"கேலரியிலிருந்து தேர்ந்தெடு",capturePhoto:"புகைப்படம் எடு",retakePhoto:"மீண்டும் எடு",useThisPhoto:"இந்த படத்தை பயன்படுத்து",cameraAccessDenied:"கேமரா அணுகல் மறுக்கப்பட்டது. படம் பதிவேற்றவும்.",pointAtLabel:"மருந்து லேபிள் அல்லது காயத்தை நோக்கு",
      copyJSON:"JSON நகலெடு",
    };
    case "yo": return {
      triage:"Triage",medications:"Oogun",history:"Itan",demoCases:"Demo",about:"Nipa",clinical:"Ile-iwosan",info:"Alaye",aiEngine:"Ẹrọ AI",appLanguage:"Ede Ohun elo",signIn:"Wọle",signOut:"Jade",startTriageAnalysis:"Bẹrẹ Itupalẹ",patientAudio:"Ohun Alaisan",photo:"Fọto",optional:"Aṣayan",clinicalRecord:"Igbasilẹ Ile-iwosan",patientInstructions:"Itọsọna Alaisan",chiefComplaint:"Ẹdun Akọkọ",symptoms:"Awọn aami aisan",urgency:"Iyara",medication:"Oogun",recommendedAction:"Igbese ti a gba niyanju",confidence:"Igbẹkẹle",detectedLanguage:"Ede ti a rii",analyzing:"Gemma 4 E4B n ṣe itupalẹ…",export:"Okeere",recordAudio:"Gbasilẹ ohun",stopRecording:"Duro",allProcessingLocal:"Gbogbo itupalẹ wa ni inu ẹrọ rẹ. Ko si data ti o lọ jade.",medicationWarning:"Ikilọ Oogun",medicationMismatch:"Oogun Ko Baamu",patient:"Alaisan",clinician:"Dọkita",typeSymptoms:"Tẹ awọn aami aisan",clearAudio:"Pa ohun",clearImage:"Pa fọto",ollamaReady:"Gemma 4 E4B ṣetan",ollamaNotFound:"Awoṣe ko ri — ollama pull gemma4:e4b",ollamaOffline:"Ollama ko si — bẹrẹ lẹhinna: ollama pull gemma4:e4b",patientDetails:"Alaye Alaisan",patientName:"Orukọ / ID Alaisan",location:"Ipo / Ile-iwosan",clinicalNotes:"Awọn akọsilẹ ile-iwosan",uploadAudio:"Gbe ohun soke",uploadPhoto:"Gbe fọto soke",audioSubtitle:"Gemma 4 — gbigbasilẹ ohun abinibi",locationPlaceholder:"fun apẹẹrẹ Ile-iwosan Abule A",howItWorks:"Bii O Ṣe N Ṣiṣẹ",keyFeatures:"Awọn Ẹya Akọkọ",startATriage:"Bẹrẹ Triage",input:"Titẹ sii",extract:"Yọ jade",verify:"Ṣayẹwo",record:"Igbasilẹ",multilingualAI:"Ede 35+",localProcessing:"Itupalẹ Agbegbe",safetyCheck:"Ayẹwo Aabo",clinicalRecords:"Awọn Igbasilẹ",welcomeTo:"Kaabọ si GemmaCare",multimodalAnalysis:"Itupalẹ Ọna Pupọ",safetyVerification:"Ẹri Aabo",multilingualSupport:"Atilẹyin Ede Pupọ",fastProcessing:"Itupalẹ Iyara",ourMission:"Iṣẹ Apinfunni Wa",missionText:"GemmaCare ṣe iranlọwọ fun awọn oṣiṣẹ ilera ni awọn agbegbe jijinna pẹlu triage ile-iwosan iyara.",importantDisclaimer:"Ikilo Pataki",disclaimerText:"GemmaCare jẹ ohun elo atilẹyin ipinnu ile-iwosan. Kii ṣe arọpo fun idajọ iṣoogun ọjọgbọn.",technicalDetails:"Awọn Alaye Imọ-ẹrọ",viewDemos:"Wo Demo",offlineCapable:"Ṣiṣẹ Laisi Intanẹẹti",offlineText:"Ṣiṣẹ ni awọn agbegbe asopọ kekere. Gbogbo data wa ninu ẹrọ.",
      takePhoto:"Ya fọto",cameraSubtitle:"Ṣii kamẹra — béèrè igbanilaaye",selectFromGallery:"Yan lati inu ifihan",capturePhoto:"Ya fọto",retakePhoto:"Ya lẹẹkansi",useThisPhoto:"Lo fọto yii",cameraAccessDenied:"Wọle sí kamẹra kọ. Jọwọ gbe fọto soke.",pointAtLabel:"Tọka si aami oogun tabi ọgbẹ",
      copyJSON:"Daakọ JSON",
    };
    case "te": return {
      triage:"ట్రియాజ్",medications:"మందులు",history:"చరిత్ర",demoCases:"డెమో",about:"గురించి",clinical:"క్లినికల్",info:"సమాచారం",aiEngine:"AI ఇంజిన్",appLanguage:"యాప్ భాష",signIn:"సైన్ ఇన్",signOut:"సైన్ అవుట్",startTriageAnalysis:"విశ్లేషణ ప్రారంభించు",patientAudio:"రోగి ఆడియో",photo:"ఫోటో",optional:"ఐచ్ఛికం",clinicalRecord:"క్లినికల్ రికార్డ్",patientInstructions:"రోగి సూచనలు",chiefComplaint:"ప్రధాన ఫిర్యాదు",symptoms:"లక్షణాలు",urgency:"అత్యవసరం",medication:"మందు",recommendedAction:"సిఫారసు చేసిన చర్య",confidence:"నమ్మకం",detectedLanguage:"గుర్తించిన భాష",analyzing:"Gemma 4 E4B విశ్లేషిస్తోంది…",export:"ఎగుమతి",recordAudio:"ఆడియో రికార్డ్",stopRecording:"ఆపు",allProcessingLocal:"అన్ని ప్రాసెసింగ్ Ollama ద్వారా స్థానికంగా. డేటా బయటకు వెళ్ళదు.",medicationWarning:"మందు హెచ్చరిక",medicationMismatch:"మందు సరిపోలలేదు",patient:"రోగి",clinician:"వైద్యుడు",typeSymptoms:"లక్షణాలు టైప్ చేయి",clearAudio:"ఆడియో తొలగించు",clearImage:"చిత్రం తొలగించు",ollamaReady:"Gemma 4 E4B సిద్ధంగా ఉంది",ollamaNotFound:"నమూనా కనుగొనబడలేదు — ollama pull gemma4:e4b",ollamaOffline:"Ollama అందుబాటులో లేదు — ప్రారంభించి: ollama pull gemma4:e4b",patientDetails:"రోగి వివరాలు",patientName:"రోగి పేరు / ID",location:"స్థానం / క్లినిక్",clinicalNotes:"క్లినికల్ నోట్స్",uploadAudio:"ఆడియో అప్లోడ్",uploadPhoto:"ఫోటో అప్లోడ్",audioSubtitle:"Gemma 4 — స్థానిక ఆడియో ట్రాన్స్‌క్రిప్షన్",locationPlaceholder:"ఉదా. గ్రామ క్లినిక్ A",howItWorks:"ఇది ఎలా పని చేస్తుంది",keyFeatures:"ముఖ్య లక్షణాలు",startATriage:"ట్రియాజ్ ప్రారంభించు",input:"ఇన్పుట్",extract:"వేరు చేయి",verify:"ధృవీకరించు",record:"రికార్డ్",multilingualAI:"35+ భాషలు",localProcessing:"స్థానిక ప్రాసెసింగ్",safetyCheck:"భద్రతా తనిఖీ",clinicalRecords:"క్లినికల్ రికార్డులు",welcomeTo:"GemmaCare కి స్వాగతం",multimodalAnalysis:"మల్టీమోడల్ విశ్లేషణ",safetyVerification:"భద్రతా ధృవీకరణ",multilingualSupport:"బహుభాషా మద్దతు",fastProcessing:"వేగవంతమైన ప్రాసెసింగ్",ourMission:"మా లక్ష్యం",missionText:"GemmaCare మారుమూల ప్రాంతాల్లో ఆరోగ్య కార్యకర్తలకు వేగవంతమైన క్లినికల్ ట్రియాజ్ అందిస్తుంది.",importantDisclaimer:"ముఖ్యమైన నిరాకరణ",disclaimerText:"GemmaCare ఒక క్లినికల్ నిర్ణయ సహాయ సాధనం. ఇది వృత్తిపరమైన వైద్య తీర్పుకు ప్రత్యామ్నాయం కాదు.",technicalDetails:"సాంకేతిక వివరాలు",viewDemos:"డెమోలు చూడు",offlineCapable:"ఆఫ్‌లైన్‌లో పని చేస్తుంది",offlineText:"తక్కువ కనెక్టివిటీలో పని చేస్తుంది. డేటా పరికరంలో ఉంటుంది.",
      takePhoto:"ఫోటో తీయండి",cameraSubtitle:"కెమెరా తెరవండి — అనుమతి అడుగుతుంది",selectFromGallery:"గ్యాలరీ నుండి ఎంచుకోండి",capturePhoto:"ఫోటో క్యాప్చర్ చేయండి",retakePhoto:"మళ్ళీ తీయండి",useThisPhoto:"ఈ ఫోటో వాడండి",cameraAccessDenied:"కెమెరా యాక్సెస్ నిరాకరించబడింది. దయచేసి ఫోటో అప్లోడ్ చేయండి.",pointAtLabel:"మందు లేబుల్ లేదా గాయంపైకి చూపండి",
      copyJSON:"JSON కాపీ చేయి",
    };
    default: return {
      triage:"Triage",medications:"Medications",history:"History",demoCases:"Demo Cases",about:"About",
      clinical:"Clinical",info:"Info",aiEngine:"AI Engine",appLanguage:"App Language",
      signIn:"Sign In",signOut:"Sign Out",newTriage:"New Triage",startTriageAnalysis:"Start Triage Analysis",
      patientAudio:"Patient Audio",photo:"Photo",optional:"Optional",clinicalRecord:"Clinical Record",
      patientInstructions:"Patient Instructions",chiefComplaint:"Chief Complaint",symptoms:"Symptoms",
      urgency:"Urgency",medication:"Medication",recommendedAction:"Recommended Action",
      confidence:"Confidence",detectedLanguage:"Detected Language",analyzing:"Gemma 4 E4B Analyzing…",
      allProcessingLocal:"All processing runs locally via Ollama. No data leaves your device.",
      medicationWarning:"Medication Warning",medicationMismatch:"Medication Mismatch",
      patient:"patient",clinician:"clinician",typeSymptoms:"Type Symptoms",
      clearAudio:"Clear Audio",clearImage:"Clear Image",
      ollamaReady:"Gemma 4 E4B ready",ollamaNotFound:"Model not found — run: ollama pull gemma4:e4b",
      ollamaOffline:"Ollama not reachable — start Ollama then run: ollama pull gemma4:e4b",

      welcomeTo:"Welcome to GemmaCare",
      multimodalAnalysis:"Multimodal Analysis",
      safetyVerification:"Safety Verification",
      multilingualSupport:"Multilingual Support",
      fastProcessing:"Fast Processing",
      ourMission:"Our Mission",
      missionText:"GemmaCare assists healthcare workers in remote settings with rapid multimodal clinical triage.",
      importantDisclaimer:"Important Disclaimer",
      disclaimerText:"GemmaCare is a clinical decision support tool. It is not a substitute for professional medical judgment. All decisions must be made by qualified healthcare professionals.",
      technicalDetails:"Technical Details",
      viewDemos:"View Demos",
      offlineCapable:"Offline Capable",
      offlineText:"Works in low-connectivity environments. All data stays on device.",
      howItWorks:"How It Works",keyFeatures:"Key Features",startATriage:"Start a Triage",
      input:"Input",extract:"Extract",verify:"Verify",record:"Record",
      multilingualAI:"35+ Languages",localProcessing:"Local Processing",safetyCheck:"Safety Check",clinicalRecords:"Clinical Records",
      patientDetails:"Patient Details",patientName:"Patient Name / ID",location:"Location / Clinic",clinicalNotes:"Clinical Notes",uploadAudio:"Click to upload audio",uploadPhoto:"Click to upload photo",audioSubtitle:"Gemma 4 — native audio transcription",locationPlaceholder:"e.g. Village Clinic A",
      takePhoto:"Take Photo",cameraSubtitle:"Opens camera — requests permission",selectFromGallery:"Select from gallery",capturePhoto:"Capture Photo",retakePhoto:"Retake",useThisPhoto:"Use This Photo",cameraAccessDenied:"Camera access denied. Please upload a photo instead.",pointAtLabel:"Point at medication label or wound",
      copyJSON:"Copy JSON",export:"Export",recordAudio:"Record Audio",stopRecording:"Stop",
    };
  }
}

interface LanguageContextType {
  uiLang: LanguageCode; setUiLang: (lang: LanguageCode) => void;
  langName: string; nativeName: string;
  theme: Theme; toggleTheme: () => void;
  t: UIStrings;
}

const LanguageContext = createContext<LanguageContextType>({
  uiLang: "en", setUiLang: () => {},
  langName: "English", nativeName: "English",
  theme: "dark", toggleTheme: () => {},
  t: getStrings("en"),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [uiLang, setUiLangState] = useState<LanguageCode>(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return (s && s in SUPPORTED_LANGUAGES) ? s as LanguageCode : "en";
  });
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem(THEME_KEY) as Theme) ?? "dark"
  );
  const [t, setT] = useState<UIStrings>(() => getStrings(uiLang));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setUiLang = (lang: LanguageCode) => {
    setUiLangState(lang);
    setT(getStrings(lang));
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");
  const info = SUPPORTED_LANGUAGES[uiLang] as any;

  return (
    <LanguageContext.Provider value={{
      uiLang, setUiLang,
      langName: info?.name ?? "English",
      nativeName: info?.nativeName ?? "English",
      theme, toggleTheme, t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
