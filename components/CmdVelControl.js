"use client";
import React, { useState, useEffect } from "react";

export default function CmdVelControl({ rosUrl="ws://localhost:9090" }) {
  const [ROSLIB, setROSLIB] = useState(null);
  const [ros, setRos] = useState(null);
  const [cmdVelTopic, setCmdVelTopic] = useState(null);

  // Load roslib dynamically
  useEffect(() => {
    import("roslib").then(module => {
      const ROS = module.default || module;   // FIX QUAN TRỌNG
      setROSLIB(ROS);
    });
  }, []);

  // Create ros connection + topic
  useEffect(() => {
    if (!ROSLIB) return;

    const r = new ROSLIB.Ros({ url: rosUrl });
    const topic = new ROSLIB.Topic({
      ros: r,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });

    setRos(r);
    setCmdVelTopic(topic);

    return () => {
      topic.unsubscribe();
      r.close();
    };
  }, [ROSLIB]);

  // Send cmd_vel
  function sendCmd(x, z) {
    if (!ROSLIB || !cmdVelTopic) return;

    // 🔥 Đây là FIX CHUẨN
    const msg = new ROSLIB.Message({
      linear: { x, y: 0, z: 0 },
      angular: { x: 0, y: 0, z },
    });

    cmdVelTopic.publish(msg);
  }

  return (
    <div>
      <h4>CMD VEL Control</h4>

      <button onClick={() => sendCmd(0.2, 0)}>⬆ Forward</button>
      <button onClick={() => sendCmd(-0.2, 0)}>⬇ Back</button>
      <button onClick={() => sendCmd(0, 1)}>⬅ Left</button>
      <button onClick={() => sendCmd(0, -1)}>➡ Right</button>

      <button onClick={() => sendCmd(0, 0)}>⏹ Stop</button>
    </div>
  );
}
