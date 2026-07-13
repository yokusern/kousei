"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult, AnalysisMode } from "@/lib/types";
import InputPanel from "@/components/InputPanel";
import ResultSummary from "@/components/ResultSummary";
import HighlightList from "@/components/HighlightList";
import HistoryList from "@/components/HistoryList";

const HISTORY_KEY = "ai-style-checker-history";
const HISTORY_LIMIT = 5;

export default function Page() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("proposal");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as AnalysisResult[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  const saveHistory = (item: AnalysisResult) => {
    const next = [item, ...history.filter((h) => h.id !== item.id)].slice(0, HISTORY_LIMIT);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, mode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "文章をうまく解析できませんでした");
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      saveHistory(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "不明なエラーが発生しました";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError("");
  };

  const handleSelectHistory = (item: AnalysisResult) => {
    setText(item.inputText);
    setResult(item);
    setError("");
    // 履歴のモードを復元
    if (item.mode) {
      setMode(item.mode);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>副業・発信のための文章OS</p>
          <h1 style={styles.title}>AIっぽさ可視化ツール</h1>
          <p style={styles.description}>
            クラウドソーシング提案文やNote記事の「AIっぽさ」を見える化して、
            <br />
            自分の言葉に整えます。
          </p>
        </header>

        <div style={styles.section}>
          <InputPanel
            value={text}
            mode={mode}
            onChange={setText}
            onModeChange={setMode}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isLoading={isLoading}
          />
        </div>

        {error && (
          <div style={styles.errorBox}>
            <strong style={styles.errorTitle}>エラー</strong>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {result && (
          <>
            <div style={styles.section}>
              <ResultSummary score={result.score} summary={result.summary} mode={result.mode} />
            </div>

            <div style={styles.section}>
              <HighlightList highlights={result.highlights} />
            </div>
          </>
        )}

        <div style={styles.section}>
          <HistoryList
            items={history}
            onSelect={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(to bottom, #f8fafc 0%, #ffffff 40%, #f8fafc 100%)",
    padding: "16px 16px 40px",
  },
  container: {
    width: "100%",
    maxWidth: 720,
    margin: "0 auto",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  eyebrow: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  title: {
    margin: "8px 0 8px",
    fontSize: 28,
    lineHeight: 1.2,
    color: "#111827",
  },
  description: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#4b5563",
  },
  section: {
    marginTop: 12,
  },
  errorBox: {
    marginTop: 16,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    borderRadius: 12,
    padding: 12,
  },
  errorTitle: {
    display: "block",
    fontSize: 13,
    color: "#991b1b",
    marginBottom: 4,
  },
  errorText: {
    margin: 0,
    fontSize: 14,
    color: "#7f1d1d",
  },
};
