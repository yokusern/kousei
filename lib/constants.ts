// 定型表現のパターン
// AIが生成しやすい、一般的すぎる表現

export const TEMPLATE_PATTERNS = [
  "柔軟に対応",
  "高品質",
  "丁寧に対応",
  "お力になれれば幸いです",
  "まとめると",
  "重要です",
  "対応できます",
  "対応可能です",
  "価値を提供",
  "最適です",
  "効率的",
  "多くの方",
  "幅広い",
  "様々な",
  "これを機に",
  "この度",
] as const;

// 抽象的な言葉
// 具体性に欠ける、概念的すぎる表現
export const ABSTRACT_WORDS = [
  "重要",
  "価値",
  "最適",
  "高品質",
  "効率的",
  "柔軟",
  "丁寧",
  "迅速",
  "適切",
  "課題解決",
  "成果",
  "強み",
  "弱み",
  "特徴",
  "メリット",
  "デメリット",
  "ポテンシャル",
  "シナジー",
  "イノベーション",
  "パラダイム",
] as const;

// 文末のパターン
// 単調な文末はAIっぽさのサイン
// TODO: 将来的には自然言語処理で検出

export const SENTENCE_ENDINGS = [
  "です。",
  "ます。",
  "でした。",
  "ません。",
  "だと思います。",
  "と考えます。",
  "できます。",
  "することができます。",
] as const;

// スコアのしきい値
export const SCORE_THRESHOLDS = {
  HIGH: 71,
  MEDIUM: 31,
} as const;

// 履歴保存上限
export const HISTORY_LIMIT = 5;

// ハイライト表示上限
export const MAX_HIGHLIGHTS = 5;

// 1文の最小文字数（短すぎる文は解析対象外）
export const MIN_SENTENCE_LENGTH = 10;

// 具体性を判断するキーワード
export const SPECIFICITY_KEYWORDS = [
  "私",
  "以前",
  "実際に",
  "たとえば",
  "具体的には",
  "の場合",
  "とき",
  "たため",
] as const;

// LLM統合のための設定（将来実装）
export const LLM_CONFIG = {
  // 内容は環境変数から読み込む
  enabled: process.env.LLM_ENABLED === "true",
  provider: process.env.LLM_PROVIDER || "none",
  model: process.env.ANALYSIS_MODEL || "gpt-4o-mini",
  apiKey: process.env.LLM_API_KEY || "",
} as const;

// 解析モード
export const ANALYSIS_MODES = ["proposal", "note"] as const;

// モード別の表示名
export const MODE_LABELS = {
  proposal: "クラウドソーシング提案文",
  note: "Note記事",
} as const;

// モード別の説明文
export const MODE_DESCRIPTIONS = {
  proposal: "クライアントに信頼される提案文に整えます",
  note: "読者に共感される記事に整えます",
} as const;
