import {Engine} from "@drone-swarm/simulation";
import type {
  AddObstacleCommand, CommandType,
  KillDroneCommand,
  RemoveObstacleCommand,
  SetAlgorithmCommand,
  SetConfigCommand,
  SetSpeedCommand,
  SetTickIntervalCommand,
  SimulationCommand,
  StartCommand,
  WorkerMessage,
} from "./WorkerProtocol.ts";
import {
  EngineSnapshot,
  Obstacle,
  type ObstacleId,
  type SimulationConfig
} from "@drone-swarm/shared";

export class SimulationWorker {
  public tickInterval: number = 0.05;
  public speedMultiplier: number = 1;
  public isRunning: boolean = false;
  private engine: Engine | null = null;

  public onMessage(type: CommandType, arg: SimulationCommand): WorkerMessage {
    console.debug("Received message: " + type + arg);
    switch (type) {
      case "START":
        return this.handleStart(arg as StartCommand);
      case "PAUSE":
        return this.handlePause();
      case "RESUME":
        return this.handleResume();
      case "RESET":
        return this.handleReset(arg as StartCommand);
      case "SET_ALGORITHM":
        return this.handleSetAlgorithm(arg as SetAlgorithmCommand);
      case "SET_CONFIG":
        return this.handleSetConfig(arg as SetConfigCommand);
      case "KILL_DRONE":
        return this.handleKillDrone(arg as KillDroneCommand);
      case "SET_SPEED":
        return this.handleSetSpeed(arg as SetSpeedCommand);
      case "SET_TICK_INTERVAL":
        return this.handleSetInterval(arg as SetTickIntervalCommand);
      case "ADD_OBSTACLE":
        return this.addObstacle(arg as AddObstacleCommand);
      case "REMOVE_OBSTACLE":
        return this.removeObstacle(arg as RemoveObstacleCommand);
      case "START_LOOP":
        return this.handleStartLoop();
    }
  }

  public handleStart(start: StartCommand): WorkerMessage {
    console.log("Starting");
    if (this.isRunning) {
      console.debug("Already Running!");
      return "ERROR"
    }
    this.engine = new Engine(start as SimulationConfig);
    this.isRunning = true;
    console.debug("Starting engine with config: ", start);
    this.engine.start();
    this.loop().then();

    return "READY";
  }

  public handlePause(): WorkerMessage {
    if (!this.engine) return "READY";
    this.engine.pause();
    this.isRunning = false;

    return "READY";
  }

  public handleResume(): WorkerMessage {
    if (!this.engine) return "ERROR";
    this.engine.start();
    this.isRunning = true;
    return "READY";
  }

  public handleReset(reset: StartCommand): WorkerMessage {
    this.handlePause();
    return this.handleStart(reset);
  }

  public handleSetAlgorithm(algorithm: SetAlgorithmCommand): WorkerMessage {
    if (!this.engine) return "ERROR";
    this.engine.setAlgorithmFromConfig(algorithm);
    return "READY";
  }

  public handleSetConfig(config: SetConfigCommand): WorkerMessage {
    if (!this.engine) {
      return this.handleStart(config);
    }
    this.engine.updateFromConfig(config);
    return "READY";
  }

  public handleKillDrone(command: KillDroneCommand): WorkerMessage {
    this.engine?.kill(command.id);
    return "READY";
  }

  public handleSetSpeed(command: SetSpeedCommand): WorkerMessage {
    this.speedMultiplier = command.multiplier;
    return "READY";
  }

  public handleSetInterval(command: SetTickIntervalCommand): WorkerMessage {
    this.tickInterval = command.interval;
    return "READY";
  }

  public addObstacle(command: AddObstacleCommand): WorkerMessage {
    this.engine?.world.add(Obstacle.deserialise(command));
    return "READY";
  }

  public removeObstacle(command: RemoveObstacleCommand): WorkerMessage {
    this.engine?.world.removeObstacle(command as ObstacleId);
    return "READY";
  }

  public handleStartLoop(): WorkerMessage {
    this.loop().then();
    return "READY";
  }

  public tick(): WorkerMessage {
    if (this.engine) {
      const snapshot: EngineSnapshot = this.engine.step();
      return { type: "SNAPSHOT", snapshot };
    } else {
      return "ERROR"
    }
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async loop() {
    let snapshot: WorkerMessage;
    while (this.isRunning) {
      const start = performance.now();
      snapshot = this.tick();
      if (snapshot === "ERROR") {
        console.error(snapshot + "in main loop");
        break;
      } else {
        postMessage(snapshot);
      }
      const end = performance.now();
      await this.delay(Math.max(this.tickInterval - (end - start), 0));
    }
  }
}

const worker = new SimulationWorker();
self.onmessage = (event: MessageEvent) => {
  worker.onMessage(event.data.type, event.data.command)
}