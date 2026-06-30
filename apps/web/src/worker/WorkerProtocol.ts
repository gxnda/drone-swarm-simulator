import {
  type AlgorithmConfig, type SimulationConfig, type DroneId,
  EngineSnapshot, type SerialisedObstacle, type ObstacleId
} from "@drone-swarm/shared";

export type CommandType =
  | "START"
  | "PAUSE"
  | "RESUME"
  | "RESET"
  | "SET_ALGORITHM"
  | "SET_CONFIG"
  | "KILL_DRONE"
  | "SET_SPEED"
  | "SET_TICK_INTERVAL"
  | "ADD_OBSTACLE"
  | "REMOVE_OBSTACLE"
  | "START_LOOP"

export type WorkerMessage =
  | {type: "SNAPSHOT", snapshot: EngineSnapshot}
  | "ERROR"
  | "READY";

export type StartCommand = SimulationConfig;
export type SetAlgorithmCommand = AlgorithmConfig;
export type SetConfigCommand = SimulationConfig;
export type KillDroneCommand = {id: DroneId};
export type SetSpeedCommand = { multiplier: number; }
export type SetTickIntervalCommand = { interval: number; }
export type AddObstacleCommand = SerialisedObstacle;
export type RemoveObstacleCommand = ObstacleId;

export type SnapshotMessage = {snapshot: EngineSnapshot};
export type ReadyMessage = { message: "ready"}

export type SimulationCommand =
  | StartCommand
  | SetAlgorithmCommand
  | SetSpeedCommand
  | KillDroneCommand
  | SetConfigCommand
  | AddObstacleCommand
  | RemoveObstacleCommand
  | SetTickIntervalCommand
