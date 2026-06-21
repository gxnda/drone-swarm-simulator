import {AlgorithmConfig, BoidsConfig} from "@drone-swarm/shared";
import {ICoordinationAlgorithm} from "./ICoordinationAlgorithm";
import {BoidAlgorithm} from "./boids/BoidAlgorithm";

export class AlgorithmFactory {
  static fromConfig(config: AlgorithmConfig): ICoordinationAlgorithm {
    switch (config.id) {
      case "boids":
        return new BoidAlgorithm(config as BoidsConfig);
      case "gossip":
        // TODO
        throw new Error("Not implemented.");
      case "stigmergy":
        // TODO
        throw new Error("Not implemented.");
      case "consensus":
        // TODO
        throw new Error("Not implemented.");
      default:
        throw new Error("Unknown algorithmId");
    }
  }

}