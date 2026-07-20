import {
  BoundaryBehaviour,
  SimulationConfig
} from "./types/configs/SimulationConfig";
import { Vector3 } from "three";
import { AlgorithmId } from "./types/AlgorithmId";
import { BoidsConfig } from "./types/configs/AlgorithmConfig";
import {MetricConfig} from "./types/configs/MetricConfig";

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
    communicationRange: 10,
    id: "boids" as AlgorithmId,
    separationWeight: 4,
    alignmentWeight: 1,
    cohesionWeight: 0.5,
    separationRange: 5
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
  droneMaxSpeed: 1,
  droneMinSpeed: 1,
  droneMaxAccel: 1,
  droneMaxAngularAccel: 1,
  droneCommunicationRange: 6,
  worldSize: new Vector3(200, 200, 200),
  metricConfig: {
    previousMetricCapacity: 50
  } as MetricConfig,
} as SimulationConfig;
