"use client";

import type { AnalysisMode } from "@/lib/types";

type ResultSummaryProps = {
  score: number;
  summary: string;
  mode?: AnalysisMode;
};

function getScoreLabel(score: number, mode: AnalysisMode = "proposal") {
  const labels = {
    proposal: {
      high: "信頼性: 低め",
      medium: "信頼性: 普通",
      low: "信頼性: 高め",
    },
    note: {
      high: "共感性: 低め",
      medium: "共感性: 普通",
      low: "共感性: 高め",
    },
  };

  const selected = labels[mode] || labels.proposal;
  if (score >= 71) return selected.high;
  if (score >= 31) return selected.medium;
  return selected.low;
}

export default function ResultSummary({ score, summary, mode = "proposal" }: ResultSummaryProps) {
  return (
    <section style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <p style={styles.caption}>
            {mode === "proposal" ? "提案文の信頼性スコア" : "記事の共感性スコア"}
          </p>
          <h2 style={styles.score}>{score} / 100</h2>
        </div>
        <div style={styles.badge}>{getScoreLabel(score, mode)}</div>
      </div>

      <div style={styles.meterWrap}>
        <div style={styles.meterBg}>
          <div
            style={{
              ...styles.meterFill,
              width: `${score}%`,
              background:
                score >= 71
                  ? "#ef4444"
                  : score >= 31
                  ? "#f59e0b"
                  : "#10b981",
            }}
          />
        </div>
      </div>

      <p style={styles.summary}>{summary}</p>

      <div style={styles.guide}>
        <span>目安:</span>
        {mode === "proposal" ? (
          <>
            <span>0〜30 信頼性高め</span>
            <span>31〜70 普通</span>
            <span>71〜100 信頼性低め</span>
          </>
        ) : (
          <>
            <span>0〜30 共感性高め</span>
            <span>31〜70 普通</span>
            <span>71〜100 共感性低め</span>
          </>
        )}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    background: "#ffffff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  caption: {
    margin: 0,
    fontSize: 13,
    color: "#6b7280",
  },
  score: {
    margin: "4px 0 0",
    fontSize: 32,
    lineHeight: 1.1,
    color: "#111827",
  },
  badge: {
    background: "#f3f4f6",
    color: "#111827",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  meterWrap: {
    marginTop: 14,
    marginBottom: 14,
  },
  meterBg: {
    width: "100%",
    height: 10,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 999,
  },
  summary: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#374151",
  },
  guide: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    fontSize: 12,
    color: "#6b7280",
  },
};
