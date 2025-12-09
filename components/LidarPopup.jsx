"use client";

import * as ROSLIB from "roslib";
import { useState } from "react";

export default function LidarPopup() {
  const [status, setStatus] = useState("Chưa kết nối");
  const [ros, setRos] = useState(null);

  function connectLidar() {
    const _ros = new ROSLIB.Ros({
      url: "ws://localhost:9090"
    });

    _ros.on("connection", () => {
      setStatus("🟢 Đã kết nối ROS");

      const scanTopic = new ROSLIB.Topic({
        ros: _ros,
        name: "/scan",
        messageType: "sensor_msgs/LaserScan"
      });

      scanTopic.subscribe((msg) => {
        console.log("Lidar:", msg.ranges.slice(0, 5)); // Test
      });
    });

    _ros.on("error", () => setStatus("🔴 Lỗi kết nối"));
    _ros.on("close", () => setStatus("🟡 Mất kết nối"));

    setRos(_ros);
  }

  return (
    <div>
      <p>Trạng thái: {status}</p>

      <button
        onClick={connectLidar}
        style={{
          padding: "10px 20px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginTop: "10px"
        }}
      >
        Kết nối Lidar
      </button>
    </div>
  );
}
