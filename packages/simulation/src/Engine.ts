import {World} from "./world/World";
import {NetworkTopology} from "./network/NetworkTopology";
import {
  DroneId,
  SeededRng,
  SimulationConfig,
  SpawnStrategy, WorldSnapshot
} from "@drone-swarm/shared";
import {DroneFactory} from "./drone/DroneFactory";
import {Vector3} from "three";
import {Drone} from "./drone/Drone";
import {ICoordinationAlgorithm} from "./algorithms/ICoordinationAlgorithm";
import {AlgorithmFactory} from "./algorithms/AlgorithmFactory";
import {MessageBus} from "./network/MessageBus";

export class Engine {
  readonly world: World;
  private readonly config: SimulationConfig;
  private topology: NetworkTopology;
  private readonly rng: SeededRng;
  private readonly algorithm: ICoordinationAlgorithm
  private messageBus: MessageBus;
  // private readonly metrics: Something???

  private running: boolean;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.world = new World(config);
    this.rng = new SeededRng(config.seed)
    this.running = false;
    this.world.add(this.createDrones(config.spawnStrategy, config.algorithmConfig.communicationRange));
    this.topology = NetworkTopology.buildFromConfig(
      new Set<Drone>(this.world.getDrones()),
      this.rng,
      config.networkConfig
    );
    this.algorithm = AlgorithmFactory.fromConfig(config.algorithmConfig);
    this.messageBus = new MessageBus(new Map());
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

  private sendAllDueMessages(droneIdMap: Map<DroneId, Drone>, tick: number): void {
    this.messageBus.deliver(droneIdMap, tick)
  }

  public step(): WorldSnapshot {
    this.sendAllDueMessages(this.world.droneIdMap, this.world.tick);

    this.topology.refresh(new Set(this.world.getDrones()));


  }

}