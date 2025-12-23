"use client";
import { useState } from "react";
import { Bug, X } from "lucide-react";

function getLogStyle(log) {
  const s = log.toLowerCase();

  if (s.includes("error")) {
    return { color: "var(--error)" };   // 🔴
  }
  if (s.includes("warn")) {
    return { color: "var(--warn)" };    // 🟡
  }
  if (s.includes("ok") || s.includes("connected") || s.includes("success")) {
    return { color: "var(--success)" }; // 🟢
  }

  return { color: "var(--text-main)" };
}

export default function DebugPopup({ logs }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FLOAT BUTTON */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--primary)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        }}
        title="Debug Logs"
      >
        <Bug size={22} />
      </div>

      {/* POPUP */}
      <div
        style={{
          position: "fixed",
          right: 20,
          bottom: open ? 84 : 40,
          width: 380,
          maxHeight: open ? 300 : 0,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          transition: "all 0.25s ease",
          zIndex: 999,
          overflow: "hidden",
          color: "var(--text-main)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            background: "var(--bg-panel)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bug size={16} />
            <b style={{ fontSize: 14 }}>Debug Logs</b>
          </div>

          <div
            onClick={() => setOpen(false)}
            style={{ cursor: "pointer", opacity: 0.8 }}
          >
            <X size={16} />
          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            padding: 10,
            fontSize: 13,
            maxHeight: 240,
            overflowY: "auto",
            whiteSpace: "pre-line",
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>
              No logs…
            </div>
          ) : (
            logs.map((l, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 4,
                  ...getLogStyle(l),
                }}
              >
                • {l}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
