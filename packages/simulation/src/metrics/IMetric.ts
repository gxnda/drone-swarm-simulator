import {Engine} from "../Engine";

export interface IMetric {
  readonly name: string;
  readonly description: string;
  stats: number[];

  compute(engine: Engine): number;

  reset(): void;
}