import {World} from "./src/world/World";
import {NetworkTopology} from "./src/network/NetworkTopology";
import {
  DroneId,
  SeededRng,
  SimulationConfig,
  SpawnStrategy
} from "@drone-swarm/shared";
import {DroneFactory} from "./src/drone/DroneFactory";
import {Vector3} from "three";
import {Drone} from "./src/drone/Drone";

export class Engine {
  readonly world: World;
  private readonly topology: NetworkTopology;
  private rng: SeededRng;

  private running: boolean;

  constructor(config: SimulationConfig) {
    this.world = new World(config);
    this.rng = new SeededRng(config.seed)
    this.running = false;
    this.world.add(this.createDrones(config.spawnStrategy, config.algorithmConfig.communicationRange));
    this.topology = NetworkTopology.buildFromConfig(
      new Set<Drone>(this.world.getDrones()),
      this.rng,
      config.networkConfig
    );
  }

  private createDrones(strategy: SpawnStrategy, range: number): Drone[] {
    const locations: Vector3[] = DroneFactory.spawn(strategy, this.rng);
    const drones: Drone[] = [];
    for (let i = 0; i < locations.length; i++) {
      drones.push(new Drone(
        `${1}` as DroneId,
        locations[i],
        range
      ))
    }
    return drones;
  }

  public start(): void {
    this.running = true;
  }

  public isRunning(): boolean {
    return this.running;
  }

  public pause(): void {
    this.running = false;
  }

  public step(): World {
  }

}