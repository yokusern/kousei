import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, Highlight } from "@/lib/types";

export const runtime = "nodejs";
// Edge にしたい場合は以下に変更:
// export const runtime = "edge";

type SentenceChunk = {
  text: string;
  start: number;
  end: number;
};

const TEMPLATE_PATTERNS = [
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
];

const ABSTRACT_WORDS = [
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
];

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function splitSentencesWithOffsets(text: string): SentenceChunk[] {
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

function countPatternHits(text: string, patterns: string[]) {
  let count = 0;
  const hitPatterns: string[] = [];

  for (const pattern of patterns) {
    if (text.includes(pattern)) {
      count += 1;
      hitPatterns.push(pattern);
    }
  }

  return { count, hitPatterns };
}

function getSentenceEndingPattern(sentence: string) {
  const trimmed = sentence.trim();
  const endings = ["です。", "ます。", "でした。", "ません。", "だと思います。", "と考えます。"];
  for (const e of endings) {
    if (trimmed.endsWith(e)) return e;
  }
  return "";
}

function buildHighlight(sentence: SentenceChunk, reason: string, hint: string): Highlight {
  return {
    text: sentence.text,
    start: sentence.start,
    end: sentence.end,
    reason,
    hint,
  };
}

function buildSummary(score: number, highlightCount: number) {
  if (score >= 75) {
    return `定型表現や抽象語がやや多く、全体として整いすぎた印象があります。特に気になる ${highlightCount} 箇所を見直すと、より自分の言葉に近づきます。`;
  }
  if (score >= 45) {
    return `一部にAIっぽく見えやすい表現があります。体験・数字・判断理由を少し足すと、自然さが上がりやすいです。`;
  }
  return `AIっぽさは比較的低めです。必要に応じて、少し具体例や背景を足すとさらに説得力が増します。`;
}

function analyzeText(text: string): AnalysisResult {
  const normalized = text.trim();
  const sentences = splitSentencesWithOffsets(normalized);

  const frequencyMap = new Map<string, number>();
  for (const pattern of TEMPLATE_PATTERNS) {
    const count = normalized.split(pattern).length - 1;
    if (count > 0) frequencyMap.set(pattern, count);
  }

  const localFindings: Array<{ score: number; highlight: Highlight }> = [];

  let totalScore = 0;

  const endingCounts = new Map<string, number>();
  for (const s of sentences) {
    const ending = getSentenceEndingPattern(s.text);
    if (ending) {
      endingCounts.set(ending, (endingCounts.get(ending) ?? 0) + 1);
    }
  }

  for (const sentence of sentences) {
    let localScore = 0;
    const reasons: string[] = [];
    let hint = "具体的な経験・数字・判断理由を1つ足すと、あなた自身の文に見えやすくなります。";

    const { count: templateCount, hitPatterns } = countPatternHits(sentence.text, TEMPLATE_PATTERNS);
    if (templateCount > 0) {
      localScore += 18 + templateCount * 6;
      reasons.push(`定型表現が含まれています（${hitPatterns.join(" / ")}）`);
      hint = "定型句をそのまま使う代わりに、「何を・どう対応したか」を具体的に書くと自然です。";
    }

    const { count: abstractCount, hitPatterns: abstractHits } = countPatternHits(sentence.text, ABSTRACT_WORDS);
    if (abstractCount >= 2) {
      localScore += 14 + abstractCount * 4;
      reasons.push(`抽象的な表現がやや多めです（${abstractHits.join(" / ")}）`);
      hint = "抽象語を減らして、作業内容・相手・結果を具体語に置き換えると人間味が出ます。";
    }

    const ending = getSentenceEndingPattern(sentence.text);
    if (ending && (endingCounts.get(ending) ?? 0) >= 3) {
      localScore += 12;
      reasons.push(`文末が単調です（${ending} が多い）`);
      hint = "文末表現を少し変えたり、短い一文を混ぜるとリズムが自然になります。";
    }

    const hasSpecificity =
      /\d/.test(sentence.text) ||
      sentence.text.includes("私") ||
      sentence.text.includes("以前") ||
      sentence.text.includes("実際に") ||
      sentence.text.includes("たとえば") ||
      sentence.text.includes("具体的には");

    if (!hasSpecificity && sentence.text.length >= 25) {
      localScore += 10;
      reasons.push("具体例や個人的な文脈が少なく、一般論に見えやすいです");
      hint = "数字・経験・対象読者のどれか1つを足すと、あなたの文として伝わりやすくなります。";
    }

    for (const [pattern, count] of frequencyMap.entries()) {
      if (count >= 2 && sentence.text.includes(pattern)) {
        localScore += 8;
        reasons.push(`同じ表現が文書内で繰り返されています（${pattern}）`);
        hint = "同じ言い回しの繰り返しを避けて、別の言葉や具体例に置き換えると単調さが減ります。";
        break;
      }
    }

    if (localScore > 0) {
      localFindings.push({
        score: localScore,
        highlight: buildHighlight(
          sentence,
          reasons.join(" / "),
          hint
        ),
      });
    }

    totalScore += localScore;
  }

  // 全体スコアをざっくり 0-100 に正規化
  const normalizedScore = clamp(
    Math.round((totalScore / Math.max(sentences.length, 1)) * 1.4),
    0,
    100
  );

  const highlights = localFindings
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.highlight);

  // ここに LLM 呼び出しを入れる:
  // - highlights の各 sentence に対して
  // - より自然な reason/hint を生成する
  // - JSON 形式で上書きする
  //
  // 例:
  // const enrichedHighlights = await callLLMToRefineHighlights(highlights, normalized);

  return {
    id: crypto.randomUUID(),
    score: normalizedScore,
    summary: buildSummary(normalizedScore, highlights.length),
    highlights,
    analyzedAt: new Date().toISOString(),
    inputText: normalized,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const result = analyzeText(text);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Analyze API error:", error);

    return NextResponse.json(
      { error: "failed to analyze text" },
      { status: 500 }
    );
  }
}
