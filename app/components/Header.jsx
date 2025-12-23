"use client";

import ThemeToggle from "./ThemeToggle";

export default function Header({ connected, connect, disconnect }) {
  return (
    <div
      style={{
        height: 60,
        background: "var(--bg-panel)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        color: "var(--text-main)",
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>
          ROS Web Dashboard
        </h2>

        <button
          onClick={connected ? disconnect : connect}
          style={{
            padding: "8px 18px",
            background: connected
              ? "var(--error)"
              : "var(--success)",
            borderRadius: 6,
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {connected ? "Disconnect" : "Connect ROS"}
        </button>

        <button
          onClick={() => fetch("/api/rviz", { method: "POST" })}
          style={{
            padding: "8px 14px",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Open RViz2
        </button>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle />
      </div>
    </div>
  );
}
