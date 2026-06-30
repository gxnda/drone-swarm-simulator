import {Vector3} from "three";
import {
  AlgorithmConfig,
  DroneId,
  DroneSnapshot,
  NetworkConfig,
  ObstacleId,
  SimulationConfig,
  SpatialHash,
  SpawnStrategy,
  WorldSnapshot
} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
import {Obstacle} from "@drone-swarm/shared";
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
  public dt: number;
  public elapsedSec: number;

  constructor(config: SimulationConfig) {
    this.size = config.worldSize
    this.bounds = new Bounds(config.boundsMin, config.boundsMax, config.preferredBoundaryBehaviour);
    this.obstacleHash = new SpatialHash<Obstacle>(config.chunkSize);
    this.tick = 0;
    this.dt = config.dt ?? 1;
    this.elapsedSec = 0;
  }

  static fromWorld(world: World): WorldView {
    return new WorldView({
      chunkSize: world.obstacleHash.chunkSize,
      worldSize: world.size,
      boundsMin: world.bounds.min,
      boundsMax: world.bounds.max,
      networkConfig: {} as NetworkConfig,
      seed: 0,
      algorithmConfig: {} as AlgorithmConfig,
      spawnStrategy: {} as SpawnStrategy,
    } as SimulationConfig)
  }

  public isDroneCollidingWithObstacle(drone: Drone): boolean {
    return this.obstacleHash.hasContainingBox(drone.location);
  }

  public incrementTime(): number {
    this.tick += 1;
    this.elapsedSec += this.dt;
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

  public updateFromConfig(config: SimulationConfig) {
    this.size = config.worldSize;
    this.bounds = new Bounds(config.boundsMin, config.boundsMax, config.preferredBoundaryBehaviour);
    const items = this.obstacleHash.items;
    this.obstacleHash = new SpatialHash<Obstacle>(config.chunkSize);
    this.obstacleHash.addMany(items);
    this.dt = config.dt ?? this.dt;

    this.droneIdMap.values().forEach(drone => {
      drone.minSpeed = config.droneMinSpeed ?? drone.minSpeed;
      drone.maxSpeed = config.droneMaxSpeed ?? drone.maxSpeed;
      drone.maxAcceleration = config.droneMaxAccel ?? drone.maxAcceleration;
      drone.communicationRange = config.algorithmConfig.communicationRange ?? drone.communicationRange;
    })
  }

  public removeObstacle(oId: ObstacleId): void {
    let toRemove: Obstacle | null = null;
    this.obstacleHash.items.forEach(obstacle => {
      if (obstacle.id === oId) {
        toRemove = obstacle;
      }
    })
    if (toRemove === null) {
      console.warn(`Obstacle with ID ${oId} not found`);
      return;
    } else {
      this.obstacleHash.removeItem(toRemove);
    }
  }

  public getActiveDrones(): Drone[] {
    return new Array(...this.droneHash.items).filter(drone => drone.isActive());
  }

  public getDroneCount(): number {
    return this.droneHash.items.size;
  }

  public getNeighboursOf(drone: Drone): Drone[] {
    return this.droneHash.neighbouringItem(drone, drone.communicationRange);
  }

  public getNeighboursOfPosition(position: Vector3, range: number): Drone[] {
    return this.droneHash.neighbouringCoord(position, range);
  }

  public getDrone(id: DroneId): Drone | undefined {
    for (const drone of this.droneHash.items) {
      if (drone.id === id) return drone;
    }
    return undefined;
  }

  public getDrones(): ReadonlySet<Drone> {
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
      id: string,
      min: [number, number, number];
      max: [number, number, number];
    }[] = [];
    this.obstacleHash.items.forEach(obstacle => {
      serialisedObstacles.push(obstacle.serialise())
    })
    return new WorldSnapshot(droneSnapshots, serialisedObstacles, this.tick)
  }
}