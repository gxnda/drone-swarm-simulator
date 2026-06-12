import {DroneId} from "@drone-swarm/shared";
import {Vector3, Quaternion} from "three";
import {DroneState} from "./DroneState";

export class Drone {
  readonly id: DroneId;
  public location: Vector3;
  public orientation: Quaternion;
  private state: DroneState;

  constructor(id: DroneId, location: Vector3, orientation?: Quaternion) {
    this.id = id;
    this.location = location;
    this.orientation = orientation ?? new Quaternion();
    this.state = DroneState.IDLE;
  }

  public getState(): DroneState {
    return this.state;
  }

  public setState(state: DroneState) {
    this.state = state;
  }
}
