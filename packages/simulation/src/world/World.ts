import {Vector3} from "three";
import {
  DroneId,
  DroneSnapshot,
  SpatialHash,
  WorldSnapshot
} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
import {WorldConfig} from "./WorldConfig";

export class World {
  public size: Vector3;
  public spatialHash: SpatialHash<Drone>;

  constructor(config: WorldConfig) {
    this.size = config.worldSize
    this.spatialHash = new SpatialHash<Drone>(config.chunkSize);
  }

  public addDrone(drone: Drone): void {
    this.spatialHash.addOne(drone);
  }

  public addDrones(drones: Drone[]): void {
    this.spatialHash.addMany(drones);
  }

  public getDrones(): Drone[] {
    return this.spatialHash.items;
  }

  public getActiveDrones(): Drone[] {
    return this.spatialHash.items.filter(drone => drone.isActive());
  }

  public getDroneCount(): number {
    return this.spatialHash.items.length;
  }

  public getNeighboursOf(drone: Drone): Drone[] {
    return this.spatialHash.neighbouringItem(drone, drone.communicationRange);
  }

  public getNeighboursOfPosition(position: Vector3, range: number): Drone[] {
    return this.spatialHash.neighbouringCoord(position, range);
  }

  public getDrone(id: DroneId): Drone | undefined {
    return this.spatialHash.items.filter(drone => drone.id === id)[0];
  }

  public snapshot(): WorldSnapshot {
    const droneSnapshots = new Array<DroneSnapshot>();
    this.spatialHash.items.forEach(drone => {
      droneSnapshots.push(drone.snapshot());
    });
    return new WorldSnapshot(droneSnapshots)
  }

}