import {AlgorithmConfig} from "@drone-swarm/shared";
import {ICoordinationAlgorithm} from "./ICoordinationAlgorithm";

export class AlgorithmFactory {
  static fromConfig(config: AlgorithmConfig): ICoordinationAlgorithm {
    switch (config.algorithmId) {
      case "boids":
        // TODO
        throw new Error("Not implemented.");
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