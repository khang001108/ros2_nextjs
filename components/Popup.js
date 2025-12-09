"use client";
import React from "react";

export default function Popup({ open, title, children, onClose, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9999,
      background: "rgba(0,0,0,0.45)"
    }}>
      <div style={{
        width: width, background: "#fff", borderRadius: 10,
        padding: 16, boxShadow: "0 6px 24px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}
