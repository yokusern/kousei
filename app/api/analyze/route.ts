import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, AnalyzeRequest, AnalysisMode } from "@/lib/types";
import { analyzeText, DEFAULT_OPTIONS } from "@/lib/analyzer";
import { MAX_HIGHLIGHTS } from "@/lib/constants";
import { refineHighlightsWithLLM } from "@/lib/llm";

export const runtime = "nodejs";
// Edge にしたい場合は以下に変更:
// export const runtime = "edge";

/**
 * メイン解析ハンドラー
 * 1. 基本的なルールベース解析を実行
 * 2. LLMを使った精緻化を実行（設定されている場合）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AnalyzeRequest;
    const text = body.text || "";
    const mode: AnalysisMode = body.mode || "proposal";

    if (!text.trim()) {
      return NextResponse.json(
        { error: "文章を入力してください" },
        { status: 400 }
      );
    }

    // 基本解析を実行（モードを渡す）
    const result = analyzeText(text, DEFAULT_OPTIONS, mode);

    // LLMを使った精緻化（設定されている場合）
    if (process.env.LLM_ENABLED === "true" && process.env.LLM_API_KEY) {
      try {
        result.highlights = await refineHighlightsWithLLM(
          text,
          result.highlights.slice(0, MAX_HIGHLIGHTS),
          mode
        );
      } catch (llmError) {
        console.error("[LLM] Refine error:", llmError);
        // LLMエラー時は元の結果を返す
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Analyze API error:", error);

    return NextResponse.json(
      { error: "AIっぽさをうまく解析できませんでした。もう一度試してください。" },
      { status: 500 }
    );
  }
}
