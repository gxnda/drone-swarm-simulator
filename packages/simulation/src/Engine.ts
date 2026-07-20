import {World, WorldView} from "./world/World";
import {NetworkTopology} from "./network/NetworkTopology";
import {
  DroneId, DroneState, Message,
  SeededRng,
  SimulationConfig,
  SpawnStrategy, EngineSnapshot, AlgorithmConfig
} from "@drone-swarm/shared";
import {DroneFactory} from "./drone/DroneFactory";
import {Vector3} from "three";
import {Drone} from "./drone/Drone";
import {ICoordinationAlgorithm} from "./algorithms/ICoordinationAlgorithm";
import {AlgorithmFactory} from "./algorithms/AlgorithmFactory";
import {MessageBus} from "./network/MessageBus";
import {MetricsCollector} from "./metrics/MetricsCollector";

export class Engine {
  readonly world: World;
  private config: SimulationConfig;
  private topology: NetworkTopology;
  private readonly rng: SeededRng;
  private algorithm: ICoordinationAlgorithm
  private messageBus: MessageBus;
  private readonly metrics: MetricsCollector;

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

    this.metrics = new MetricsCollector(config.metricConfig.previousMetricCapacity);
    this.metrics.registerAll();
  }

  public getTopology(): NetworkTopology {
    return this.topology;
  }

  public getMessageBus(): MessageBus {
    return this.messageBus;
  }

  public getAlgorithm(): string {
    return this.algorithm.name;
  }

  public setAlgorithm(algorithm: ICoordinationAlgorithm): void {
    this.algorithm = algorithm;
  }

  public setAlgorithmFromConfig(algorithmConfig: AlgorithmConfig): void {
    this.algorithm = AlgorithmFactory.fromConfig(algorithmConfig);
  }

  public updateFromConfig(config: SimulationConfig) {
    this.config = config;
    this.world.updateFromConfig(config);
    this.topology = NetworkTopology.fromConfig(
      new Set<Drone>(this.world.getDrones()),
      this.rng,
      config.networkConfig
    );
    this.setAlgorithmFromConfig(config.algorithmConfig);
    this.messageBus.clear();
  }

  public kill(id: DroneId) {
    const drone = this.world.droneIdMap.get(id);
    if (!drone) throw new Error("Drone doesn't exist");
    drone.setState(DroneState.FAILED);
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
          this.config.droneMinSpeed,
          this.config.droneMaxAngularAccel
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
      if (drone.minSpeed && velocity.lengthSq() < drone.minSpeed ** 2) {
        velocity = velocity.normalize().multiplyScalar(drone.minSpeed);
      }
      if (drone.maxSpeed && velocity.lengthSq() > drone.maxSpeed ** 2) {
        velocity = velocity.normalize().multiplyScalar(drone.maxSpeed);
      }
      let accel = velocity.clone().sub(lastVelocity);
      if (drone.maxAcceleration && accel.lengthSq() > drone.maxAcceleration ** 2) {
        accel = accel.normalize().multiplyScalar(drone.maxAcceleration);
        velocity = lastVelocity.clone().add(accel);
      }
      // https://math.stackexchange.com/questions/1805810/clamp-angle-between-two-vectors
      if (drone.maxAngularAcceleration && lastVelocity.angleTo(velocity) > drone.maxAngularAcceleration) {
        const currentSpeed = velocity.length();

        const currentHeading = lastVelocity.clone().normalize();
        const targetHeading = velocity.clone().normalize();
        const cosBeta = currentHeading.dot(targetHeading);
        const cosMax = Math.cos(drone.maxAngularAcceleration);

        if (cosBeta < -0.9999) { //
          const up = new Vector3(0, 0, 1);
          if (Math.abs(currentHeading.dot(up)) > 0.99) up.set(1, 0, 0);
          const axis = new Vector3().crossVectors(currentHeading, up).normalize();
          velocity.copy(currentHeading.clone().applyAxisAngle(axis, drone.maxAngularAcceleration));
        } else {
          const perpendicular = targetHeading.clone().sub(currentHeading.clone().multiplyScalar(cosBeta));
          velocity.copy(
            currentHeading.clone().multiplyScalar(cosMax)
              .add(perpendicular.clone().normalize().multiplyScalar(Math.sin(drone.maxAngularAcceleration)))
              .multiplyScalar(currentSpeed)
          );
        }
      }
      drone.velocity = velocity.clone();
      drone.acceleration = accel;
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
      const dict = this.world.bounds.doPreferred(drone.location, drone.velocity, new Vector3());
      drone.location = dict.p;
      drone.velocity = dict.v;
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

  private getMetrics() {
    this.metrics.compute(this);
  }

  public step(): EngineSnapshot {
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

    this.getMetrics();

    this.world.incrementTime();

    return this.snapshot();

  }

  public snapshot(): EngineSnapshot {
    return new EngineSnapshot(
      this.world.snapshot(),
      this.topology.snapshot()
    )
  }

}