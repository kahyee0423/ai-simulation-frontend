export type SupportedLanguage = "auto" | "Chinese" | "English" | "Spanish" | "French" | "German" | "Japanese";

export interface Translations {
  appTitle: string;
  poweredBy: string;
  heroTitle: string;
  heroSubtitle: string;
  inputPlaceholder: string;
  launchAgent: string;
  running: string;
  pythonIde: string;
  terminalOutput: string;
  dragToUndock: string;
  trialErrorLog: string;
  executingSandbox: string;
  noStdout: string;
  copy: string;
  copied: string;
  generatingScript: string;
  readyForScript: string;
  researchReport: string;
  exportPdf: string;
  ready: string;
  runningPipeline: string;
  pendingAnalysis: string;
  waitingForTrial: string;
  parsingScenarioStatus: string;
  planningStatus: string;
  criticReviewingStatus: string;
  simulatingStatus: string;
  validatingResultsStatus: string;
  analyzingStatus: string;
  simSpecTitle: string;
  specDomain: string;
  specMethodology: string;
  specObjective: string;
  specTimeHorizon: string;
  specRuns: string;
  specEntities: string;
  specOutcomes: string;
  specNoData: string;
  specParsing: string;
  hypoTitle: string;
  hypoBayesianBadge: string;
  hypoMultiBranchBadge: string;
  hypoUpdating: string;
  hypoNoData: string;
  hypoDominant: string;
  hypoPlausible: string;
  hypoLowProb: string;
  hypoExcluded: string;
  hypoEvidenceApplied: string;
  statsTitle: string;
  statsCriticApproved: string;
  statsCriticIssues: string;
  statsPythonComputed: string;
  statsComputing: string;
  samplePrompts: Array<{ label: string; prompt: string }>;
}

export function detectPromptLanguage(text: string): string {
  if (!text) return "English";
  const trimmed = text.trim();

  if (/[\u4e00-\u9fff]/.test(trimmed)) {
    return "Chinese";
  }
  if (/[\u3040-\u30ff]/.test(trimmed)) {
    return "Japanese";
  }
  if (/[\uac00-\ud7af]/.test(trimmed)) {
    return "Korean";
  }
  if (/[\u0400-\u04ff]/.test(trimmed)) {
    return "Russian";
  }
  if (/[\u0600-\u06ff]/.test(trimmed)) {
    return "Arabic";
  }

  const lower = trimmed.toLowerCase();
  const spanishMarkers = [" el ", " la ", " los ", " las ", " de ", " en ", " que ", " por ", " para ", " con ", "simular", "simulación"];
  if (spanishMarkers.filter(m => lower.includes(m)).length >= 2) return "Spanish";

  const frenchMarkers = [" le ", " la ", " les ", " des ", " du ", " de ", " en ", " pour ", " avec ", "simuler", "simulation"];
  if (frenchMarkers.filter(m => lower.includes(m)).length >= 2) return "French";

  const germanMarkers = [" der ", " die ", " das ", " und ", " in ", " von ", " mit ", "simulieren", "simulation"];
  if (germanMarkers.filter(m => lower.includes(m)).length >= 2) return "German";

  return "English";
}

