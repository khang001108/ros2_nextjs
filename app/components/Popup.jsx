"use client";

export default function Popup({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 50
    }}>
      <div style={{
        minWidth: 400,
        padding: 20,
        background: "#161b22",
        borderRadius: 10
      }}>
        <h3>{title}</h3>
        <div style={{ marginTop: 10 }}>
          {children}
        </div>
        <button
          onClick={onClose}
          style={{ marginTop: 20 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
