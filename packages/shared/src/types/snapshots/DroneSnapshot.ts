import {DroneId} from "../DroneId";
import {Quaternion, Vector3} from "three";
import {ISnapshot} from "./ISnapshot";

export class DroneSnapshot extends ISnapshot {
    public id: DroneId;
    public location: Vector3;
    public orientation: [number, number, number, number];
    public velocity: Vector3;
    public range: number;
    public state: string;

    constructor(id: DroneId, location: Vector3, orientation: Quaternion, velocity: Vector3, range: number, state: string) {
        super()
        this.id = id;
        this.location = location.clone();
        this.orientation = orientation.clone().toJSON();
        this.velocity = velocity.clone();
        this.state = state;
        this.range = range
    }

}