export const TRANSLATIONS: Record<string, Translations> = {
  English: {
    appTitle: "AI Simulation Laboratory",
    poweredBy: "Powered by Gemini & LangGraph",
    heroTitle: "Assumption-Aware Simulation",
    heroSubtitle: "Transform natural language scenarios into rigorous, multi-branch scientific simulation models with explicit assumption provenance, Bayesian hypothesis updating, parameter sensitivity sweeps and Monte Carlo uncertainty quantification.",
    inputPlaceholder: "e.g., Simulate 50 delivery drones navigating through a 10x10 city grid in rainy weather...",
    launchAgent: "Launch Agent",
    running: "Running...",
    pythonIde: "Python IDE",
    terminalOutput: "Terminal Output",
    dragToUndock: "(Drag header to undock)",
    trialErrorLog: "Trial Error Log",
    executingSandbox: "Executing simulation sandbox...",
    noStdout: "No stdout output yet.",
    copy: "Copy",
    copied: "Copied!",
    generatingScript: "# Generating simulation script...",
    readyForScript: "# Ready for execution script...",
    researchReport: "Research Report",
    exportPdf: "Export PDF",
    ready: "Ready",
    runningPipeline: "Running pipeline...",
    pendingAnalysis: "Pending Analysis...",
    waitingForTrial: "Waiting for simulation trial to complete...",
    parsingScenarioStatus: "Parsing scenario...",
    planningStatus: "Planning...",
    criticReviewingStatus: "Critic reviewing...",
    simulatingStatus: "Simulating...",
    validatingResultsStatus: "Validating results...",
    analyzingStatus: "Analyzing...",
    simSpecTitle: "Simulation Specification",
    specDomain: "Domain",
    specMethodology: "Methodology",
    specObjective: "Objective",
    specTimeHorizon: "Time Horizon",
    specRuns: "Simulation Runs",
    specEntities: "Entities",
    specOutcomes: "Outcome Metrics",
    specNoData: "No specification available yet.",
    specParsing: "Parsing scenario...",
    hypoTitle: "Hypothesis Analysis",
    hypoBayesianBadge: "Bayesian",
    hypoMultiBranchBadge: "Multi-branch",
    hypoUpdating: "Updating Bayesian hypotheses...",
    hypoNoData: "No hypothesis data available.",
    hypoDominant: "Dominant",
    hypoPlausible: "Plausible",
    hypoLowProb: "Low Prob.",
    hypoExcluded: "Excluded",
    hypoEvidenceApplied: "evidence item(s) applied",
    statsTitle: "Statistical Analysis",
    statsCriticApproved: "Critic Approved",
    statsCriticIssues: "Critic Issues",
    statsPythonComputed: "Python-computed",
    statsComputing: "Computing statistics...",
    samplePrompts: [
      {
        label: "Drone Delivery Grid",
        prompt: "Simulate 50 delivery drones navigating through a 10x10 city grid with battery constraints, dynamic obstacle collision risks, and delivery time optimization over 100 trials."
      },
      {
        label: "Viral Market Adoption",
        prompt: "Model the diffusion of a new SaaS product across 10,000 corporate users using Bass diffusion dynamics, word-of-mouth coefficients, and competitor churn rate."
      },
      {
        label: "Hospital Emergency Room",
        prompt: "Simulate hospital ER patient triage and queueing dynamics under a sudden 40% surge in emergency arrivals with triage priority queues and bed capacity limits."
      }
    ]
  },
  Chinese: {
    appTitle: "AI 仿真模拟实验室",
    poweredBy: "由 Gemini & LangGraph 驱动",
    heroTitle: "假设显式化与不确定性量化推演系统",
    heroSubtitle: "将自然语言情景转化为严谨的多分枝科学推演模型，集成假设来源追踪、贝叶斯假设更新、参数敏感性扫描及伯努利/蒙特卡洛抽样不确定性量化。",
    inputPlaceholder: "例如：模拟50架外卖无人机在暴雨天气下的10x10城市网格配送，评估避障碰撞概率与准时送达率（运行100轮）...",
    launchAgent: "启动智能体",
    running: "运行中...",
    pythonIde: "Python IDE",
    terminalOutput: "终端输出",
    dragToUndock: "（拖拽标题栏可分离）",
    trialErrorLog: "试验错误日志",
    executingSandbox: "正在模拟沙箱中执行代码...",
    noStdout: "暂无标准输出。",
    copy: "复制",
    copied: "已复制!",
    generatingScript: "# 正在生成模拟脚本...",
    readyForScript: "# 等待生成执行脚本...",
    researchReport: "研究报告",
    exportPdf: "导出 PDF",
    ready: "就绪",
    runningPipeline: "正在运行流水线...",
    pendingAnalysis: "等待分析...",
    waitingForTrial: "等待模拟实验完成...",
    parsingScenarioStatus: "正在解析场景...",
    planningStatus: "正在规划模拟...",
    criticReviewingStatus: "模型审查中...",
    simulatingStatus: "正在执行模拟...",
    validatingResultsStatus: "正在校验结果...",
    analyzingStatus: "正在生成报告...",
    simSpecTitle: "模拟规范",
    specDomain: "领域",
    specMethodology: "方法论",
    specObjective: "目标",
    specTimeHorizon: "时间跨度",
    specRuns: "模拟轮次",
    specEntities: "实体",
    specOutcomes: "输出指标",
    specNoData: "暂无模拟规范数据。",
    specParsing: "正在解析场景...",
    hypoTitle: "假设分析",
    hypoBayesianBadge: "贝叶斯更新",
    hypoMultiBranchBadge: "多分枝因果",
    hypoUpdating: "正在更新贝叶斯假设概率...",
    hypoNoData: "暂无假设数据。",
    hypoDominant: "主导假设",
    hypoPlausible: "合理假设",
    hypoLowProb: "低概率",
    hypoExcluded: "已排除",
    hypoEvidenceApplied: "条证据已应用",
    statsTitle: "统计分析",
    statsCriticApproved: "审查通过",
    statsCriticIssues: "审查存疑",
    statsPythonComputed: "Python计算",
    statsComputing: "正在计算统计数据...",
    samplePrompts: [
      {
        label: "城市无人机配送",
        prompt: "模拟50架外卖配送无人机在10x10城市网格中的导航与避障情况，包含电池消耗限制、暴雨天气能见度降低以及送达率统计（模拟100轮试验）。"
      },
      {
        label: "病毒式产品裂变",
        prompt: "使用巴斯传播模型（Bass Diffusion）模拟一款新型SaaS应用在10000名企业用户中的裂变扩散、口碑效应系数与竞品流失率。"
      },
      {
        label: "医院急诊排队分诊",
        prompt: "模拟突发公共卫生事件下医院急诊室在患者激增40%时的分诊排队动态、病床容量限制以及医生抢救等待时间分布。"
      }
    ]
  },
  Spanish: {
    appTitle: "Laboratorio de Simulación IA",
    poweredBy: "Impulsado por Gemini & LangGraph",
    heroTitle: "Motor Universal de Simulación Científica IA",
    heroSubtitle: "Transforme escenarios en lenguaje natural en modelos de simulación científica rigurosos con actualización de hipótesis bayesianas y ejecución aislada.",
    inputPlaceholder: "ej., Simular 50 drones de entrega navegando en una cuadrícula urbana de 10x10 en clima lluvioso...",
    launchAgent: "Iniciar Agente",
    running: "Ejecutando...",
    pythonIde: "IDE Python",
    terminalOutput: "Salida del Terminal",
    dragToUndock: "(Arrastra para desacoplar)",
    trialErrorLog: "Registro de Errores",
    executingSandbox: "Ejecutando en el sandbox de simulación...",
    noStdout: "Aún no hay salida estándar.",
    copy: "Copiar",
    copied: "¡Copiado!",
    generatingScript: "# Generando script de simulación...",
    readyForScript: "# Listo para el script de ejecución...",
    researchReport: "Informe de Investigación",
    exportPdf: "Exportar PDF",
    ready: "Listo",
    runningPipeline: "Ejecutando canalización...",
    pendingAnalysis: "Análisis pendiente...",
    waitingForTrial: "Esperando a que concluya la prueba...",
    parsingScenarioStatus: "Analizando escenario...",
    planningStatus: "Planificando...",
    criticReviewingStatus: "Revisión del crítico...",
    simulatingStatus: "Simulando...",
    validatingResultsStatus: "Validando resultados...",
    analyzingStatus: "Analizando...",
    simSpecTitle: "Especificación de Simulación",
    specDomain: "Dominio",
    specMethodology: "Metodología",
    specObjective: "Objetivo",
    specTimeHorizon: "Horizonte Temporal",
    specRuns: "Ejecuciones",
    specEntities: "Entidades",
    specOutcomes: "Métricas de Resultado",
    specNoData: "Sin especificación disponible todavía.",
    specParsing: "Analizando escenario...",
    hypoTitle: "Análisis de Hipótesis",
    hypoBayesianBadge: "Bayesiano",
    hypoMultiBranchBadge: "Múltiples ramas",
    hypoUpdating: "Actualizando hipótesis bayesianas...",
    hypoNoData: "Sin datos de hipótesis.",
    hypoDominant: "Dominante",
    hypoPlausible: "Plausible",
    hypoLowProb: "Baja Prob.",
    hypoExcluded: "Excluida",
    hypoEvidenceApplied: "elemento(s) de evidencia aplicado(s)",
    statsTitle: "Análisis Estadístico",
    statsCriticApproved: "Crítico Aprobado",
    statsCriticIssues: "Problemas de Crítica",
    statsPythonComputed: "Calculado con Python",
    statsComputing: "Calculando estadísticas...",
    samplePrompts: [
      {
        label: "Entrega con Drones",
        prompt: "Simular 50 drones de entrega navegando en una cuadrícula urbana de 10x10 con limitaciones de batería, riesgos de colisión y optimización de tiempo."
      }
    ]
  },
  French: {
    appTitle: "Laboratoire de Simulation IA",
    poweredBy: "Propulsé par Gemini & LangGraph",
    heroTitle: "Moteur Universel de Simulation Scientifique IA",
    heroSubtitle: "Transformez des scénarios en langage naturel en modèles de simulation scientifique rigoureux avec mise à jour bayésienne des hypothèses.",
    inputPlaceholder: "ex., Simuler 50 drones de livraison dans une grille urbaine 10x10 par temps pluvieux...",
    launchAgent: "Lancer l'Agent",
    running: "Exécution...",
    pythonIde: "IDE Python",
    terminalOutput: "Sortie Terminal",
    dragToUndock: "(Glisser pour détacher)",
    trialErrorLog: "Journal des erreurs",
    executingSandbox: "Exécution dans le bac à sable...",
    noStdout: "Aucune sortie standard pour le moment.",
    copy: "Copier",
    copied: "Copié !",
    generatingScript: "# Génération du script de simulation...",
    readyForScript: "# Prêt pour le script...",
    researchReport: "Rapport de Recherche",
    exportPdf: "Exporter en PDF",
    ready: "Prêt",
    runningPipeline: "Exécution en cours...",
    pendingAnalysis: "Analyse en attente...",
    waitingForTrial: "En attente de la simulation...",
    parsingScenarioStatus: "Analyse du scénario...",
    planningStatus: "Planification...",
    criticReviewingStatus: "Revue critique...",
    simulatingStatus: "Simulation en cours...",
    validatingResultsStatus: "Validation des résultats...",
    analyzingStatus: "Analyse des données...",
    simSpecTitle: "Spécification de la Simulation",
    specDomain: "Domaine",
    specMethodology: "Méthodologie",
    specObjective: "Objectif",
    specTimeHorizon: "Horizon Temporel",
    specRuns: "Exécutions",
    specEntities: "Entités",
    specOutcomes: "Métriques de Sortie",
    specNoData: "Aucune spécification disponible.",
    specParsing: "Analyse du scénario...",
    hypoTitle: "Analyse des Hypothèses",
    hypoBayesianBadge: "Bayésien",
    hypoMultiBranchBadge: "Multi-branches",
    hypoUpdating: "Mise à jour des hypothèses bayésiennes...",
    hypoNoData: "Aucune donnée d'hypothèse.",
    hypoDominant: "Dominante",
    hypoPlausible: "Plausible",
    hypoLowProb: "Faible Prob.",
    hypoExcluded: "Exclue",
    hypoEvidenceApplied: "élément(s) de preuve appliqué(s)",
    statsTitle: "Analyse Statistique",
    statsCriticApproved: "Critique Approuvé",
    statsCriticIssues: "Problèmes Critiqués",
    statsPythonComputed: "Calculé par Python",
    statsComputing: "Calcul des statistiques...",
    samplePrompts: [
      {
        label: "Livraison par Drones",
        prompt: "Simuler 50 drones de livraison dans une grille urbaine 10x10 avec contraintes de batterie et risques de collision sur 100 essais."
      }
    ]
  },
  German: {
    appTitle: "KI-Simulationslabor",
    poweredBy: "Bereitgestellt von Gemini & LangGraph",
    heroTitle: "Universelle wissenschaftliche KI-Simulationsengine",
    heroSubtitle: "Verwandeln Sie natürlichsprachliche Szenarien in wissenschaftliche Simulationsmodelle mit Bayes'scher Hypothesenaktualisierung.",
    inputPlaceholder: "z. B. Simulieren Sie 50 Lieferdrohnen in einem 10x10-Stadtraster bei Regenwetter...",
    launchAgent: "Agent starten",
    running: "Wird ausgeführt...",
    pythonIde: "Python-IDE",
    terminalOutput: "Terminal-Ausgabe",
    dragToUndock: "(Ziehen zum Abdocken)",
    trialErrorLog: "Fehlerprotokoll",
    executingSandbox: "Ausführung in der Sandbox...",
    noStdout: "Noch keine Ausgabe vorhanden.",
    copy: "Kopieren",
    copied: "Kopiert!",
    generatingScript: "# Simulationsskript wird generiert...",
    readyForScript: "# Bereit für Ausführungsskript...",
    researchReport: "Forschungsbericht",
    exportPdf: "PDF exportieren",
    ready: "Bereit",
    runningPipeline: "Pipeline wird ausgeführt...",
    pendingAnalysis: "Analyse ausstehend...",
    waitingForTrial: "Warten auf Abschluss der Simulation...",
    parsingScenarioStatus: "Szenario wird analysiert...",
    planningStatus: "Planung läuft...",
    criticReviewingStatus: "Kritiker-Prüfung...",
    simulatingStatus: "Simulation läuft...",
    validatingResultsStatus: "Ergebnisse werden validiert...",
    analyzingStatus: "Analyse läuft...",
    simSpecTitle: "Simulationsspezifikation",
    specDomain: "Bereich",
    specMethodology: "Methodik",
    specObjective: "Ziel",
    specTimeHorizon: "Zeithorizont",
    specRuns: "Durchläufe",
    specEntities: "Entitäten",
    specOutcomes: "Ergebnismetriken",
    specNoData: "Noch keine Spezifikation verfügbar.",
    specParsing: "Szenario wird analysiert...",
    hypoTitle: "Hypothesenanalyse",
    hypoBayesianBadge: "Bayes'sch",
    hypoMultiBranchBadge: "Mehrzweigig",
    hypoUpdating: "Bayes'sche Hypothesen werden aktualisiert...",
    hypoNoData: "Keine Hypothesendaten verfügbar.",
    hypoDominant: "Dominant",
    hypoPlausible: "Plausibel",
    hypoLowProb: "Geringe Wsk.",
    hypoExcluded: "Ausgeschlossen",
    hypoEvidenceApplied: "Beweiselement(e) angewendet",
    statsTitle: "Statistische Analyse",
    statsCriticApproved: "Vom Kritiker genehmigt",
    statsCriticIssues: "Kritikpunkte festgestellt",
    statsPythonComputed: "Python-berechnet",
    statsComputing: "Statistiken werden berechnet...",
    samplePrompts: [
      {
        label: "Drohnenlieferung",
        prompt: "Simulieren Sie 50 Lieferdrohnen in einem 10x10-Stadtraster mit Batterieeinschränkungen und Kollisionsrisiken."
      }
    ]
  },
  Japanese: {
    appTitle: "AI シミュレーション研究所",
    poweredBy: "Gemini & LangGraph 搭載",
    heroTitle: "汎用 AI 科学シミュレーションエンジン",
    heroSubtitle: "自然言語シナリオを、ベイズ仮説更新、自動サンドボックス実行、ピアレビュー批評を備えた厳密な科学シミュレーションモデルに変換します。",
    inputPlaceholder: "例：雨天時の10x10都市グリッドで50機の配送ドローンの配送効率と衝突回避をシミュレーション（100回試行）...",
    launchAgent: "エージェント起動",
    running: "実行中...",
    pythonIde: "Python IDE",
    terminalOutput: "ターミナル出力",
    dragToUndock: "（ヘッダーをドラッグして分離）",
    trialErrorLog: "エラーログ",
    executingSandbox: "シミュレーションサンドボックスで実行中...",
    noStdout: "標準出力はまだありません。",
    copy: "コピー",
    copied: "コピー完了!",
    generatingScript: "# シミュレーションスクリプトを生成中...",
    readyForScript: "# 実行スクリプト待機中...",
    researchReport: "研究レポート",
    exportPdf: "PDFエクスポート",
    ready: "準備完了",
    runningPipeline: "パイプライン実行中...",
    pendingAnalysis: "分析待機中...",
    waitingForTrial: "シミュレーション完了を待機中...",
    parsingScenarioStatus: "シナリオ解析中...",
    planningStatus: "計画策定中...",
    criticReviewingStatus: "モデル批評中...",
    simulatingStatus: "シミュレーション実行中...",
    validatingResultsStatus: "結果検証中...",
    analyzingStatus: "レポート生成中...",
    simSpecTitle: "シミュレーション仕様",
    specDomain: "ドメイン",
    specMethodology: "方法論",
    specObjective: "目的",
    specTimeHorizon: "期間",
    specRuns: "試行回数",
    specEntities: "エンティティ",
    specOutcomes: "成果指標",
    specNoData: "仕様データはまだありません。",
    specParsing: "シナリオ解析中...",
    hypoTitle: "仮説分析",
    hypoBayesianBadge: "ベイズ更新",
    hypoMultiBranchBadge: "マルチブランチ",
    hypoUpdating: "ベイズ仮説を更新中...",
    hypoNoData: "仮説データはありません。",
    hypoDominant: "主導的仮説",
    hypoPlausible: "妥当",
    hypoLowProb: "低確率",
    hypoExcluded: "除外",
    hypoEvidenceApplied: "件の証拠を適用",
    statsTitle: "統計分析",
    statsCriticApproved: "批評承認済",
    statsCriticIssues: "批評指摘あり",
    statsPythonComputed: "Python計算",
    statsComputing: "統計を計算中...",
    samplePrompts: [
      {
        label: "都市型ドローン配送",
        prompt: "10x10の都市グリッド内における50機の配送ドローンのバッテリー制約と障害物衝突リスクを100試行でシミュレーション。"
      }
    ]
  }
};

export function getTranslations(lang: string): Translations {
  if (lang && TRANSLATIONS[lang]) {
    return TRANSLATIONS[lang];
  }
  const lower = (lang || "").toLowerCase();
  if (lower.startsWith("zh") || lower.includes("chinese") || lower.includes("中文")) return TRANSLATIONS.Chinese;
  if (lower.startsWith("es") || lower.includes("spanish")) return TRANSLATIONS.Spanish;
  if (lower.startsWith("fr") || lower.includes("french")) return TRANSLATIONS.French;
  if (lower.startsWith("de") || lower.includes("german")) return TRANSLATIONS.German;
  if (lower.startsWith("ja") || lower.includes("japanese")) return TRANSLATIONS.Japanese;
  return TRANSLATIONS.English;
}
