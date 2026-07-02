import {Drone} from "../../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";
import {IAttenuationModel} from "./IAttenuationModel";
import {Vector3} from "three";

export class FreeSpaceModel implements IAttenuationModel {
  // literally just checks if the drone is within range of another, that's it
  constructor(private readonly range: number) {}
  getDropProbability(a: Drone, b: Drone, _rng: SeededRng): {dropProbability: number} | null {
    return this.getDropProbabilityAtLocation(a.location, b.location, _rng);
  }

  getDropProbabilityAtLocation(a: Vector3, b: Vector3, _rng: SeededRng): {
    dropProbability: number
  } | null {
    return a.distanceTo(b) < this.range ** 2
      ? {dropProbability: 0}
      : null; // no link

  }
}