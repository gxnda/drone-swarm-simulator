import { useState } from "react";

interface ControlPanelProps {
  isRunning: boolean,
  speedMultiplier: number,
  currentTick: number,
  droneCount: number,
  onPlay: () => void,
  onPause: () => void,
  onReset: () => void,
  onStep: () => void,
  onSpeedChange: (newMultiplier: number) => void,
  onDroneCountChange: (newDroneCount: number) => void,
}

function ControlPanel({
  isRunning,
  speedMultiplier,
  currentTick,
  droneCount,
  onPlay,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
  onDroneCountChange
}: ControlPanelProps) {
  const [_, setIsRunning] = useState(isRunning);
  return (
    <div className="control-panel">
      <button id="play-pause" onClick={() => {
        setIsRunning(!isRunning);
        isRunning ? onPlay() : onPause;
      }}>
        {isRunning ? "Pause" : "Play"}
      </button>

      <label htmlFor="speed-slider"></label>
      <input
        id="speed-slider"
        type="number"
        min={0.1}
        max={10}
        step={0.1}
        value={speedMultiplier}
        onChange={(e) => { onSpeedChange(e.target.valueAsNumber) }}
      ></input>

    </div >
  )
}

export default ControlPanel;
