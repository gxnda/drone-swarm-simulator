import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {CohesionMetric} from "./CohesionMetric";
import {ConvergenceMetric} from "./ConvergenceMetric";
import {MessageFrequencyMetric} from "./MessageFrequencyMetric";
import {PartitionMetric} from "./PartitionMetric";
import {MessageSizeMetric} from "./MessageSizeMetric";
import {MetricId, SlidingWindow} from "@drone-swarm/shared";

export class MetricsCollector {
  private readonly metrics: Set<IMetric> = new Set();
  readonly activeMetrics: Map<MetricId, boolean> = new Map();

  constructor(readonly capacity: number) {}

  public register(metric: IMetric): void {
    this.metrics.add(metric);
    this.activeMetrics.set(metric.name, true);
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

  public get(): Map<MetricId, SlidingWindow<number>> {
    const statsPerMetric = new Map<MetricId, SlidingWindow<number>>();
    this.metrics.forEach(metric => {
      statsPerMetric.set(metric.name, metric.stats)
    })
    return statsPerMetric;
  }

  public compute(engine: Engine): void {
    const start = performance.now();
    this.metrics.forEach(metric => {
      if (this.activeMetrics.get(metric.name)!) {
        metric.compute(engine);
      } else {
        // flushes the metric out with -1 instead of maintaining stale
        metric.stats.push(-1);
      }
    });
    const end = performance.now();
    console.debug(`Metrics took ${end - start} to compute`);
  }

  public reset(): void {
    this.metrics.forEach(metric => metric.reset());
  }
}