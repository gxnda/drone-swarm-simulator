import {DroneSnapshot} from "./DroneSnapshot";
import {ISnapshot} from "./ISnapshot";

export class WorldSnapshot extends ISnapshot {
    public droneSnapshots: DroneSnapshot[];

    constructor(droneSnapshots: DroneSnapshot[]) {
        super()
        this.droneSnapshots = droneSnapshots;
    }
}