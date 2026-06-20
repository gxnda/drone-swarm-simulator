import {
  AlgorithmConfig,
  AlgorithmId,
  DroneId,
  Message,
} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
import {WorldView} from "../world/World";
import {Vector3} from "three";

export interface ICoordinationAlgorithm {
  readonly id: AlgorithmId;
  readonly name: string;
  readonly description: string;

  initialise(drones: ReadonlyArray<Drone>, config: AlgorithmConfig): void

  computeDesiredVelocity(
    drone: Readonly<Drone>,
    neighbours: ReadonlyArray<Readonly<Drone>>,
    world: Readonly<WorldView>,
  ): Vector3

  computeOutgoingMessages(
    drone: Readonly<Drone>,
    neighbours: ReadonlyArray<Readonly<Drone>>,
    world: Readonly<WorldView>,
  ): ReadonlyArray<Message>

  onDroneFailed?(failedId: DroneId, survivors: ReadonlyArray<Drone>): void

  onPartitionHealed?(components: DroneId[][]): void
}