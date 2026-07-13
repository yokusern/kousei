import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult } from "@/lib/types";
import { analyzeText, DEFAULT_OPTIONS } from "@/lib/analyzer";
import { MAX_HIGHLIGHTS } from "@/lib/constants";

export const runtime = "nodejs";
// Edge にしたい場合は以下に変更:
// export const runtime = "edge";

/**
 * LLMを使ったハイライトの精緻化
 * TODO: 将来実装 - 環境変数が設定されたら有効化
 * 
 * 現状はダミー関数。LLM APIが利用可能になったら、
 * ハイライトのreasonとhintをより自然な表現に精緻化する。
 */
async function refineHighlightsWithLLM(
  highlights: AnalysisResult["highlights"],
  text: string
): Promise<AnalysisResult["highlights"]> {
  // TODO: LLM API呼び出しを実装
  // 例:
  // if (process.env.LLM_ENABLED === "true") {
  //   const client = createLLMClient();
  //   return await client.refineHighlights(highlights, text);
  // }
  
  console.log("[DEBUG] LLM refinement skipped - not configured");
  return highlights;
}

/**
 * メイン解析ハンドラー
 * 1. 基本的なルールベース解析を実行
 * 2. LLMを使った精緻化を実行（設定されている場合）
 */
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

    // 基本解析を実行
    const result = analyzeText(text, DEFAULT_OPTIONS);

    // LLMを使った精緻化（将来実装）
    // result.highlights = await refineHighlightsWithLLM(
    //   result.highlights.slice(0, MAX_HIGHLIGHTS),
    //   text
    // );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Analyze API error:", error);

    return NextResponse.json(
      { error: "failed to analyze text" },
      { status: 500 }
    );
  }
}
