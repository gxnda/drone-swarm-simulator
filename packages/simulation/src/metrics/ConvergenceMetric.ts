import {Vector3} from "three";
import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {MetricId, SlidingWindow} from "@drone-swarm/shared";

/**
 * How converged the velocity vectors are
 */
export class ConvergenceMetric implements IMetric {
  public name = "Convergence" as MetricId;
  public description: string = "Average deviation from mean velocity"
  public stats: SlidingWindow<number>;

  constructor(capacity: number) {
    this.stats = new SlidingWindow<number>(capacity);
  }
  public compute(engine: Engine): number {
    let convergence = 0;
    const mean = new Vector3();
    let size: number = 0;

    for (const drone of engine.world.getDrones()) {
      size += 1;
      mean.add(drone.velocity);
    }
    mean.divideScalar(size);

    for (const drone of engine.world.getDrones()) {
      convergence += drone.velocity.clone().sub(mean).lengthSq();
    }
    this.stats.push(convergence / size);
    return convergence / size;
  }

  public reset(): void {
    this.stats.clear();
  }
}