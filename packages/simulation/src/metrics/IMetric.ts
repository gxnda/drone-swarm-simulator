import {Engine} from "../Engine";
import {MetricId} from "@drone-swarm/shared";

export interface IMetric {
  readonly name: MetricId;
  readonly description: string;
  stats: number[];

  compute(engine: Engine): number;

  reset(): void;
}