import type { Highlight, AnalysisMode } from "./types";

/**
 * LLM API設定
 */
const LLM_CONFIG = {
  apiUrl: process.env.LLM_API_URL || "https://api.anthropic.com/v1/messages",
  apiKey: process.env.LLM_API_KEY || "",
  model: process.env.LLM_MODEL || "claude-3-5-sonnet-20250620",
  enabled: process.env.LLM_ENABLED === "true",
  maxTokens: 4096,
  temperature: 0.3,
} as const;

/**
 * モード別のシステムプロンプト
 * TODO: 実際のモデルに合わせて調整
 */
const SYSTEM_PROMPTS: Record<AnalysisMode, string> = {
  proposal: `あなたは、クラウドソーシング提案文の改善アシスタントです。
文章中の「AIっぽく見えやすい箇所」を特定し、クライアントに信頼されやすい、具体的で信頼性の高い提案文にするためのアドバイスを返してください。
あなたの役割は「厳密なAI検出」ではなく、「人の手で書かれたような、信頼性の高い文章に仕上げるためのサポート」です。

出力は常にJSON形式で返してください。`,
  note: `あなたは、Note記事の執筆アシスタントです。
文章中の「AIっぽく見えやすい箇所」を特定し、読者に共感されやすい、個性的で心のこもった記事にするためのアドバイスを返してください。
あなたの役割は「厳密なAI検出」ではなく、「読者に響く、人間味のある文章に仕上げるためのサポート」です。

出力は常にJSON形式で返してください。`,
} as const;

/**
 * モード別のユーザープロンプトテンプレート
 */
const USER_PROMPT_TEMPLATES: Record<AnalysisMode, (text: string, highlights: Highlight[]) => string> = {
  proposal: (text, highlights) => `
以下のクラウドソーシング提案文を分析してください。

---
【提案文】
${text}
---

以下の${highlights.length}箇所は、AIが生成しやすい表現や、信頼性に欠ける可能性のある箇所です。
それぞれの箇所について、「なぜAIっぽく見えるのか」の理由と「どう直せば信頼性が高まるか」のヒントを、自然な日本語で返してください。

【分析対象の箇所】
${highlights.map((h, i) => `${i+1}. "${h.text}"`).join("\n")}

【出力形式】
各箇所について、以下のJSON配列で返してください：
[
  {
    "index": 1,
    "reason": "この箇所はAIっぽく見える理由（自然な日本語、40文字程度）",
    "hint": "信頼性を高めるための具体的な改善案（自然な日本語、60文字程度）"
  },
  ...
]

【注意点】
- 理由は「定型表現の使いすぎ」「抽象的すぎる」などの技術的な言葉は避けて、具体的に説明
- ヒントは「数字を入れて」「具体例を加えて」などの抽象的なアドバイスではなく、実行可能な具体的な提案
- 提案文としての信頼性を重視（経験、実績、具体的なスキルの提示など）`,
  note: (text, highlights) => `
以下のNote記事を分析してください。

---
【記事本文】
${text}
---

以下の${highlights.length}箇所は、AIが生成しやすい表現や、読者の共感を得にくい可能性のある箇所です。
それぞれの箇所について、「なぜAIっぽく見えるのか」の理由と「どう直せば共感を得やすいか」のヒントを、自然な日本語で返してください。

【分析対象の箇所】
${highlights.map((h, i) => `${i+1}. "${h.text}"`).join("\n")}

【出力形式】
各箇所について、以下のJSON配列で返してください：
[
  {
    "index": 1,
    "reason": "この箇所はAIっぽく見える理由（自然な日本語、40文字程度）",
    "hint": "共感を得やすくするための具体的な改善案（自然な日本語、60文字程度）"
  },
  ...
]

【注意点】
- 理由は技術的な言葉は避けて、読者視点で説明
- ヒントは「個人的な体験を入れて」「感情を込めて」などの抽象的なアドバイスではなく、具体的な提案
- 記事としての共感性を重視（個人的なエピソード、感情表現、読者への問いかけなど）`,
};

/**
 * LLM APIを呼び出すラッパー関数
 * TODO: 実際のAPIクライアントに置き換え
 */
async function callLLMAPI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!LLM_CONFIG.enabled || !LLM_CONFIG.apiKey) {
    console.log("[LLM] Skipped - LLM not configured");
    return "[]";
  }

  // TODO: 実際のAPI呼び出しを実装
  // 例: Anthropic API
  /*
  const response = await fetch(LLM_CONFIG.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LLM_CONFIG.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: LLM_CONFIG.model,
      max_tokens: LLM_CONFIG.maxTokens,
      temperature: LLM_CONFIG.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await response.json();
  return data.content[0].text || "[]";
  */

  console.log("[LLM] Mock response - LLM API not yet implemented");
  // モックレスポンス（本番では削除）
  return JSON.stringify(
    Array.from({ length: Math.min(highlights.length, 3) }, (_, i) => ({
      index: i + 1,
      reason: `モック: 理由 ${i + 1}`,
      hint: `モック: ヒント ${i + 1}`,
    }))
  );
}

/**
 * ハイライトをLLMで精緻化
 * @param text - 元のテキスト
 * @param highlights - ルールベースで生成したハイライト
 * @param mode - 解析モード
 * @returns LLMで精緻化されたハイライト配列
 */
export async function refineHighlightsWithLLM(
  text: string,
  highlights: Highlight[],
  mode: AnalysisMode = "proposal"
): Promise<Highlight[]> {
  // ハイライトがなければ早期リターン
  if (highlights.length === 0) {
    return highlights;
  }

  // LLMが無効の場合は元のハイライトを返す
  if (!LLM_CONFIG.enabled || !LLM_CONFIG.apiKey) {
    console.log("[LLM] refineHighlightsWithLLM: LLM not enabled, returning original highlights");
    return highlights;
  }

  try {
    const systemPrompt = SYSTEM_PROMPTS[mode];
    const userPrompt = USER_PROMPT_TEMPLATES[mode](text, highlights);

    // LLMを呼び出し
    const llmResponse = await callLLMAPI(systemPrompt, userPrompt);

    // JSONをパース
    const refined = JSON.parse(llmResponse) as Array<{
      index: number;
      reason: string;
      hint: string;
    }>;

    // 戻り値をハイライトにマッピング
    const refinedMap = new Map<number, { reason: string; hint: string }>(
      refined.map((r) => [r.index, { reason: r.reason, hint: r.hint }])
    );

    return highlights.map((highlight, index) => {
      const refinement = refinedMap.get(index + 1);
      if (refinement) {
        return {
          ...highlight,
          reason: refinement.reason,
          hint: refinement.hint,
        };
      }
      return highlight;
    });
  } catch (error) {
    console.error("[LLM] refineHighlightsWithLLM error:", error);
    // エラー時は元のハイライトを返す
    return highlights;
  }
}
