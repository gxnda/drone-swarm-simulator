import {
  type AlgorithmConfig, type DroneId,
  EngineSnapshot, Obstacle, type ObstacleId,
  type SimulationConfig
} from "@drone-swarm/shared";
import type {
  SetTickIntervalCommand,
  SimulationCommand,
  WorkerMessage
} from "./WorkerProtocol.ts";

export class WorkerBridge {
  private worker: Worker;

  public onSnapshot: ((snapshot: EngineSnapshot) => void) | null = null;
  public onError: ((message: string) => void) | null = null;
  public onReady: (() => void) | null = null;

  public isReady: boolean = false;

  constructor() {
    this.worker = new Worker("src/worker/simulation.worker.ts", {type: "module"});
    this.worker.onmessage = (e: MessageEvent) => {this.handleMessage(e)};
  }

  public handleMessage(message: MessageEvent) {
    switch (message.type as WorkerMessage) {
      case "READY":
        this.isReady = true;
        return this.onReady?.();
      case "ERROR":
        return this.onError?.(message.data);
      default:
        return this.onSnapshot?.(message.data.snapshot);
    }
  }

  public start(config: SimulationConfig) {
    console.debug("bridge: posting start")
    this.worker.postMessage({
      type: "START",
      command: config as SimulationCommand,
    });
  }

  public pause() {
    this.worker.postMessage({
      type: "PAUSE"
    })
  }

  public resume() {
    this.worker.postMessage({
      type: "RESUME"
    })
  }

  public reset(config: SimulationConfig) {
    this.worker.postMessage({
      type: "RESET",
      command: config as SimulationCommand,
    })
  }

  public setAlgorithm(algorithmConfig: AlgorithmConfig) {
    this.worker.postMessage({
      type: "SET_ALGORITHM",
      command: algorithmConfig as SimulationCommand,
    })
  }

  public setConfig(config: SimulationConfig) {
    this.worker.postMessage({
      type: "SET_CONFIG",
      command: config as SimulationCommand,
    })
  }

  public killDrone(id: DroneId) {
    this.worker.postMessage({
      type: "KILL_DRONE",
      command: {id: id} as SimulationCommand,
    })
  }

  public setSpeed(multiplier: number) {
    this.worker.postMessage({
      type: "SET_SPEED",
      command: {multiplier: multiplier} as SimulationCommand,
    })
  }

  public setInterval(interval: number) {
    this.worker.postMessage({
      type: "SET_TICK_INTERVAL",
      command: {interval: interval} as SetTickIntervalCommand,
    })
  }

  public addObstacle(obstacle: Obstacle) {
    this.worker.postMessage({
      type: "ADD_OBSTACLE",
      command: obstacle.serialise() as SimulationCommand,
    })
  }

  public removeObstacle(obstacleId: ObstacleId) {
    this.worker.postMessage({
      type: "REMOVE_OBSTACLE",
      command: obstacleId,
    })
  }

  public startLoop() {
    this.worker.postMessage({
      type: "START_LOOP",
    })
  }

  public destroy() {
    this.worker.terminate();
  }
}