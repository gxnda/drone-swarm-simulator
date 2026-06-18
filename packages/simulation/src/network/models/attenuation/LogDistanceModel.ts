import {Drone} from "../../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";
import {IAttenuationModel} from "./IAttenuationModel";

export interface LogDistanceConfig {
  referenceDistance: number
  referencePathLoss: number
  pathLossExponent: number
  shadowFadingStdDev: number
  receiverSensitivity: number
  maxRange: number
  dropSteepness: number
}

export class LogDistanceModel implements IAttenuationModel {
  // Not a fan of decibels, ts baffling
  constructor(readonly config: LogDistanceConfig,) {
  }

  public getDropProbability(a: Drone, b: Drone, rng: SeededRng): {dropProbability: number} | null {
    const distance = a.location.distanceTo(b.location);
    if (distance > this.config.maxRange) return null;
    // https://en.wikipedia.org/wiki/Log-distance_path_loss_model
    const pathLoss =
      this.config.referencePathLoss +
      10 * this.config.pathLossExponent * Math.log10(distance / this.config.referenceDistance) +
      rng.normal(0, this.config.shadowFadingStdDev);

    // margin: "how much leeway above the minimum signal we've got"
    // I'm also just leaving out how powerful each drones
    // receiver/transmitter is, I'm assuming that they're all the same, and it's
    // mixed into the receiver sensitivity and whatnot.
    const margin = -pathLoss - this.config.receiverSensitivity;
    if (margin < 0) return null; // too weak

    // use a sigmoid about the margin for drop probability
    // note it doesn't have the minus sign before margin so this decreases
    // as margin increases
    const dropProbability = 1 / (1 + Math.exp(margin / this.config.dropSteepness))
    return {dropProbability: dropProbability};
  }


}