import {AlgorithmId} from "@drone-swarm/shared";
import {Vector3} from "three";

export interface WorldConfig {
  readonly droneCount: number;
  readonly worldSize: Vector3;
  readonly chunkSize: number;
  // readonly spawnStrategy: SpawnStrategy;
  readonly algorithmId: AlgorithmId;
  // readonly algorithmConfig: AlgorithmConfig;
  // readonly obstacles: ObstacleConfig[];
  readonly seed: number;
  readonly boundsMin: Vector3;
  readonly boundsMax: Vector3;
  // readonly physics: PhysicsConfig;
}
