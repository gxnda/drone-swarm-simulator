import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {MetricId, SlidingWindow} from "@drone-swarm/shared";

export class PartitionMetric implements IMetric {
  public name = "Partition" as MetricId;
  public description: string = "How many partitions are in the network topology";
  public stats: SlidingWindow<number>;

  constructor(capacity: number) {
    this.stats = new SlidingWindow<number>(capacity);
  }

  public compute(engine: Engine): number {
    const partitions = engine.getTopology().getConnectedComponents().size;
    this.stats.push(partitions);
    return partitions;
  }

  public reset(): void {
    this.stats.clear();
  }
}
