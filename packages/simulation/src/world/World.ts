import {Vector3} from "three";
import {
  DroneId,
  DroneSnapshot, SimulationConfig,
  SpatialHash,
  WorldSnapshot
} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
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
  public tick: number;
  public elapsedSec: number;

  constructor(config: SimulationConfig) {
    this.size = config.worldSize
    this.bounds = new Bounds(config.boundsMin, config.boundsMax);
    this.obstacleHash = new SpatialHash<Obstacle>(config.chunkSize);
    this.tick = 0;
    this.elapsedSec = 0;
  }

  public isDroneCollidingWithObstacle(drone: Drone): boolean {
    return this.obstacleHash.hasContainingBox(drone.location);
  }

  public incrementTick(): number {
    this.tick += 1;
    return this.tick;
  }
}

export class World extends WorldView {
  public readonly droneHash: SpatialHash<Drone>;

  // TODO: Is there a better place to put this? This only serves to map
  //  messageBus messages in Engine
  public readonly droneIdMap: Map<DroneId, Drone> = new Map();

  constructor(config: SimulationConfig) {
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
      this.droneIdMap.set(arg.id, arg);
    } else if (Array.isArray(arg) && arg.every(item => item instanceof Drone)) {
      this.droneHash.addMany(arg);
      arg.forEach(drone => this.droneIdMap.set(drone.id, drone));
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

  public getDrones(): Drone[] {
    return this.droneHash.items;
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
    return new WorldSnapshot(droneSnapshots, serialisedObstacles, this.tick)
  }
}