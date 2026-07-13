"use client";

import type { AnalysisResult } from "@/lib/types";

type HistoryListProps = {
  items: AnalysisResult[];
  onSelect: (item: AnalysisResult) => void;
  onClearHistory: () => void;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default function HistoryList({
  items,
  onSelect,
  onClearHistory,
}: HistoryListProps) {
  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>最近の解析</h3>
        {items.length > 0 && (
          <button onClick={onClearHistory} style={styles.clearButton}>
            履歴を消去
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p style={styles.empty}>まだ履歴はありません。</p>
      ) : (
        <div style={styles.list}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              style={styles.itemButton}
            >
              <div style={styles.itemTop}>
                <span style={styles.score}>Score {item.score}</span>
                <span style={styles.date}>{formatDate(item.analyzedAt)}</span>
              </div>

              <p style={styles.preview}>
                {item.inputText.length > 72
                  ? `${item.inputText.slice(0, 72)}...`
                  : item.inputText}
              </p>
            </button>
          ))}
        </div>
      )}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    border: "none",
    background: "transparent",
    color: "#6b7280",
    fontSize: 12,
    cursor: "pointer",
  },
  empty: {
    margin: 0,
    fontSize: 14,
    color: "#6b7280",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  itemButton: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #e5e7eb",
    background: "#fafafa",
    borderRadius: 12,
    padding: 12,
    cursor: "pointer",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  score: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
  },
  date: {
    fontSize: 12,
    color: "#6b7280",
  },
  preview: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#374151",
    whiteSpace: "pre-wrap",
  },
};
