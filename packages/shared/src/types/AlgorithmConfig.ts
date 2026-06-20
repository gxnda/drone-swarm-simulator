
interface BaseAlgorithmConfig {
  readonly algorithmId: string;
  readonly communicationRange: number;
  readonly maxSpeed: number;
  readonly maxForce: number; // how quickly it can change direction
}

export interface BoidsConfig extends BaseAlgorithmConfig {
  readonly algorithmId: "boids"
  readonly separationWeight: number
  readonly alignmentWeight: number
  readonly cohesionWeight: number
  readonly separationRange: number
}

export interface GossipConfig extends BaseAlgorithmConfig {
  readonly algorithmId: "gossip"
  // TODO
}

export interface StigmergyConfig extends BaseAlgorithmConfig {
  readonly algorithmId: "stigmergy";
  // TODO
}

export interface ConsensusConfig extends BaseAlgorithmConfig {
  readonly algorithmId: "consensus"
  // TODO
}

export type AlgorithmConfig =
  | BoidsConfig
  | GossipConfig
  | StigmergyConfig
  | ConsensusConfig