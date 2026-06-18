import {Drone} from "../../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";

export interface IAttenuationModel {
  getProbability(
    a: Drone,
    b: Drone,
    rng: SeededRng,
  ): {dropProbability: number} | null;
}