import {Vector3} from "three";
import {
  DroneId,
  DroneSnapshot,
  SpatialHash,
  WorldSnapshot
} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
import {WorldConfig} from "./WorldConfig";
import {Obstacle, serialise} from "./Obstacle";

export class World {
  public size: Vector3;
  public droneHash: SpatialHash<Drone>;
  public obstacleHash: SpatialHash<Obstacle>;

  constructor(config: WorldConfig) {
    this.size = config.worldSize
    this.droneHash = new SpatialHash<Drone>(config.chunkSize);
    this.obstacleHash = new SpatialHash<Obstacle>(config.chunkSize);
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

  public isDroneColliding(drone: Drone): boolean;
  public isDroneColliding(id: DroneId): boolean;
  public isDroneColliding(arg: DroneId | Drone): boolean {
    if (typeof arg === 'string') {
      const location = this.getDrone(arg)!.location;
      return this.obstacleHash.hasContainingBox(location);
    } else {
      const location = arg.location;
      return this.obstacleHash.hasContainingBox(location);
    }
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
      serialisedObstacles.push(serialise(obstacle))
    })
    return new WorldSnapshot(droneSnapshots, serialisedObstacles)
  }
}