"use client";
import { useRef, useEffect } from "react";

export default function MapCanvas({ width=800, height=600, robotPose, lidarPoints=[] }) {
  const canvasRef = useRef(null);
  const zoomRef = useRef(65);
  const offsetRef = useRef({ x: width/2, y: height/2 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;

    function draw() {
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, width, height);

      const z = zoomRef.current;

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      for (let x = offsetRef.current.x % z; x < width; x += z) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = offsetRef.current.y % z; y < height; y += z) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      ctx.save();
      ctx.translate(offsetRef.current.x, offsetRef.current.y);

      // Lidar
      ctx.fillStyle = "rgba(255,80,80,0.9)";
      lidarPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x * z, -p.y * z, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Robot
      if (robotPose) {
        ctx.save();
        ctx.translate(robotPose.x * z, -robotPose.y * z);
        ctx.rotate(-robotPose.yaw);
        ctx.fillStyle = "#4ea1ff";
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
  }, [robotPose, lidarPoints]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
