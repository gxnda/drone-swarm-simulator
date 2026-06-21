import {World, WorldView} from "./world/World";
import {NetworkTopology} from "./network/NetworkTopology";
import {
  DroneId, Message,
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
import {DroneState} from "./drone/DroneState";

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
    this.topology = NetworkTopology.fromConfig(
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
      const drone = new Drone(
          `${i}` as DroneId,
          locations[i]!,
          range,
          this.config.droneMaxSpeed,
          this.config.droneMaxAccel,
        );
      drone.velocity = new Vector3(1,0,0)
      drones.push(drone)
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

  private updateDroneStates(drones: ReadonlySet<Drone>): void {
    drones.forEach((drone) => {
      const degree = this.topology.getDegree(drone.id);
      if (degree === 0) drone.setState(DroneState.ISOLATED);
      else drone.setState(DroneState.ACTIVE);
    })
  }

  private computeAllDesiredVelocities(drones: ReadonlySet<Drone>): Map<Drone, Vector3> {
    const vels: Map<Drone, Vector3> = new Map();
    drones.forEach((drone) => {
      const neighbours: Drone[] = []
      this.topology.getNeighbours(drone.id).forEach((nId) => {
        neighbours.push(this.world.droneIdMap.get(nId)!)
      })
      vels.set(drone, this.algorithm.computeDesiredVelocity(drone, neighbours, WorldView.fromWorld(this.world)))
    })
    return vels
  }

  private computeAllMessages(drones: ReadonlySet<Drone>): Map<Drone, readonly Message[]> {
    const messages: Map<Drone, readonly Message[]> = new Map();
    drones.forEach((drone) => {
      const neighbours: Drone[] = []
      this.topology.getNeighbours(drone.id).forEach((nId) => {
        neighbours.push(this.world.droneIdMap.get(nId)!)
      })
      messages.set(drone, this.algorithm.computeOutgoingMessages(drone, neighbours, WorldView.fromWorld(this.world)))
    })
    return messages;
  }

  private applyAndClampVelocities(drones: ReadonlySet<Drone>, velocities: Map<Drone, Vector3>): void {
    drones.forEach((drone) => {
      const lastVelocity = drone.velocity.clone();
      let velocity = velocities.get(drone)!.clone();
      if (drone.maxSpeed && velocity.lengthSq() > drone.maxSpeed ** 2) {
        velocity = velocity.normalize().multiplyScalar(drone.maxSpeed);
      }
      let accel = velocity.clone().sub(lastVelocity);
      if (drone.maxAcceleration && accel.lengthSq() > drone.maxAcceleration ** 2) {
        accel = accel.normalize().multiplyScalar(drone.maxAcceleration);
        velocity = lastVelocity.clone().add(accel);
      }
      drone.velocity = velocity.clone();
    })
  }

  private addMessagesToBus(messages: Map<Drone, readonly Message[]>): void {
    messages.forEach((msgs, drone) => {
      msgs.forEach((msg) => {
        this.messageBus.send(msg, this.world.tick, this.topology.getQuality(drone.id, msg.recipient), this.rng);
      });
    })
  }

  private applyObstacleAvoidance(_drones: ReadonlySet<Drone>) {
    // TODO
  }

  private applyBoundaryBehaviour(drones: ReadonlySet<Drone>) {
    drones.forEach((drone) => {
      drone.velocity = this.world.bounds.doPreferred(drone.location, drone.velocity, new Vector3());
    })
  }

  private applyVelocity(drones: ReadonlySet<Drone>) {
    drones.forEach((drone) => {
      drone.location.add(drone.velocity);
    })
  }

  private updateDroneOrientations(drones: ReadonlySet<Drone>) {
    drones.forEach((drone) => {
      drone.rotateToMatchVelocityWithBanking()
    })
  }

  private clearInboxes(drones: ReadonlySet<Drone>) {
    drones.forEach((drone) => drone.clearInbox())
  }

  private getMetrics(_drones: ReadonlySet<Drone>) {
    // TODO
  }

  public step(): WorldSnapshot {
    this.sendAllDueMessages(this.world.droneIdMap, this.world.tick);
    const drones: ReadonlySet<Drone> = this.world.getDrones();
    this.topology.refresh(drones);
    this.updateDroneStates(drones);
    const desiredVelocities = this.computeAllDesiredVelocities(drones);
    const messages = this.computeAllMessages(drones);
    this.addMessagesToBus(messages);

    this.applyAndClampVelocities(drones, desiredVelocities);
    this.applyObstacleAvoidance(drones);

    this.applyVelocity(drones);
    this.applyBoundaryBehaviour(drones);

    this.updateDroneOrientations(drones);
    this.clearInboxes(drones);

    this.getMetrics(drones);

    this.world.incrementTime();

    return this.world.snapshot();

  }

}