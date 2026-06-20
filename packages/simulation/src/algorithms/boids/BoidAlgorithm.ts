import {AlgorithmId, BoidsConfig, Message} from "@drone-swarm/shared";
import {ICoordinationAlgorithm} from "../ICoordinationAlgorithm";
import {Drone} from "../../drone/Drone";
import {WorldView} from "../../world/World";
import {Vector3} from "three";
import {BoidStateMessage, BoidStatePayload} from "./BoidMessage";

/**
 * Boids rely on three things
 * - Separation: Avoids crowding
 *
 */
export class BoidAlgorithm implements ICoordinationAlgorithm {
  readonly description: string = "Boids Algorithm";
  readonly id: AlgorithmId;
  readonly name: string = "Boids"

  constructor(readonly config: BoidsConfig) {
    this.id = config.id
  }

  computeDesiredVelocity(
    drone: Readonly<Drone>,
    neighbours: ReadonlyArray<Readonly<Drone>>,
    _world: Readonly<WorldView>
  ): Vector3 {
    // if no neighbours, just keep swimming :)
    if (!neighbours) return drone.velocity.clone();

    const cohesion = this.computeCohesion(drone, neighbours).multiplyScalar(this.config.cohesionWeight);
    const separation = this.computeSeparation(drone, neighbours).multiplyScalar(this.config.separationWeight);
    const alignment = this.computeAlignment(neighbours).multiplyScalar(this.config.alignmentWeight);
    return cohesion.add(separation).add(alignment);
  }

  public makeStateMessage(drone: Readonly<Drone>): BoidStateMessage {
    return {
      payload: {
        location: drone.location,
        velocity: drone.velocity
      } as BoidStatePayload,
      sender: drone.id
    } as BoidStateMessage;
  }

  /**
   * Just sends an announcement saying where it is and what its velocity is
   * Boids doesn't really need any complex announcements
   */
  computeOutgoingMessages(drone: Readonly<Drone>, _neighbours: ReadonlyArray<Readonly<Drone>>, _world: Readonly<WorldView>): ReadonlyArray<Message> {
    return [this.makeStateMessage(drone)]
  }

  initialise(_drones: ReadonlyArray<Drone>, _config: BoidsConfig): void {
    return;
  }

  private computeCohesion(drone: Readonly<Drone>, neighbours: ReadonlyArray<Readonly<Drone>>): Vector3 {
    return neighbours.reduce(
      (acc, neighbour) =>
        acc.add(neighbour.location), new Vector3(0, 0, 0))
      .divideScalar(neighbours.length)
      .sub(drone.location)
      .normalize();
  }

  private computeSeparation(drone: Readonly<Drone>, neighbours: ReadonlyArray<Readonly<Drone>>): Vector3 {
    const separation = new Vector3();
    neighbours.forEach((neighbour) => {
      const dist = drone.location.distanceTo(neighbour.location);
      if (dist > 1e-6) {
        separation.add(
          drone.location.clone()
            .sub(neighbour.location)
            .normalize()
            .divideScalar(dist)
        )
      }
    })
    return separation;
  }

  private computeAlignment(neighbours: ReadonlyArray<Readonly<Drone>>): Vector3 {
    return neighbours.reduce(
      (acc, drone) =>
        acc.add(drone.velocity), new Vector3(0, 0, 0)
    ).divideScalar(neighbours.length);
  }

  private doPhysicsNormalisations(curVel: Vector3, nextVel: Vector3): Vector3 {
    if (nextVel.lengthSq() > this.config.maxSpeed ** 2) {
      nextVel.normalize().multiplyScalar(this.config.maxSpeed);
    }
    // check maximum acceleration
    const accel = nextVel.clone().sub(curVel);
    if (accel.lengthSq() > this.config.maxAccel ** 2) {
      accel.normalize().multiplyScalar(this.config.maxAccel);
      nextVel = curVel.clone().add(accel);
    }
    return nextVel;
  }

  // onDroneFailed(failedId: DroneId, survivors: ReadonlyArray<Drone>): void {
  // }
  // onPartitionHealed(components: DroneId[][]): void {
  // }

}