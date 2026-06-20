import {ILatencyModel} from "./ILatencyModel";
import {Drone} from "../../../drone/Drone";
import {NetworkTopology} from "../../NetworkTopology";
import {ContentionLatencyConfig, SeededRng} from "@drone-swarm/shared";


/**
 * Increases latency based on the number of neighbours the sender has,
 * this emulates how "busy" the surrounding area is without constantly
 * checking the MessageBus which would be expensive and a PITA.
 */
export class ContentionLatencyModel implements ILatencyModel {
  constructor(readonly config: ContentionLatencyConfig) {}
  //
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getLatency(from: Drone, to: Drone, topology: NetworkTopology, _rng: SeededRng): number {
    return this.config.baseLatencyTicks + Math.round(this.config.addedTicksPerNeighbor * topology.getDegree(from.id));
  }
}