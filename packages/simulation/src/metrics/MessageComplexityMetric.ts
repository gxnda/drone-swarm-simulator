/**
 * Basically just messages sent per tick
 */
import {IMetric} from "./IMetric";
import {Engine} from "../Engine";


export class MessageComplexityMetric implements IMetric {
  public readonly name: string = "MessageComplexity";
  public readonly description: string = "Total messages sent per tick"
  public stats: number[] = [];

  public compute(engine: Engine): number {
    const metric = engine.getMessageBus().getTotalSentThisTick();
    this.stats.push(metric);
    return metric
  }

  public reset() {
    this.stats = [];
  }
}
