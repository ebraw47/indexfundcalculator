"use client";

import { useCallback, useId, useRef, useState } from "react";
import {
  extractTextFromFile,
  type ExtractProgress,
} from "@/lib/extract-document";
import {
  parseStatementText,
  type DetectedFields,
  type ParseResult,
} from "@/lib/parse-statement";

type Props = {
  onApply: (fields: DetectedFields) => void;
};

const ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf,.png,.jpg,.jpeg,.webp,.pdf";

export function DocumentUpload({ onApply }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState("");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setBusy(true);
    setError("");
    setParsed(null);
    setPreview("");
    setProgress(0);
    setFileName(file.name);
    setStatus(`Processing ${file.name}…`);

    try {
      if (file.size > 12 * 1024 * 1024) {
        throw new Error("File is larger than 12 MB. Try a smaller crop or PDF.");
      }

      const text = await extractTextFromFile(file, (p: ExtractProgress) => {
        setStatus(p.message);
        if (typeof p.progress === "number") setProgress(p.progress);
      });

      const trimmed = text.replace(/\s+/g, " ").trim();
      if (trimmed.length < 8) {
        throw new Error(
          "Could not read enough text. Try a clearer screenshot or a text-based PDF.",
        );
      }

      const result = parseStatementText(text);
      setPreview(text.slice(0, 1200));
      setParsed(result);
      const count = Object.keys(result.fields).length;
      if (count > 0) {
        onApply(result.fields);
        setStatus(
          `Applied ${count} field(s) to the calculator — results updated below.`,
        );
        queueMicrotask(() => {
          document.getElementById("calc-results")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } else {
        setStatus(
          "Text extracted, but no calculator fields matched. Edit inputs manually.",
        );
      }
      setProgress(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setStatus("");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onApply]);

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void processFile(file);
  }

  const fieldCount = parsed ? Object.keys(parsed.fields).length : 0;

  return (
    <div className="upload-panel" style={{ marginBottom: "1.25rem" }}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        disabled={busy}
        onChange={(e) => onFiles(e.target.files)}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          border: 0,
          opacity: 0,
        }}
      />

      <label
        htmlFor={busy ? undefined : inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.1rem",
          width: "100%",
          boxSizing: "border-box",
          padding: "1.15rem 1.25rem",
          borderRadius: "1.25rem",
          cursor: busy ? "wait" : "pointer",
          border: dragOver
            ? "2px solid #e86f3c"
            : "2px dashed rgba(92, 52, 40, 0.28)",
          background: dragOver
            ? "linear-gradient(135deg, #ffe8d6, #ffffff)"
            : "linear-gradient(135deg, #5c3428 0%, #a85a35 48%, #e86f3c 100%)",
          boxShadow: "0 16px 40px rgba(92, 52, 40, 0.18)",
          color: dragOver ? "#1c100c" : "#fff4ec",
          transition: "transform 0.15s ease, border-color 0.15s ease",
          transform: dragOver ? "scale(1.01)" : "none",
        }}
      >
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: dragOver
              ? "rgba(232,111,60,0.14)"
              : "rgba(255,255,255,0.16)",
            border: dragOver
              ? "1px solid rgba(232,111,60,0.28)"
              : "1px solid rgba(255,255,255,0.22)",
            color: dragOver ? "#e86f3c" : "#fff4ec",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
          </svg>
        </span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {busy ? "Detecting data…" : "Upload statement or screenshot"}
          </span>
        </span>

        <span
          style={{
            flexShrink: 0,
            padding: "0.7rem 1.15rem",
            borderRadius: 999,
            background: dragOver ? "#e86f3c" : "#fff",
            color: dragOver ? "#fff4ec" : "#5c3428",
            fontWeight: 750,
            fontSize: "0.92rem",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
          }}
        >
          {busy ? "Working…" : "Choose file"}
        </span>
      </label>

      {busy && (
        <div
          aria-hidden
          style={{
            marginTop: 10,
            height: 7,
            borderRadius: 999,
            background: "rgba(92,52,40,0.12)",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: `${Math.round(progress * 100)}%`,
              background: "linear-gradient(90deg, #c45a2e, #ff8a4c)",
              transition: "width 0.2s ease",
            }}
          />
        </div>
      )}
      {status && (
        <p
          style={{
            margin: "0.55rem 0 0",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#5c3428",
          }}
        >
          {status}
        </p>
      )}
      {error && (
        <p
          style={{
            margin: "0.55rem 0 0",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#c2410c",
          }}
        >
          {error}
        </p>
      )}

      {parsed && (
        <div
          style={{
            marginTop: "0.85rem",
            padding: "1rem 1.1rem",
            borderRadius: "1rem",
            border: "1px solid rgba(92,52,40,0.14)",
            background: "rgba(255,255,255,0.75)",
          }}
        >
          <h3
            style={{
              margin: "0 0 0.5rem",
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "1.1rem",
            }}
          >
            Detected fields
          </h3>
          {fieldCount === 0 ? (
            <p style={{ margin: 0, color: "#8a6554", fontSize: "0.9rem" }}>
              No structured fields matched.
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.1rem",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              {parsed.matches.map((m) => (
                <li key={`${m.field}-${m.value}`}>
                  <strong>{m.field}</strong>: {m.value}
                  <span style={{ color: "#8a6554" }}> — {m.evidence}</span>
                </li>
              ))}
            </ul>
          )}
          {fieldCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onApply(parsed.fields);
                setStatus("Applied to calculator — scroll down to see updated results.");
                document.getElementById("calc-results")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              style={{
                marginTop: "0.75rem",
                border: "none",
                borderRadius: 999,
                padding: "0.65rem 1.15rem",
                background: "#e86f3c",
                color: "#fff4ec",
                font: "inherit",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Apply to calculator
            </button>
          )}
          {preview && (
            <details style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
              <summary>Show extracted text</summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "rgba(92,52,40,0.05)",
                  borderRadius: "0.6rem",
                  padding: "0.75rem",
                  maxHeight: 180,
                  overflow: "auto",
                }}
              >
                {preview}
                {preview.length >= 1200 ? "…" : ""}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
