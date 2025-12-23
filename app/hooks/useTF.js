"use client";

import { useEffect, useRef, useState } from "react";
import * as ROSLIB from "roslib";

export function useTF(ros, onDebug, setLastTfTime) {
  const [pose, setPose] = useState(null);
  const subRef = useRef(null);

  useEffect(() => {
    if (!ros) {
      onDebug?.("TF: ROS not connected");
      return;
    }

    if (subRef.current) return;

    const sub = new ROSLIB.Topic({
      ros,
      name: "/tf",
      messageType: "tf2_msgs/TFMessage",
    });

    sub.subscribe((msg) => {
      try {
        for (const t of msg.transforms) {
          if (t.child_frame_id === "base_link") {
            const { x, y } = t.transform.translation;
            const q = t.transform.rotation;

            const yaw = Math.atan2(
              2 * (q.w * q.z + q.x * q.y),
              1 - 2 * (q.y * q.y + q.z * q.z)
            );

            setPose({ x, y, yaw });
            onDebug?.("TF received");
            setLastTfTime?.(new Date().toLocaleTimeString());
          }
        }
      } catch (err) {
        onDebug?.("TF ERROR: " + err.message);
      }
    });

    subRef.current = sub;

    return () => {
      subRef.current?.unsubscribe();
      subRef.current = null;
      onDebug?.("TF unsubscribed");
    };
  }, [ros]);

  return pose;
}
