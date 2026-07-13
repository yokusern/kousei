"use client";

import { useRef, useEffect } from "react";
import type { AnalysisMode } from "@/lib/types";
import ModeSelector from "./ModeSelector";

type InputPanelProps = {
  value: string;
  mode: AnalysisMode;
  onChange: (value: string) => void;
  onModeChange: (mode: AnalysisMode) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
};

export default function InputPanel({
  value,
  mode,
  onChange,
  onModeChange,
  onAnalyze,
  onClear,
  isLoading,
}: InputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = isLoading || !value.trim();

  // 自動リサイズ
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <>
      {/* モードセレクタ */}
      <ModeSelector value={mode} onChange={onModeChange} />

      <section style={styles.card}>
        <div style={styles.labelRow}>
          <label htmlFor="text-input" style={styles.label}>
            文章を入力
          </label>
          <span style={styles.count}>{value.length}文字</span>
        </div>

        <textarea
          ref={textareaRef}
          id="text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            mode === "proposal"
              ? "提案文、応募文などを貼り付けてください..."
              : "記事本文、下書きなどを貼り付けてください..."
          }
          style={styles.textarea}
          rows={1}
        />

        <p style={styles.helpText}>
          {mode === "proposal"
            ? "クライアントに信頼される提案文に整えます"
            : "読者に共感される記事に整えます"}
        </p>

        <div style={styles.buttonRow}>
          <button
            onClick={onAnalyze}
            disabled={isDisabled}
            style={{
              ...styles.primaryButton,
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "少しお待ちください..." : "解析する"}
          </button>

          <button
            onClick={onClear}
            disabled={isLoading || value === ""}
            style={{
              ...styles.secondaryButton,
              opacity: isLoading || value === "" ? 0.6 : 1,
              cursor: isLoading || value === "" ? "not-allowed" : "pointer",
            }}
          >
            クリア
          </button>
        </div>
      </section>
    </>
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
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  count: {
    fontSize: 12,
    color: "#6b7280",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    maxHeight: 300,
    resize: "none",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: 12,
    fontSize: 16,
    lineHeight: 1.6,
    outline: "none",
    boxSizing: "border-box",
    overflowY: "hidden",
    fontFamily: "inherit",
  },
  helpText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonRow: {
    display: "flex",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    border: "none",
    borderRadius: 12,
    background: "#111827",
    color: "#ffffff",
    padding: "12px 16px",
    fontSize: 15,
    fontWeight: 700,
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#ffffff",
    color: "#111827",
    padding: "12px 16px",
    fontSize: 15,
    fontWeight: 600,
  },
};
