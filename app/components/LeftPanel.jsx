"use client";

import CmdVelControl from "./CmdVelControl";

export default function LeftPanel({
  ros,
  robotPose,
  lidarCount,
  tfOk,
  lastScanTime,
  lastTfTime,
  debugLogs,
  openLidar,
}) {
  return (
    <div
      style={{
        width: 350,
        background: "#161b22",
        padding: 18,
        borderRight: "1px solid #222",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflowY: "auto",
      }}
    >
      {/* ROBOT STATUS */}
      <div>
        <h3>Robot Status</h3>
        {robotPose ? (
          <div>
            x: {robotPose.x.toFixed(2)} <br />
            y: {robotPose.y.toFixed(2)} <br />
            yaw: {robotPose.yaw.toFixed(2)}
          </div>
        ) : (
          <p style={{ color: "#e57373" }}>Waiting TF…</p>
        )}
      </div>

      {/* TF STATUS */}
      <div>
        <h3>TF Status</h3>
        {tfOk ? (
          <p style={{ color: "#4caf50" }}>TF OK (received)</p>
        ) : (
          <p style={{ color: "#f44336" }}>TF Missing</p>
        )}

        <p style={{ fontSize: 13, color: "#aaa" }}>
          Last TF: {lastTfTime ? lastTfTime : "N/A"}
        </p>
      </div>

      {/* LIDAR STATUS */}
      <div>
        <h3>Lidar Status</h3>

        <p>
          Points:{" "}
          <span style={{ color: lidarCount > 0 ? "#4caf50" : "#f44336" }}>
            {lidarCount}
          </span>
        </p>

        <p style={{ fontSize: 13, color: "#aaa" }}>
          Last Scan: {lastScanTime ? lastScanTime : "N/A"}
        </p>

        <button
          onClick={openLidar}
          style={{
            marginTop: 10,
            padding: "10px 16px",
            background: "#0066cc",
            border: "none",
            borderRadius: 6,
            color: "white",
            cursor: "pointer",
          }}
        >
          Open Lidar Popup
        </button>
      </div>

      {/* TELEOP */}
      <div>
        <h3>Teleoperation</h3>
        <CmdVelControl ros={ros} />
      </div>

      {/* DEBUG LOGS */}
      <div>
        <h3>Debug Logs</h3>

        <div
          style={{
            border: "1px solid #333",
            background: "#0e0e0e",
            borderRadius: 6,
            padding: 10,
            height: 180,
            overflowY: "auto",
            fontSize: 13,
            color: "#ccc",
            whiteSpace: "pre-line",
          }}
        >
          {debugLogs.length === 0 ? (
            <div style={{ color: "#666" }}>No logs...</div>
          ) : (
            debugLogs.map((l, i) => <div key={i}>• {l}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
