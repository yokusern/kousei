export type Highlight = {
  text: string;
  start: number;
  end: number;
  reason: string;
  hint: string;
};

// 解析モード
export type AnalysisMode = "proposal" | "note";

// APIリクエスト型
export type AnalyzeRequest = {
  text: string;
  mode?: AnalysisMode;
};

export type AnalysisResult = {
  score: number;
  summary: string;
  highlights: Highlight[];
  analyzedAt: string;
  inputText: string;
  id: string;
  mode?: AnalysisMode;
};
