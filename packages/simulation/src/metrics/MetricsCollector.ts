import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {CohesionMetric} from "./CohesionMetric";
import {ConvergenceMetric} from "./ConvergenceMetric";
import {CoverageMetric} from "./CoverageMetric";
import {MessageComplexityMetric} from "./MessageComplexityMetric";
import {PartitionMetric} from "./PartitionMetric";

export class MetricsCollector {
  private readonly metrics: Set<IMetric> = new Set();

  public register(metric: IMetric): void {
    this.metrics.add(metric);
  }

  public registerAll() {
    this.register(new CohesionMetric());
    this.register(new ConvergenceMetric());
    this.register(new CoverageMetric());
    this.register(new MessageComplexityMetric());
    this.register(new PartitionMetric());
    // this.register(new FaultToleranceMetric());
  }

  public get(): Map<string, number[]> {
    const statsPerMetric = new Map<string, number[]>();
    this.metrics.forEach(metric => {
      statsPerMetric.set(metric.name, metric.stats)
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