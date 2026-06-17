import {DroneSnapshot} from "./DroneSnapshot";
import {ISnapshot} from "./ISnapshot";
import {SerialisedObstacle} from "./SerialisedObstacle";

export class WorldSnapshot extends ISnapshot {
    public droneSnapshots: DroneSnapshot[];
    public obstacles: SerialisedObstacle[];

    constructor(droneSnapshots: DroneSnapshot[], obstacles: SerialisedObstacle[]) {
        super()
        this.droneSnapshots = droneSnapshots;
        this.obstacles = obstacles;
    }
}