import {ISnapshot} from "./ISnapshot";
import {LinkQuality} from "./LinkQuality";
import {DroneId, DroneIdPair} from "./DroneId";

export class TopologySnapshot extends ISnapshot {
  constructor(
    public readonly adjacency: Map<DroneId, Set<DroneId>>,
    public readonly qualities: Map<DroneIdPair, LinkQuality>,
  ) {
    super();
  }
}