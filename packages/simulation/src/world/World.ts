import {Vector3} from "three";
import {
  DroneId,
  DroneSnapshot,
  SpatialHash,
  WorldSnapshot
} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
import {WorldConfig} from "./WorldConfig";
import {Obstacle} from "./Obstacle";
import {Bounds} from "./Bounds";

/**
 * The world but without any of the drones, gets sent to algorithms to stop
 * any cheating
 */
export class WorldView {
  public size: Vector3;
  public bounds: Bounds;
  public obstacleHash: SpatialHash<Obstacle>;

  constructor(config: WorldConfig) {
    this.size= config.worldSize
    this.bounds = new Bounds(config.boundsMin, config.boundsMax);
    this.obstacleHash = new SpatialHash<Obstacle>(config.chunkSize);
  }

  public isDroneCollidingWithObstacle(drone: Drone): boolean {
    return this.obstacleHash.hasContainingBox(drone.location);
  }
}

export class World extends WorldView {
  public droneHash: SpatialHash<Drone>;

  constructor(config: WorldConfig) {
    super(config)
    this.droneHash = new SpatialHash<Drone>(config.chunkSize);
  }

  public add(drone: Drone): void;
  public add(drone: Drone[]): void;
  public add(o: Obstacle): void;
  public add(o: Obstacle[]): void;
  public add(arg: Drone | Drone[] | Obstacle | Obstacle[]): void {
    if (arg instanceof Drone) {
      this.droneHash.addOne(arg);
    } else if (Array.isArray(arg) && arg.every(item => item instanceof Drone)) {
      this.droneHash.addMany(arg);
    } else if ("box" in arg) {
      this.obstacleHash.addOne(arg);
    } else if (Array.isArray(arg) && arg.every(item => "box" in item)) {
      this.obstacleHash.addMany(arg);
    }
  }

  public getActiveDrones(): Drone[] {
    return this.droneHash.items.filter(drone => drone.isActive());
  }

  public getDroneCount(): number {
    return this.droneHash.items.length;
  }

  public getNeighboursOf(drone: Drone): Drone[] {
    return this.droneHash.neighbouringItem(drone, drone.communicationRange);
  }

  public getNeighboursOfPosition(position: Vector3, range: number): Drone[] {
    return this.droneHash.neighbouringCoord(position, range);
  }

  public getDrone(id: DroneId): Drone | undefined {
    return this.droneHash.items.filter(drone => drone.id === id)[0];
  }

  public isDroneCollidingWithObstacle(drone: Drone): boolean;
  public isDroneCollidingWithObstacle(id: DroneId): boolean;
  public isDroneCollidingWithObstacle(arg: DroneId | Drone): boolean {
    let drone: Drone;
    if (typeof arg === 'string') drone = this.getDrone(arg)!;
    else drone = arg;
    return super.isDroneCollidingWithObstacle(drone!);
  }

  public snapshot(): WorldSnapshot {
    const droneSnapshots = new Array<DroneSnapshot>();
    this.droneHash.items.forEach(drone => {
      droneSnapshots.push(drone.snapshot());
    });
    const serialisedObstacles: {
      type: "box";
      min: [number, number, number];
      max: [number, number, number];
    }[] = [];
    this.obstacleHash.items.forEach(obstacle => {
      serialisedObstacles.push(obstacle.serialise())
    })
    return new WorldSnapshot(droneSnapshots, serialisedObstacles)
  }
}