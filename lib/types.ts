export type Highlight = {
  text: string;
  start: number;
  end: number;
  reason: string;
  hint: string;
};

export type AnalysisResult = {
  score: number;
  summary: string;
  highlights: Highlight[];
  analyzedAt: string;
  inputText: string;
  id: string;
};
