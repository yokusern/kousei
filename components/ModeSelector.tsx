"use client";

import type { AnalysisMode } from "@/lib/types";
import { ANALYSIS_MODES, MODE_LABELS, MODE_DESCRIPTIONS } from "@/lib/constants";

type ModeSelectorProps = {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
};

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>モードを選択</h2>
        <p style={styles.subtitle}>用途に応じて解析を最適化します</p>
      </div>

      <div style={styles.modeGrid}>
        {ANALYSIS_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            style={{
              ...styles.modeButton,
              ...(value === mode ? styles.modeButtonActive : {}),
            }}
            aria-pressed={value === mode}
          >
            <div style={styles.modeName}>{MODE_LABELS[mode]}</div>
            <div style={styles.modeDescription}>{MODE_DESCRIPTIONS[mode]}</div>
          </button>
        ))}
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
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#6b7280",
  },
  modeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  modeButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    background: "#ffffff",
    padding: "12px 8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  modeButtonActive: {
    borderColor: "#111827",
    background: "#f9fafb",
  },
  modeName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.4,
  },
};
