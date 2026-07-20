import {Engine} from "../Engine";
import {MetricId, SlidingWindow} from "@drone-swarm/shared";

export interface IMetric {
  readonly name: MetricId;
  readonly description: string;
  stats: SlidingWindow<number>;

  compute(engine: Engine): number;

  reset(): void;
}