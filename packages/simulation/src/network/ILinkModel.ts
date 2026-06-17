import {Drone} from "../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";

export interface ILinkModel {
  evaluate(a: Drone, b: Drone, rng: SeededRng): LinkQuality | null
}

export interface LinkQuality {
  latencyTicks: number; // ticks before message arrives
  dropProbability: number; // chance 0-1 of message getting lost
}