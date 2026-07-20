/**
 * Basically just messages sent per tick
 */
import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {MetricId, SlidingWindow} from "@drone-swarm/shared";


export class MessageFrequencyMetric implements IMetric {
  public readonly name = "MessageComplexity" as MetricId;
  public readonly description: string = "Total messages sent per tick"
  public stats: SlidingWindow<number>;

  constructor(capacity: number) {
    this.stats = new SlidingWindow<number>(capacity);
  }

  public compute(engine: Engine): number {
    const metric = engine.getMessageBus().getTotalSentThisTick();
    this.stats.push(metric);
    return metric
  }

  public reset() {
    this.stats.clear();
  }
}
