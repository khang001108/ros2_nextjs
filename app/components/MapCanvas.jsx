"use client";
import { useRef, useEffect } from "react";

function cssVar(name, fallback) {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback
  );
}

export default function MapCanvas({
  robotPose,
  lidarPoints = [],
  mapMode,
  onLoadMap,
  onCreateMap,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const zoomRef = useRef(65);
  const offsetRef = useRef({ x: 0, y: 0 });

  // ===== resize canvas theo container =====
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function resize() {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      offsetRef.current.x = canvas.width / 2;
      offsetRef.current.y = canvas.height / 2;
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ===== draw map =====
  useEffect(() => {
    if (!mapMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frame;

    function draw() {
      const w = canvas.width;
      const h = canvas.height;

      const bg = cssVar("--bg-main", "#0d1117");
      const grid = cssVar("--grid", "rgba(255,255,255,0.05)");
      const lidarColor = cssVar("--lidar", "rgba(255,80,80,0.9)");
      const robotColor = cssVar("--robot", "#4ea1ff");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const z = zoomRef.current;

      // grid
      ctx.strokeStyle = grid;
      for (let x = offsetRef.current.x % z; x < w; x += z) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = offsetRef.current.y % z; y < h; y += z) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(offsetRef.current.x, offsetRef.current.y);

      // lidar
      ctx.fillStyle = lidarColor;
      lidarPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * z, -p.y * z, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // robot
      if (robotPose) {
        ctx.save();
        ctx.translate(robotPose.x * z, -robotPose.y * z);
        ctx.rotate(-robotPose.yaw);
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -8);
        ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      frame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(frame);
  }, [robotPose, lidarPoints, mapMode]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--bg-main)",
      }}
    >
      <canvas ref={canvasRef} />

      {!mapMode && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--bg-panel)",
              padding: 28,
              borderRadius: 14,
              border: "1px solid var(--border)",
              minWidth: 320,
              textAlign: "center",
            }}
          >
            <h3 style={{ marginTop: 0 }}>No Map Selected</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button
                onClick={onLoadMap}
                style={{
                  padding: "12px",
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                📂 Load Existing Map
              </button>

              <button
                onClick={onCreateMap}
                style={{
                  padding: "12px",
                  background: "var(--success)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                🧭 Create New Map (SLAM)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
