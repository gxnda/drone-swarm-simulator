import {AlgorithmConfig, BoidsConfig, RandomWaypointConfig} from "@drone-swarm/shared";
import {ICoordinationAlgorithm} from "./ICoordinationAlgorithm";
import {BoidAlgorithm} from "./boids/BoidAlgorithm";
import {RandomWaypointAlgorithm} from "./random-waypoint/RandomWaypointAlgorithm";

export class AlgorithmFactory {
    static fromConfig(config: AlgorithmConfig): ICoordinationAlgorithm {
        switch (config.id) {
            case "random-waypoint":
                return new RandomWaypointAlgorithm(config as RandomWaypointConfig);
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