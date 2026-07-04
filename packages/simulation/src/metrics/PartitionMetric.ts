import {IMetric} from "./IMetric";
import {Engine} from "../Engine";

export class PartitionMetric implements IMetric {
  public name: string = "Partition";
  public description: string = "How many partitions are in the network topology";
  public stats: number[] = [];

  public compute(engine: Engine): number {
    const partitions = engine.getTopology().getConnectedComponents().size;
    this.stats.push(partitions);
    return partitions;
  }

  public reset(): void {
    this.stats = [];
  }
}
