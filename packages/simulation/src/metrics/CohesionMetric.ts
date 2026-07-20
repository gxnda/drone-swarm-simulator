import {Vector3} from "three";
import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {MetricId, SlidingWindow} from "@drone-swarm/shared";


export class CohesionMetric implements IMetric {
  public stats: SlidingWindow<number>;
  public name = "Cohesion" as MetricId;
  public description: string = "Average distance from centre of mass";

  constructor(capacity: number) {
    this.stats = new SlidingWindow<number>(capacity);
  }

  public compute(engine: Engine): number {
    let cohesion = 0;
    const mean = new Vector3();
    let size: number = 0;

    for (const drone of engine.world.getDrones()) {
      size += 1;
      mean.add(drone.location);
    }
    mean.divideScalar(size);

    for (const drone of engine.world.getDrones()) {
      cohesion += drone.location.clone().sub(mean).lengthSq();
    }
    this.stats.push(cohesion / size);
    return cohesion / size;
  }

  public reset(): void {
    this.stats = new SlidingWindow<number>(this.stats.capacity);
  }
}