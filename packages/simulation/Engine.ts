import {World} from "./src/world/World";

export class Engine {
  public world: World;
  private running: boolean;

  constructor(world: World) {
    this.world = world;
    this.running = false;
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
    // fairly basic for now, just moves each drone according to its velocity
    // and acceleration (if any)
    this.world.getDrones().forEach(drone => drone.tick);
    return this.world;
  }
}