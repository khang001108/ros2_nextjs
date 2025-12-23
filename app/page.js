"use client";

import { useState } from "react";
import { useRos } from "./hooks/useRos";
import { useTF } from "./hooks/useTF";
import { useLaserScan } from "./hooks/useLaserScan";

import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import MapCanvas from "./components/MapCanvas";
import DebugPopup from "./components/DebugPopup";
import Popup from "./components/Popup";
import LidarPopup from "./components/LidarPopup";

export default function Page() {
  const [debugLogs, setDebugLogs] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [lastTfTime, setLastTfTime] = useState(null);
  const [openLidar, setOpenLidar] = useState(false);
  const [mapMode, setMapMode] = useState(null);

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
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* HEADER */}
      <Header connected={connected} connect={connect} disconnect={disconnect} />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,                  // ⬅️ ăn toàn bộ chiều cao còn lại
          display: "flex",
          gap: 20,
          padding: 20,
          minHeight: 0,             // ⬅️ FIX flexbox kinh điển
        }}
      >
        {/* LEFT PANEL */}
        <LeftPanel
          ros={ros}
          robotPose={robotPose}
          lidarCount={lidarCount}
          tfOk={tfOk}
          lastScanTime={lastScanTime}
          lastTfTime={lastTfTime}
          openLidar={() => setOpenLidar(true)}
        />

        {/* MAP AREA */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,            // ⬅️ QUAN TRỌNG
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: 12,
              border: "1px solid var(--border)",
              padding: 14,
              flex: 1,               // ⬅️ map chiếm hết
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <h3 style={{ marginBottom: 10 }}>🗺 Map View</h3>

            <div style={{ flex: 1, minHeight: 0 }}>
              <MapCanvas
                robotPose={robotPose}
                lidarPoints={lidarPoints}
                mapMode={mapMode}
                onLoadMap={() => setMapMode("load")}
                onCreateMap={() => setMapMode("create")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DEBUG */}
      <DebugPopup logs={debugLogs} />

      {/* LIDAR POPUP */}
      <Popup open={openLidar} title="Lidar" onClose={() => setOpenLidar(false)}>
        <LidarPopup ros={ros} />
      </Popup>
    </div>
  );
}
