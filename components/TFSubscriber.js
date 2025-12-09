"use client";
import { useEffect, useState } from "react";

export default function TFSubscriber({
  rosUrl = "ws://localhost:9090",
  targetFrame = "base_link",
  globalFrame = "map",
  onPose
}) {
  const [ROSLIB, setROSLIB] = useState(null);

  // Load roslib dynamically — tránh SSR crash
  useEffect(() => {
    import("roslib").then((module) => {
      const ROS = module.default || module;
      setROSLIB(ROS);
    });
  }, []);

  useEffect(() => {
    if (!ROSLIB) return;

    const ros = new ROSLIB.Ros({ url: rosUrl });

    const tfTopic = new ROSLIB.Topic({
      ros,
      name: "/tf",
      messageType: "tf2_msgs/TFMessage",
    });

    const cb = (msg) => {
      if (!msg.transforms) return;

      for (const t of msg.transforms) {
        try {
          const child = t.child_frame_id || t.header.frame_id;

          if (child !== targetFrame) continue;

          const tr = t.transform;
          const px = tr.translation.x;
          const py = tr.translation.y;
          const q = tr.rotation;

          // tính yaw từ quaternion
          const yaw =
            Math.atan2(
              2 * (q.w * q.z + q.x * q.y),
              1 - 2 * (q.y * q.y + q.z * q.z)
            );

          if (onPose) onPose({ x: px, y: py, yaw });
        } catch (e) {}
      }
    };

    tfTopic.subscribe(cb);

    return () => {
      tfTopic.unsubscribe(cb);
      ros.close();
    };
  }, [ROSLIB, rosUrl, targetFrame, globalFrame, onPose]);

  return null;
}
