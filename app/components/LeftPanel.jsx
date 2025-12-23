"use client";

import CmdVelControl from "./CmdVelControl";

export default function LeftPanel({
  ros,
  robotPose,
  lidarCount,
  tfOk,
  lastScanTime,
  lastTfTime,
  openLidar,
}) {
  return (
    <div
      style={{
        width: 250,
        height: "80vh",
        background: "var(--bg-panel)",
        padding: 18,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflowY: "auto",
        color: "var(--text-main)",
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
          <p style={{ color: "var(--error)" }}>Waiting TF…</p>
        )}
      </div>

      {/* TF STATUS */}
      <div>
        <h3>TF Status</h3>
        {tfOk ? (
          <p style={{ color: "var(--success)" }}>TF OK (received)</p>
        ) : (
          <p style={{ color: "var(--error)" }}>TF Missing</p>
        )}

        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Last TF: {lastTfTime || "N/A"}
        </p>
      </div>

      {/* LIDAR STATUS */}
      <div>
        <h3>Lidar Status</h3>

        <p>
          Points:{" "}
          <span
            style={{
              color: lidarCount > 0
                ? "var(--success)"
                : "var(--error)",
            }}
          >
            {lidarCount}
          </span>
        </p>

        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Last Scan: {lastScanTime || "N/A"}
        </p>

        <button
          onClick={openLidar}
          style={{
            marginTop: 10,
            padding: "10px 16px",
            background: "var(--primary)",
            border: "none",
            borderRadius: 6,
            color: "#fff",
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
    </div>
  );
}
