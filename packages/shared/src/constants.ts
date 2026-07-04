import {
  BoundaryBehaviour,
  SimulationConfig
} from "./types/configs/SimulationConfig";
import {Vector3} from "three";
import {AlgorithmId} from "./types/AlgorithmId";
import {BoidsConfig} from "./types/configs/AlgorithmConfig";

export enum Constants {
}

export const DEFAULT_CONFIG: SimulationConfig = {
  boundsMax: new Vector3(100, 100, 100),
  boundsMin: new Vector3(-100, -100, -100),
  chunkSize: 10,
  preferredBoundaryBehaviour: BoundaryBehaviour.REFLECT,
  seed: "test",
  spawnStrategy: {
    type: "random",
    count: 10,
    boundMin: new Vector3(-100, -100, -100),
    boundMax: new Vector3(100, 100, 100),
  },
  algorithmConfig: {
    id: "boids" as AlgorithmId,
    name: "Boids",
    description: "Boids algorithm",
    cohesionWeight: 0.3,
    separationWeight: 2,
    alignmentWeight: 3,
    maxSpeed: 5,
    maxAccel: 0.0001,
    communicationRange: 5,
    separationRange: 3
  } as BoidsConfig,
  networkConfig: {
    latencyConfig: {
      type: "FlatLatencyConfig",
      ticks: 1
    },
    attenuationConfig: {
      type: "FreeSpaceConfig",
      range: 10
    }
  },
  obstacles: [],
  droneMaxSpeed: 5,
  droneMaxAccel: 1,
  worldSize: new Vector3(200, 200, 200)
};
