import {Drone} from "../../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";
import {Vector3} from "three";

export interface IAttenuationModel {
  getDropProbability(
    a: Drone,
    b: Drone,
    rng: SeededRng,
  ): {dropProbability: number} | null;

  getDropProbabilityAtLocation?(
    a: Vector3,
    b: Vector3,
    rng: SeededRng,
  ): {dropProbability: number} | null
}