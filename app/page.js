"use client";
import { useState, useRef } from "react";
import Popup from "../components/Popup";
import LidarRadar from "../components/LidarRadar";
import CmdVelControl from "../components/CmdVelControl";
import MapWithOverlay from "../components/MapWithOverlay";
import TFSubscriber from "../components/TFSubscriber";
import PathViewer from "../components/PathViewer";

export default function Page() {
  const [openLidar, setOpenLidar] = useState(false);
  const [robotPose, setRobotPose] = useState(null);
  const [path, setPath] = useState([]);
  const lidarPointsRef = useRef([]);

  // callback for TF pose update
  function handlePose(p) {
    setRobotPose(p);
  }

  // callback for path
  function handlePath(poses) {
    setPath(poses);
  }

  // We'll create a small helper that transforms incoming /scan into world points
  // For simplicity: LidarRadar logs points in local robot frame; we'll create a lightweight websocket subscriber here
  // Instead, let's use a minimal ROSLIB subscriber to /scan and convert using current robotPose
  // We'll define it inline (client component), but keep it minimal:
  const [rosConnectedForScan, setRosConnectedForScan] = useState(false);

  // Inline subscriber for /scan that fills lidarPointsRef using robotPose transform
  function startScanSubscription() {
    // dynamic import to avoid SSR issues:
    import("roslib").then(ROSLIB => {
      const ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });
      setRosConnectedForScan(true);
      const scanTopic = new ROSLIB.Topic({ ros, name: "/scan", messageType: "sensor_msgs/LaserScan" });
      scanTopic.subscribe((msg) => {
        const ranges = msg.ranges;
        const angle_min = msg.angle_min;
        const angle_inc = msg.angle_increment;
        const max_range = msg.range_max || 10.0;
        const points = [];
        for (let i=0;i<ranges.length;i++){
          const r = ranges[i];
          if (!isFinite(r) || r <= msg.range_min || r > max_range) continue;
          const ang = angle_min + i*angle_inc;
          const rx = Math.cos(ang)*r;
          const ry = Math.sin(ang)*r;
          // if we have robotPose in map frame, transform to map coords (simple 2D transform)
          if (robotPose) {
            const mx = robotPose.x + Math.cos(robotPose.yaw)*rx - Math.sin(robotPose.yaw)*ry;
            const my = robotPose.y + Math.sin(robotPose.yaw)*rx + Math.cos(robotPose.yaw)*ry;
            points.push({ x: mx, y: my });
          }
        }
        lidarPointsRef.current = points;
        // trigger re-render by changing state (cheap way)
        // we toggle a dummy state
        setDummy(d => d+1);
      });
    });
  }

  const [dummy, setDummy] = useState(0);

  return (
    <div style={{ padding: 18 }}>
      <h1>ROS Web — Map + Lidar + Control</h1>

      <div style={{ display:"flex", gap: 12, marginTop: 12 }}>
        <button onClick={() => setOpenLidar(true)}>Open Lidar Popup</button>
        <button onClick={() => startScanSubscription()}>Start Lidar Subscription (overlay)</button>
      </div>

      <div style={{ display:"flex", gap: 12, marginTop: 16 }}>
        <div style={{ width: 560 }}>
          <MapWithOverlay
            robotPose={robotPose}
            lidarPoints={lidarPointsRef.current}
            path={path}
          />
        </div>

        <div style={{ width: 280 }}>
          <h4>Controls</h4>
          <CmdVelControl />
          <div style={{ marginTop: 16 }}>
            <h4>Path</h4>
            <button onClick={() => {/* could send path clear or similar */}}>Clear Path</button>
          </div>
        </div>
      </div>

      <Popup open={openLidar} title="Lidar Popup" onClose={() => setOpenLidar(false)} width={460}>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ flex:1 }}>
            <LidarRadar />
          </div>
          <div style={{ width: 140 }}>
            <div style={{ marginBottom:10 }}>
              <strong>Actions</strong>
            </div>
            <div>
              <button onClick={() => startScanSubscription()}>Overlay Lidar on Map</button>
            </div>
            <div style={{ marginTop:8 }}>
              <em>Note:</em> click Start Lidar Subscription to overlay points on the map.
            </div>
          </div>
        </div>
      </Popup>

      {/* TF subscription for robot pose (base_link) - callbacks update robotPose */}
      <TFSubscriber onPose={handlePose} />

      {/* Path viewer: subscribe /plan (or /global_plan) and update path */}
      <PathViewer topicName="/plan" onPath={handlePath} />
    </div>
  );
}
