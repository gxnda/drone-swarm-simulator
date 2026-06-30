import {type RefObject, useEffect, useRef} from "react";
import {SimulationCanvas} from "./SimulationCanvas.ts";
import {DEFAULT_CONFIG, type DroneId} from "@drone-swarm/shared";

export function CanvasMount(
  {
    onReady,
    onDroneSelected,
    controlsRef,
  }: {
    onReady: () => void;
    onDroneSelected: (id: DroneId | null) => void;
    controlsRef: RefObject<SimulationCanvas | null>; // lets user use controls
  }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(width || window.innerWidth));
    canvas.height = Math.max(1, Math.floor(height || window.innerHeight));
    const sim = new SimulationCanvas(canvasRef.current!);
    sim.onReady = onReady;
    sim.onDroneSelected = onDroneSelected;
    // sim.onSnapshot = (snap) => onMetricsUpdate(snap.metrics);
    controlsRef.current = sim;
    sim.start(DEFAULT_CONFIG).then();
    return () => sim.destroy();
  }, [controlsRef, onDroneSelected, onReady]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}