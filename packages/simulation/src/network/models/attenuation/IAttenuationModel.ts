import {Drone} from "../../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";

export interface IAttenuationModel {
  getDropProbability(
    a: Drone,
    b: Drone,
    rng: SeededRng,
  ): {dropProbability: number} | null;
}