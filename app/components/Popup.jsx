"use client";

export default function Popup({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)", // nhẹ hơn, hợp light mode
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          minWidth: 400,
          maxHeight: "90vh",
          padding: 20,
          background: "var(--bg-panel)",   // 🔥 THEME AWARE
          color: "var(--text-main)",       // 🔥 THEME AWARE
          borderRadius: 12,
          border: "1px solid var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            ✖
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 14, textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              background: "var(--bg-card)",
              color: "var(--text-main)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
