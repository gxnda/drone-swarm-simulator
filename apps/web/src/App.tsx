// App.tsx
import {CanvasMount} from "./canvas/CanvasMount.tsx";
import type {DroneId} from "@drone-swarm/shared";
import {useRef, useState} from "react";
import type {SimulationCanvas} from "./canvas/SimulationCanvas.ts";

function App() {
  const simRef = useRef<SimulationCanvas | null>(null);
  // const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DroneId | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handlePause = () => simRef.current?.pause();
  const handleResume = () => simRef.current?.resume();
  const handleKillDrone = (id: DroneId) => simRef.current?.killDrone(id);

  return (
    <div className="app">
      <CanvasMount
        controlsRef={simRef}
        onReady={() => setIsReady(true)}
        // onSnapshot={(snap) => setMetrics(snap.metrics)}
        onDroneSelected={setSelectedDrone}
      />
    </div>
  );
}

export default App;