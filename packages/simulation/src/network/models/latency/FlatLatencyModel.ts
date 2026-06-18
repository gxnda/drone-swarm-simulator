import {ILatencyModel} from "./ILatencyModel";

export class FlatLatencyModel implements ILatencyModel {
  constructor(readonly ticks: number = 1) {}

  public getLatency(): number {
    return this.ticks;
  }
}