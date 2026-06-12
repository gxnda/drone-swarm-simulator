import {AlgorithmId} from "@drone-swarm/shared";
import {Vector3} from "three";

interface WorldConfig {
  readonly droneCount: number;
  readonly worldSize: Vector3;
  // readonly spawnStrategy: SpawnStrategy;
  readonly algorithmId: AlgorithmId;
  // readonly algorithmConfig: AlgorithmConfig;
  // readonly obstacles: ObstacleConfig[];
  readonly seed: number;
  // readonly physics: PhysicsConfig;
}
