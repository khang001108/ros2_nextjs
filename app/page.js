"use client";

import { useState } from "react";
import { useRos } from "./hooks/useRos";
import { useTF } from "./hooks/useTF";
import { useLaserScan } from "./hooks/useLaserScan";

import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import MapCanvas from "./components/MapCanvas";
import Popup from "./components/Popup";
import LidarPopup from "./components/LidarPopup";

export default function Page() {
  const [debugLogs, setDebugLogs] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [lastTfTime, setLastTfTime] = useState(null);
  const [openLidar, setOpenLidar] = useState(false);

  const onDebug = (msg) => {
    console.log(msg);
    setDebugLogs((prev) => [...prev, msg]);
  };

  const { ros, connected, connect, disconnect } = useRos(
    "ws://localhost:9090",
    onDebug
  );

  const robotPose = useTF(ros, onDebug, setLastTfTime);
  const tfOk = !!robotPose;

  const lidarPoints = useLaserScan(
    ros,
    "/scan",
    robotPose,
    onDebug,
    setLastScanTime
  );
  const lidarCount = lidarPoints.length;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header connected={connected} connect={connect} disconnect={disconnect} />

      <div style={{ display: "flex", gap: 20, padding: 20 }}>
        <LeftPanel
          ros={ros}
          robotPose={robotPose}
          lidarCount={lidarCount}
          tfOk={tfOk}
          lastScanTime={lastScanTime}
          lastTfTime={lastTfTime}
          debugLogs={debugLogs}
          openLidar={() => setOpenLidar(true)}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "#0d1117",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #222",
              width: 640,
            }}
          >
            <h3 style={{ marginBottom: 10 }}>🗺 Map View</h3>

            <MapCanvas
              width={612}
              height={460}
              robotPose={robotPose}
              lidarPoints={lidarPoints}
            />
          </div>
        </div>
      </div>

      <Popup open={openLidar} title="Lidar" onClose={() => setOpenLidar(false)}>
        <LidarPopup ros={ros} />
      </Popup>
    </div>
  );
}
