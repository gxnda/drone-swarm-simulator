import {AlgorithmId} from "../AlgorithmId";

interface BaseAlgorithmConfig {
  readonly id: AlgorithmId;
  readonly communicationRange: number;
}

export interface BoidsConfig extends BaseAlgorithmConfig {
  readonly id: "boids" & {__brand: "AlgorithmId"};
  readonly separationWeight: number
  readonly alignmentWeight: number
  readonly cohesionWeight: number
  readonly separationRange: number
}

export interface GossipConfig extends BaseAlgorithmConfig {
  readonly id: "gossip" & {__brand: "AlgorithmId"};
  // TODO
}

export interface StigmergyConfig extends BaseAlgorithmConfig {
  readonly id: "stigmergy" & {__brand: "AlgorithmId"};
  // TODO
}

export interface ConsensusConfig extends BaseAlgorithmConfig {
  readonly id: "consensus" & {__brand: "AlgorithmId"};
  // TODO
}

export type AlgorithmConfig =
  | BoidsConfig
  | GossipConfig
  | StigmergyConfig
  | ConsensusConfig