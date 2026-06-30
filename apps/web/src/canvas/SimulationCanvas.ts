import {RenderPipeline} from "@drone-swarm/renderer";
import {WorkerBridge} from "../worker/WorkerBridge.ts";
import {
  type AlgorithmConfig,
  DEFAULT_CONFIG,
  type DroneId,
  EngineSnapshot, Obstacle, type ObstacleId, type SimulationConfig
} from "@drone-swarm/shared";

export class SimulationCanvas  {
  public canvas: HTMLCanvasElement;
  public pipeline: RenderPipeline | null = null;
  public bridge: WorkerBridge;
  public latestSnapshot: EngineSnapshot | null = null;
  public animationFrameId: number | null = null;

  private pipelineReady: Promise<void>;

  public isRunning = false;
  public isReady = false;

  public onReady: (() => void) | null = null;
  public onSnapshot: ((snapshot: EngineSnapshot) => void) | null = null;
  public onDroneSelected: ((id: DroneId | null) => void) | null = null;
  public onError: (() => void) | null = null;

  public resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.addEventListener('click', (event: MouseEvent) => {
      this.handleCanvasClick(event.clientX, event.clientY);
    });

    this.latestSnapshot = null;

    this.onReady = (() => this.isReady = true);
    this.onError = (() => console.error("somethings gone wrong in worker!"));
    this.onDroneSelected = ((id: DroneId | null) => (this.pipeline?.selectDrone(id)));

    this.bridge = this.initialiseBridge();

    this.pipelineReady = this.initialisePipeline().then((pipeline) => {
      this.pipeline = pipeline;
    });

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.handleResize(entry);
      }
    });
    this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
  }

  public async initialisePipeline() {
    return RenderPipeline.create(this.canvas, DEFAULT_CONFIG)
  }

  public initialiseBridge(): WorkerBridge {
    const bridge = new WorkerBridge();
    bridge.onSnapshot = (snapshot: EngineSnapshot) => {
      this.latestSnapshot = snapshot ?? null;
      this.onSnapshot?.(snapshot);
    };
    bridge.onReady = () => {
      this.isReady = true;
      this.onReady?.();
    }
    bridge.onError = () => {
      console.error("somethings gone wrong in worker!");
      this.onError?.();
    }
    return bridge;
  }

  public async start(config: SimulationConfig): Promise<void> {
    console.debug("Starting simulation...");
    await this.pipelineReady;
    this.pipeline?.setConfig(config);
    this.startRenderLoop();
    this.bridge.start(config);
    this.bridge.startLoop();
  }

  public destroy(): void {
    this.stopRenderLoop();
    this.bridge.pause();
    this.resizeObserver.disconnect();
    this.bridge.destroy()
    this.pipeline?.dispose();
  }

  public renderFrame() {
    if (this.latestSnapshot) {
      this.pipeline?.update(this.latestSnapshot);
    }
    this.pipeline?.render();
    this.animationFrameId = requestAnimationFrame(this.renderFrame.bind(this));
  }

  public startRenderLoop(): void {
    this.isRunning = true;
    this.animationFrameId = requestAnimationFrame(this.renderFrame.bind(this));
  }

  public stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public handleCanvasClick(x: number, y: number): void {
    if (this.pipeline) {
      const droneId = this.pipeline?.getDroneAtScreenPosition(x, y);
      this.onDroneSelected?.(droneId);
    }
  }

  public handleResize(entry: ResizeObserverEntry): void {
    this.pipeline?.resize(entry.contentRect.width, entry.contentRect.height);
  }

  public pause(): void {this.bridge.pause();}
  public resume(): void {this.bridge.resume();}
  public reset(config: SimulationConfig): void {this.bridge.reset(config);}
  public setAlgorithm(config: AlgorithmConfig): void {this.bridge.setAlgorithm(config);}
  public setSpeed(multiplier: number): void {this.bridge.setSpeed(multiplier);}
  public killDrone(id: DroneId): void {this.bridge.killDrone(id);}
  public addObstacle(o: Obstacle): void {this.bridge.addObstacle(o);}
  public removeObstacle(id: ObstacleId): void {this.bridge.removeObstacle(id);}
}