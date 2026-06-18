import {Drone} from "../../../drone/Drone";
import {SeededRng} from "@drone-swarm/shared";
import {NetworkTopology} from "../../NetworkTopology";

export interface ILatencyModel {
  getLatency(
    from: Drone,
    to: Drone,
    topology: NetworkTopology,
    rng: SeededRng
  ): number // ticks
}