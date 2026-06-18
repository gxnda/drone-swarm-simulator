import {Drone} from "../../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";
import {IAttenuationModel} from "./IAttenuationModel";

export class FreeSpaceModel implements IAttenuationModel {
  // literally just checks if the drone is within range of another, that's it
  constructor(private readonly range: number) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDropProbability(a: Drone, b: Drone, _rng: SeededRng): {dropProbability: number} | null {
    return a.location.distanceTo(b.location) < this.range ** 2
      ? {dropProbability: 0}
      : null; // no link
  }
}