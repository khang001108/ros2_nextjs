"use client";
import { useEffect, useState } from "react";

export default function PathViewer({
  rosUrl = "ws://localhost:9090",
  topicName = "/plan",
  onPath
}) {
  const [ROSLIB, setROSLIB] = useState(null);

  // Load roslib dynamically (avoid SSR crash)
  useEffect(() => {
    import("roslib").then((module) => {
      const ROS = module.default || module;
      setROSLIB(ROS);
    });
  }, []);

  useEffect(() => {
    if (!ROSLIB) return;

    const ros = new ROSLIB.Ros({ url: rosUrl });

    const pathTopic = new ROSLIB.Topic({
      ros,
      name: topicName,
      messageType: "nav_msgs/Path",
    });

    const cb = (msg) => {
      if (onPath) onPath(msg.poses || []);
    };

    pathTopic.subscribe(cb);

    return () => {
      pathTopic.unsubscribe(cb);
      ros.close();
    };
  }, [ROSLIB, rosUrl, topicName, onPath]);

  return null;
}
