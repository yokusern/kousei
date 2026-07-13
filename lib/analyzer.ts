import type { AnalysisResult, Highlight } from "./types";

export interface AnalyzerOptions {
  templatePatterns?: string[];
  abstractWords?: string[];
  sentenceEndings?: string[];
}

export const DEFAULT_OPTIONS: AnalyzerOptions = {
  templatePatterns: [
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
  ],
  abstractWords: [
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
  ],
  sentenceEndings: ["です。", "ます。", "でした。", "ません。", "だと思います。", "と考えます。"],
};

interface SentenceChunk {
  text: string;
  start: number;
  end: number;
}

interface SentenceAnalysis {
  sentence: SentenceChunk;
  score: number;
  reasons: string[];
  hint: string;
}

/**
 * 文を分割して位置情報付きのチャンクを返す
 */
export function splitSentencesWithOffsets(text: string): SentenceChunk[] {
  const chunks: SentenceChunk[] = [];
  const regex = /[^。！？\n]+[。！？]?|\n+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    if (!raw.trim() || raw.trim() === "\n") continue;
    chunks.push({
      text: raw,
      start: match.index,
      end: match.index + raw.length,
    });
  }
  return chunks;
}

/**
 * 1文を解析してスコアと理由を返す
 */
export function analyzeSentence(
  sentence: SentenceChunk,
  fullText: string,
  options: AnalyzerOptions = DEFAULT_OPTIONS
): SentenceAnalysis | null {
  let score = 0;
  const reasons: string[] = [];
  let hint = "具体的な経験・数字・判断理由を1つ足すと、あなた自身の文に見えやすくなります。";

  // テンプレート表現チェック
  const templatePatterns = options.templatePatterns || DEFAULT_OPTIONS.templatePatterns;
  const templateHits = templatePatterns.filter((p) => sentence.text.includes(p));
  if (templateHits.length > 0) {
    score += 18 + templateHits.length * 6;
    reasons.push(`定型表現が含まれています（${templateHits.join(" / ")}）`);
    hint = "定型句をそのまま使う代わりに、「何を・どう対応したか」を具体的に書くと自然です。";
  }

  // 抽象語チェック
  const abstractWords = options.abstractWords || DEFAULT_OPTIONS.abstractWords;
  const abstractHits = abstractWords.filter((w) => sentence.text.includes(w));
  if (abstractHits.length >= 2) {
    score += 14 + abstractHits.length * 4;
    reasons.push(`抽象的な表現がやや多めです（${abstractHits.join(" / ")}）`);
    hint = "抽象語を減らして、作業内容・相手・結果を具体語に置き換えると人間味が出ます。";
  }

  // 文末の単調さチェック
  const sentenceEndings = options.sentenceEndings || DEFAULT_OPTIONS.sentenceEndings;
  const allSentences = splitSentencesWithOffsets(fullText);
  const endingCounts = new Map<string, number>();
  for (const s of allSentences) {
    for (const ending of sentenceEndings) {
      if (s.text.trim().endsWith(ending)) {
        endingCounts.set(ending, (endingCounts.get(ending) || 0) + 1);
      }
    }
  }

  for (const ending of sentenceEndings) {
    if (sentence.text.trim().endsWith(ending) && (endingCounts.get(ending) || 0) >= 3) {
      score += 12;
      reasons.push(`文末が単調です（${ending} が多い）`);
      hint = "文末表現を少し変えたり、短い一文を混ぜるとリズムが自然になります。";
      break;
    }
  }

  // 具体性チェック
  const hasSpecificity =
    /\d/.test(sentence.text) ||
    sentence.text.includes("私") ||
    sentence.text.includes("以前") ||
    sentence.text.includes("実際に") ||
    sentence.text.includes("たとえば") ||
    sentence.text.includes("具体的には");

  if (!hasSpecificity && sentence.text.length >= 25) {
    score += 10;
    reasons.push("具体例や個人的な文脈が少なく、一般論に見えやすいです");
    hint = "数字・経験・対象読者のどれか1つを足すと、あなたの文として伝わりやすくなります。";
  }

  // 繰り返し表現チェック
  const frequencyMap = new Map<string, number>();
  for (const pattern of templatePatterns) {
    const count = fullText.split(pattern).length - 1;
    if (count > 0) frequencyMap.set(pattern, count);
  }

  for (const [pattern, count] of frequencyMap) {
    if (count >= 2 && sentence.text.includes(pattern)) {
      score += 8;
      reasons.push(`同じ表現が文書内で繰り返されています（${pattern}）`);
      hint = "同じ言い回しの繰り返しを避けて、別の言葉や具体例に置き換えると単調さが減ります。";
      break;
    }
  }

  return score > 0 ? { sentence, score, reasons, hint } : null;
}

/**
 * サマリー文生成
 */
function buildSummary(score: number, highlightCount: number): string {
  if (score >= 75) {
    return `定型表現や抽象語がやや多く、全体として整いすぎた印象があります。特に気になる ${highlightCount} 箇所を見直すと、より自分の言葉に近づきます。`;
  }
  if (score >= 45) {
    return `一部にAIっぽく見えやすい表現があります。体験・数字・判断理由を少し足すと、自然さが上がりやすいです。`;
  }
  return `AIっぽさは比較的低めです。必要に応じて、少し具体例や背景を足すとさらに説得力が増します。`;
}

/**
 * 文章全体を解析
 * TODO: ここでLLM APIを呼び出すように改修予定
 * 現状はルールベースの簡易解析
 */
export function analyzeText(
  text: string,
  options: AnalyzerOptions = DEFAULT_OPTIONS
): AnalysisResult {
  const normalized = text.trim();
  const sentences = splitSentencesWithOffsets(normalized);

  if (sentences.length === 0) {
    return {
      id: crypto.randomUUID(),
      score: 0,
      summary: "解析できる文章がありませんでした。",
      highlights: [],
      analyzedAt: new Date().toISOString(),
      inputText: normalized,
    };
  }

  // 各文を解析
  const sentenceAnalyses: SentenceAnalysis[] = [];
  for (const sentence of sentences) {
    const analysis = analyzeSentence(sentence, normalized, options);
    if (analysis) {
      sentenceAnalyses.push(analysis);
    }
  }

  // 総スコア計算
  const totalScore = sentenceAnalyses.reduce((sum, a) => sum + a.score, 0);
  const normalizedScore = Math.min(
    Math.max(Math.round((totalScore / Math.max(sentences.length, 1)) * 1.4), 0),
    100
  );

  // 上位5件のハイライトを抽出
  const sorted = sentenceAnalyses.sort((a, b) => b.score - a.score).slice(0, 5);
  const highlights: Highlight[] = sorted.map((item) => ({
    text: item.sentence.text,
    start: item.sentence.start,
    end: item.sentence.end,
    reason: item.reasons.join(" / "),
    hint: item.hint,
  }));

  // サマリー生成
  const summary = buildSummary(normalizedScore, highlights.length);

  return {
    id: crypto.randomUUID(),
    score: normalizedScore,
    summary,
    highlights,
    analyzedAt: new Date().toISOString(),
    inputText: normalized,
  };
}
