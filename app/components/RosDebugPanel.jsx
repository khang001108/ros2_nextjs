"use client";
import React from "react";

export default function RosDebugPanel({ connected, pose, lidarCount, errors }) {
  return (
    <div style={{
      background: "#111",
      padding: 15,
      borderRadius: 8,
      marginTop: 20,
      fontSize: 14,
      color: "#ccc",
      border: "1px solid #333"
    }}>
      <h3 style={{ marginBottom: 10 }}>ROS Debug</h3>

      <p>🔌 ROS Connected: 
        <span style={{ color: connected ? "#4caf50" : "#f44336" }}>
          {connected ? " YES" : " NO"}
        </span>
      </p>

      <p>📡 TF Pose: 
        {pose ? (
          <span style={{ color: "#4caf50" }}> OK</span>
        ) : (
          <span style={{ color: "#f44336" }}> Missing</span>
        )}
      </p>

      <p>📍 Lidar Points: 
        <span style={{ color: lidarCount > 0 ? "#4caf50" : "#f44336" }}>
          {lidarCount}
        </span>
      </p>

      {errors?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <h4 style={{ color: "#e53935" }}>Errors:</h4>
          {errors.map((err, i) => (
            <div key={i} style={{ color: "#ff1744" }}>
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
