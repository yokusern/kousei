"use client";

import type { Highlight } from "@/lib/types";

type HighlightListProps = {
  highlights: Highlight[];
};

export default function HighlightList({ highlights }: HighlightListProps) {
  return (
    <section style={styles.card}>
      <h3 style={styles.title}>AIっぽく見えやすい箇所</h3>

      {highlights.length === 0 ? (
        <p style={styles.empty}>
          今回は強く気になる箇所は見つかりませんでした。
        </p>
      ) : (
        <div style={styles.list}>
          {highlights.map((item, index) => (
            <article key={`${item.start}-${item.end}-${index}`} style={styles.item}>
              <div style={styles.index}>#{index + 1}</div>

              <div style={styles.block}>
                <p style={styles.label}>原文</p>
                <div style={styles.quote}>{item.text}</div>
              </div>

              <div style={styles.block}>
                <p style={styles.label}>理由</p>
                <p style={styles.body}>{item.reason}</p>
              </div>

              <div style={styles.block}>
                <p style={styles.label}>人間味を足すヒント</p>
                <p style={styles.body}>{item.hint}</p>
              </div>

              <p style={styles.meta}>
                位置: {item.start} - {item.end}
              </p>
            </article>
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
  title: {
    margin: "0 0 12px",
    fontSize: 16,
    color: "#111827",
  },
  empty: {
    margin: 0,
    fontSize: 14,
    color: "#6b7280",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  item: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
  },
  index: {
    display: "inline-block",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 8px",
    marginBottom: 10,
  },
  block: {
    marginBottom: 10,
  },
  label: {
    margin: "0 0 6px",
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
  },
  quote: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  body: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#374151",
  },
  meta: {
    margin: 0,
    fontSize: 12,
    color: "#9ca3af",
  },
};
