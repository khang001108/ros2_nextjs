"use client";
import React, { useRef, useEffect, useState } from "react";

export default function LidarRadar({ rosUrl = "ws://localhost:9090", autoConnect=false }) {
  const canvasRef = useRef();
  const scanRef = useRef(null);

  const [ROSLIB, setROSLIB] = useState(null);
  const [ros, setRos] = useState(null);
  const [connected, setConnected] = useState(false);

  // Load roslib ONLY on client
  useEffect(() => {
    import("roslib").then(module => {
      const ROS = module.default || module;
      setROSLIB(ROS);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (ros) ros.close();
    };
  }, [ros]);

  function connect() {
    if (!ROSLIB) return;
    if (ros) return;

    const _ros = new ROSLIB.Ros({ url: rosUrl });

    _ros.on("connection", () => setConnected(true));
    _ros.on("close", () => setConnected(false));
    _ros.on("error", () => setConnected(false));

    const scanTopic = new ROSLIB.Topic({
      ros: _ros,
      name: "/scan",
      messageType: "sensor_msgs/LaserScan"
    });

    scanTopic.subscribe(msg => {
      scanRef.current = msg;
    });

    setRos(_ros);
  }

  useEffect(() => {
    if (autoConnect && ROSLIB) connect();

    let raf;
    const canvas = canvasRef.current;

    function draw() {
      if (!canvas) return (raf = requestAnimationFrame(draw));

      const ctx = canvas.getContext("2d");
      const w = canvas.width = 400;
      const h = canvas.height = 400;

      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0,0,w,h);

      const cx = w/2, cy = h/2;

      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      for (let r=1;r<=5;r++){
        ctx.beginPath();
        ctx.arc(cx, cy, (r/5)*(w*0.45), 0, Math.PI*2);
        ctx.stroke();
      }

      const scan = scanRef.current;
      if (scan) {
        ctx.save();
        const { ranges, angle_min, angle_increment } = scan;
        const max_range = scan.range_max || 10;

        for (let i=0;i<ranges.length;i++) {
          const r = ranges[i];
          if (!isFinite(r) || r <= scan.range_min || r > max_range) continue;

          const angle = angle_min + i*angle_increment;
          const radius = (r / max_range) * (w*0.45);

          const x = cx + Math.cos(angle) * radius;
          const y = cy - Math.sin(angle) * radius;

          ctx.fillStyle = "rgba(0,200,255,0.8)";
          ctx.beginPath();
          ctx.arc(x,y,2,0,Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ROSLIB, ros, autoConnect]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems:"center", marginBottom:8 }}>
        <button onClick={connect} style={{ padding: "8px 12px" }}>Kết nối Lidar</button>
        <div>{connected ? "🟢 Kết nối" : "⚪ Chưa kết nối"}</div>
      </div>
      <canvas ref={canvasRef} width={400} height={400} style={{ borderRadius:8, background:"#07101a" }} />
    </div>
  );
}
