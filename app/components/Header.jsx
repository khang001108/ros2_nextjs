"use client";

export default function Header({ connected, connect, disconnect }) {
  return (
    <div style={{
      height: 60,
      background: "#161b22",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px"
    }}>
      <h2>ROS Web Dashboard</h2>

      <button
        onClick={connected ? disconnect : connect}
        style={{
          padding: "8px 20px",
          background: connected ? "#d32f2f" : "#2e7d32",
          borderRadius: 6,
          border: "none",
          color: "white",
          cursor: "pointer",
        }}
      >
        {connected ? "Disconnect" : "Connect ROS"}
      </button>
    </div>
  );
}
