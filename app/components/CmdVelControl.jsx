"use client";

import * as ROSLIB from "roslib";

export default function CmdVelControl({ ros }) {

  function send(lin, ang) {
    if (!ros) return;

    const pub = new ROSLIB.Topic({
      ros,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });

    pub.publish({
      linear: { x: lin, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: ang },
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button onClick={() => send(0.3, 0)}>↑</button>
      <div>
        <button onClick={() => send(0, 0.6)}>◀</button>
        <button onClick={() => send(0, 0)}>●</button>
        <button onClick={() => send(0, -0.6)}>▶</button>
      </div>
      <button onClick={() => send(-0.3, 0)}>↓</button>
    </div>
  );
}
