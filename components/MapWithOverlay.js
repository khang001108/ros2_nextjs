"use client";
import React, { useRef, useEffect, useState } from "react";

export default function MapWithOverlay({
  rosUrl = "ws://localhost:9090",
  robotPose = null,
  lidarPoints = [],
  path = []
}) {

  const canvasRef = useRef();
  const [ROSLIB, setROSLIB] = useState(null);
  const [mapMsg, setMapMsg] = useState(null);

  // Load roslib dynamically (avoid SSR crash)
  useEffect(() => {
    import("roslib").then(module => {
      const ROS = module.default || module;
      setROSLIB(ROS);
    });
  }, []);

  // Subscribe /map after ROSLIB loaded
  useEffect(() => {
    if (!ROSLIB) return;

    const ros = new ROSLIB.Ros({ url: rosUrl });
    const mapTopic = new ROSLIB.Topic({
      ros,
      name: "/map",
      messageType: "nav_msgs/OccupancyGrid"
    });

    const cb = (msg) => setMapMsg(msg);

    mapTopic.subscribe(cb);

    return () => {
      mapTopic.unsubscribe(cb);
      ros.close();
    };
  }, [ROSLIB, rosUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapMsg) return;

    const ctx = canvas.getContext("2d");
    const width = mapMsg.info.width;
    const height = mapMsg.info.height;
    const res = mapMsg.info.resolution;
    const origin = mapMsg.info.origin;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width / 4 + "px";
    canvas.style.height = height / 4 + "px";

    // draw map grayscale
    const img = ctx.createImageData(width, height);

    for (let i = 0; i < mapMsg.data.length; i++) {
      const v = mapMsg.data[i];
      let c;
      if (v === -1) c = 180;
      else if (v === 0) c = 255;
      else c = 0;
      img.data[i * 4 + 0] = c;
      img.data[i * 4 + 1] = c;
      img.data[i * 4 + 2] = c;
      img.data[i * 4 + 3] = 255;
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    tmpCanvas.getContext("2d").putImageData(img, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(tmpCanvas, 0, -height);
    ctx.restore();

    // convert map coords → pixel coords
    function mapToPixel(mx, my) {
      const ox = origin.position.x;
      const oy = origin.position.y;
      const px = Math.round((mx - ox) / res);
      const py = Math.round((my - oy) / res);
      return { x: px, y: height - py - 1 };
    }

    // draw path
    if (path.length > 0) {
      ctx.strokeStyle = "rgba(0,200,80,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      path.forEach((p, i) => {
        const pos = p.pose.position;
        const pix = mapToPixel(pos.x, pos.y);
        if (i === 0) ctx.moveTo(pix.x, pix.y);
        else ctx.lineTo(pix.x, pix.y);
      });

      ctx.stroke();
    }

    // draw robot pose
    if (robotPose) {
      const pix = mapToPixel(robotPose.x, robotPose.y);
      ctx.fillStyle = "rgba(255,80,0,0.95)";
      ctx.beginPath();
      ctx.arc(pix.x, pix.y, 6, 0, Math.PI * 2);
      ctx.fill();

      const len = 14;
      const hx = pix.x + Math.cos(robotPose.yaw) * len;
      const hy = pix.y - Math.sin(robotPose.yaw) * len;

      ctx.strokeStyle = "rgba(255,180,0,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pix.x, pix.y);
      ctx.lineTo(hx, hy);
      ctx.stroke();
    }

    // draw lidar points
    ctx.fillStyle = "rgba(0,200,255,0.9)";
    lidarPoints.forEach((p) => {
      const pix = mapToPixel(p.x, p.y);
      ctx.fillRect(pix.x - 1, pix.y - 1, 2, 2);
    });

  }, [mapMsg, robotPose, lidarPoints, path]);

  return (
    <div>
      <div>Map (OccupancyGrid)</div>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #666", imageRendering: "pixelated" }}
      />
    </div>
  );
}
