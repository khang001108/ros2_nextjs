"use client";
import { useState, useRef } from "react";
import * as ROSLIB from "roslib";

export function useRos(url, onDebug) {
  const [connected, setConnected] = useState(false);
  const rosRef = useRef(null);

  function connect() {
    if (rosRef.current) return;

    const ros = new ROSLIB.Ros({ url });

    ros.on("connection", () => {
      setConnected(true);
      onDebug?.("ROS Connected");
    });

    ros.on("error", (err) => {
      onDebug?.("WebSocket Error: " + err.toString());
    });

    ros.on("close", () => {
      setConnected(false);
      rosRef.current = null;
      onDebug?.("ROS Closed");
    });

    rosRef.current = ros;
  }

  function disconnect() {
    if (rosRef.current) {
      rosRef.current.close();
      rosRef.current = null;
    }
    setConnected(false);
    onDebug?.("ROS Disconnected");
  }

  return { ros: rosRef.current, connected, connect, disconnect };
}
