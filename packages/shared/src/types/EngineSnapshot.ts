import {ISnapshot} from "./ISnapshot";
import {WorldSnapshot} from "./WorldSnapshot";
import {TopologySnapshot} from "./TopologySnapshot";

export class EngineSnapshot extends ISnapshot {
  constructor(
    public readonly world: WorldSnapshot,
    public readonly topology: TopologySnapshot
  ) {
    super();
  }
}