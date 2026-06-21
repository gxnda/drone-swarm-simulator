import {Vector3} from "three";
import {SpawnStrategy} from "./SpawnStrategy";
import {AlgorithmConfig} from "./AlgorithmConfig";
import {NetworkConfig} from "./NetworkConfig";

export interface SimulationConfig {
  readonly droneMaxSpeed: number;
  readonly droneMaxAccel: number; // max acceleration per tick
  readonly worldSize: Vector3;
  readonly dt?: number;
  readonly chunkSize: number;
  readonly spawnStrategy: SpawnStrategy;
  readonly algorithmConfig: AlgorithmConfig;
  readonly networkConfig: NetworkConfig;
  // readonly obstacles: ObstacleConfig[];
  readonly seed: number | string;
  readonly boundsMin: Vector3;
  readonly boundsMax: Vector3;
  readonly preferredBoundaryBehaviour: BoundaryBehaviour
  // readonly physics: PhysicsConfig;
}

export enum BoundaryBehaviour {
  CLAMP = "CLAMP",
  REFLECT = "REFLECT",
  WRAP = "WRAP",
}