import {DroneSnapshot} from "./DroneSnapshot";
import {ISnapshot} from "./ISnapshot";
import {SerialisedObstacle} from "./SerialisedObstacle";

export class WorldSnapshot extends ISnapshot {
  constructor(
    public droneSnapshots: DroneSnapshot[],
    public obstacles: SerialisedObstacle[],
    public tick: number
  ) {
    super()
  }
}