import {ILinkModel, LinkQuality} from "../ILinkModel";
import {Drone} from "../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";

export class FreeSpaceModel implements ILinkModel {
  constructor(private readonly range: number) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluate(a: Drone, b: Drone, _rng: SeededRng): LinkQuality | null {
    return a.location.distanceTo(b.location) < this.range ** 2
      ? {latencyTicks: 1, dropProbability: 0}
      : null;
  }
}