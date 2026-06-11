import {DroneId} from "./DroneId";
import {Quaternion, Vector3} from "three";
import {ISnapshot} from "./ISnapshot";

export class DroneSnapshot extends ISnapshot {
    public id: DroneId;
    public location: Vector3;
    public orientation: Quaternion;
    public velocity: Vector3;

    constructor(id: DroneId, location: Vector3, orientation: Quaternion, velocity: Vector3) {
        super()
        this.id = id;
        this.location = location.clone();
        this.orientation = orientation.clone();
        this.velocity = velocity.clone()
    }

}