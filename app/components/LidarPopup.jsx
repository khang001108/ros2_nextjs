"use client";
import { useEffect, useRef, useState } from "react";
import * as ROSLIB from "roslib";

/* ===== CSS VAR HELPER ===== */
function cssVar(name, fallback) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}

export default function LidarPopup({ ros, onClose }) {
  const canvasRef = useRef(null);
  const scanRef = useRef(null);
  const zoomRef = useRef(1);

  /* ===== INFO ===== */
  const [info, setInfo] = useState({
    points: 0,
    rangeMax: 0,
  });

  /* ===== CONFIG STATE (QUAN TRỌNG) ===== */
  const [showGrid, setShowGrid] = useState(true);
  const [showLaser, setShowLaser] = useState(true);
  const [pointSize, setPointSize] = useState(3);
  const [alpha, setAlpha] = useState(1);
  const [frameId, setFrameId] = useState("N/A");

  /* ===== SUBSCRIBE LASER ===== */
  useEffect(() => {
    if (!ros) return;

    const sub = new ROSLIB.Topic({
      ros,
      name: "/scan",
      messageType: "sensor_msgs/LaserScan",
    });

    sub.subscribe((msg) => {
      scanRef.current = msg;

      setInfo({
        points: msg.ranges.length,
        rangeMax: msg.range_max,
      });

      setFrameId(msg.header?.frame_id || "unknown");
    });

    return () => sub.unsubscribe();
  }, [ros]);

  /* ===== DRAW CANVAS ===== */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frame;

    function draw() {
      const w = canvas.width;
      const h = canvas.height;

      /* COLORS */
      const bg = cssVar("--lidar-bg", "#0d1117");
      const grid = cssVar("--lidar-grid", "rgba(255,255,255,0.06)");
      const laser = cssVar("--lidar-point", "#ff5555");
      const robot = cssVar("--lidar-robot", "#4ea1ff");

      /* BACKGROUND */
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      /* GRID */
      if (showGrid) {
        ctx.strokeStyle = grid;
        const step = 40;

        for (let x = 0; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);

      /* LASER */
      const scan = scanRef.current;
      if (scan && showLaser) {
        const { ranges, angle_min, angle_increment, range_max } = scan;
        const scale = (Math.min(w, h) / 2 / range_max) * zoomRef.current;

        ctx.fillStyle = laser;
        ctx.globalAlpha = alpha;

        for (let i = 0; i < ranges.length; i++) {
          const r = ranges[i];
          if (!isFinite(r)) continue;

          const a = angle_min + i * angle_increment;
          const x = Math.cos(a) * r * scale;
          const y = Math.sin(a) * r * scale;

          ctx.fillRect(
            x - pointSize / 2,
            -y - pointSize / 2,
            pointSize,
            pointSize
          );
        }

        ctx.globalAlpha = 1;
      }

      /* ROBOT */
      ctx.fillStyle = robot;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      frame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(frame);
  }, [showGrid, showLaser, pointSize, alpha]);

  return (
    <div
      style={{
        width: 760,
        height: 520,
        background: "var(--lidar-bg)",
        border: "1px solid var(--lidar-border)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          padding: "10px 14px",
          background: "var(--lidar-panel)",
          borderBottom: "1px solid var(--lidar-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-main)",
        }}
      >
        <b>
          🔴 LaserScan <span style={{ color: "var(--text-muted)" }}>/scan</span>
        </b>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ✖
        </button>
      </div>

      {/* ===== BODY ===== */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* ===== FIXED FRAME ===== */}
        <div
          style={{
            padding: 8,
            background: "var(--bg-panel)",
            border: "1px solid var(--lidar-border)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <div style={{ color: "var(--text-muted)" }}>Fixed Frame</div>
          <b style={{ color: "var(--primary)" }}>{frameId}</b>
        </div>

        {/* CONFIG PANEL */}
        <div
          style={{
            width: 220,
            padding: 12,
            background: "var(--bg-card)",
            borderRight: "1px solid var(--lidar-border)",
            fontSize: 13,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <b>Display</b>

          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />{" "}
            Show Grid
          </label>

          <label>
            <input
              type="checkbox"
              checked={showLaser}
              onChange={(e) => setShowLaser(e.target.checked)}
            />{" "}
            Show Laser
          </label>

          <hr />

          <b>Laser Style</b>

          <label>
            Point Size
            <input
              type="range"
              min={1}
              max={6}
              value={pointSize}
              onChange={(e) => setPointSize(+e.target.value)}
            />
          </label>

          <label>
            Alpha
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={alpha}
              onChange={(e) => setAlpha(+e.target.value)}
            />
          </label>

          <hr />

          <button
            onClick={() => (zoomRef.current = 1)}
            style={{
              padding: "6px",
              background: "var(--lidar-btn)",
              border: "1px solid var(--lidar-border)",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--text-main)",
            }}
          >
            Reset View
          </button>
        </div>

        {/* CANVAS */}
        <div style={{ flex: 1, padding: 10 }}>
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            style={{
              width: "100%",
              height: "100%",
              background: "var(--lidar-bg)",
              borderRadius: 8,
              border: "1px solid var(--lidar-border)",
            }}
          />
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div
        style={{
          padding: "6px 12px",
          fontSize: 12,
          color: "var(--text-muted)",
          borderTop: "1px solid var(--lidar-border)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Points: {info.points}</span>
        <span>RangeMax: {info.rangeMax}</span>
      </div>
    </div>
  );
}
