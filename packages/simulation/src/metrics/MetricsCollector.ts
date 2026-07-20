import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {CohesionMetric} from "./CohesionMetric";
import {ConvergenceMetric} from "./ConvergenceMetric";
import {MessageFrequencyMetric} from "./MessageFrequencyMetric";
import {PartitionMetric} from "./PartitionMetric";
import {MessageSizeMetric} from "./MessageSizeMetric";
import {MetricId} from "@drone-swarm/shared";

export class MetricsCollector {
  private readonly metrics: Set<IMetric> = new Set();

  constructor(readonly capacity: number) {}

  public register(metric: IMetric): void {
    this.metrics.add(metric);
  }

  public registerAll() {
    this.register(new CohesionMetric(this.capacity));
    this.register(new ConvergenceMetric(this.capacity));
    this.register(new MessageFrequencyMetric(this.capacity));
    this.register(new MessageSizeMetric(this.capacity));
    this.register(new PartitionMetric(this.capacity));
    // this.register(new CoverageMetric());
    // this.register(new FaultToleranceMetric());
  }

  public get(): Map<MetricId, number[]> {
    const statsPerMetric = new Map<MetricId, number[]>();
    this.metrics.forEach(metric => {
      statsPerMetric.set(metric.name, metric.stats.toArray())
    })
    return statsPerMetric;
  }

  public compute(engine: Engine): void {
    const start = performance.now();
    this.metrics.forEach(metric => {
      metric.compute(engine);
    });
    const end = performance.now();
    console.debug(`Metrics took ${end - start} to compute`);
  }

  public reset(): void {
    this.metrics.forEach(metric => metric.reset());
  }
}