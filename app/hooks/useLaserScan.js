"use client";

import { useEffect, useRef, useState } from "react";
import * as ROSLIB from "roslib";

export function useLaserScan(
  ros,
  topic = "/scan",
  robotPose = null,
  onDebug,
  setLastScanTime,
  throttleMs = 50
) {
  const [pts, setPts] = useState([]);
  const lastUpdate = useRef(0);
  const subRef = useRef(null);

  useEffect(() => {
    if (!ros) {
      onDebug?.("LaserScan: ROS not connected");
      return;
    }

    if (subRef.current) return;

    const sub = new ROSLIB.Topic({
      ros,
      name: topic,
      messageType: "sensor_msgs/LaserScan",
    });

    sub.subscribe((msg) => {
      const now = Date.now();
      if (now - lastUpdate.current < throttleMs) return;
      lastUpdate.current = now;

      try {
        if (!msg.ranges?.length) {
          onDebug?.("LaserScan: empty scan");
          return;
        }

        onDebug?.("Scan received");
        setLastScanTime?.(new Date().toLocaleTimeString());

        const { ranges, angle_min, angle_increment } = msg;
        const arr = [];

        for (let i = 0; i < ranges.length; i++) {
          const r = ranges[i];
          if (!isFinite(r) || r < msg.range_min || r > msg.range_max) continue;

          const ang = angle_min + i * angle_increment;
          let x = Math.cos(ang) * r;
          let y = Math.sin(ang) * r;

          if (robotPose) {
            const wx =
              robotPose.x +
              Math.cos(robotPose.yaw) * x -
              Math.sin(robotPose.yaw) * y;

            const wy =
              robotPose.y +
              Math.sin(robotPose.yaw) * x +
              Math.cos(robotPose.yaw) * y;

            arr.push({ x: wx, y: wy });
          } else {
            arr.push({ x, y });
          }
        }

        setPts(arr);
        onDebug?.(`LaserScan: ${arr.length} pts`);

      } catch (err) {
        onDebug?.("LaserScan ERROR: " + err.message);
      }
    });

    subRef.current = sub;
    onDebug?.(`LaserScan subscribed: ${topic}`);

    return () => {
      subRef.current?.unsubscribe();
      subRef.current = null;
      onDebug?.("LaserScan unsubscribed");
    };
  }, [ros]);

  return pts;
}
