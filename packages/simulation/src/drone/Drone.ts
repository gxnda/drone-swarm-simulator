import {DroneId, DroneSnapshot, Message} from "@drone-swarm/shared";
import {Quaternion, Vector3} from "three";
import {DroneState} from "./DroneState";

export class Drone {
  readonly id: DroneId;
  public location: Vector3;
  public orientation: Quaternion;
  public velocity: Vector3 = new Vector3(0, 0, 0);

  public communicationRange: number;

  private state: DroneState | null = null;
  private failedAtTick: number | null = null;
  private becameIsolatedAtTick: number | null = null;

  private inbox: Message[];

  constructor(id: DroneId, location: Vector3, range: number, orientation?: Quaternion) {
    this.id = id;
    this.location = location;
    this.communicationRange = range;
    this.orientation = orientation ?? new Quaternion();

    this.inbox = new Array<Message>();
  }

  private markAsActive(): void {
    this.state = DroneState.ACTIVE;
    this.becameIsolatedAtTick = null;
    this.failedAtTick = null;
  }

  private markAsIsolatedAtTick(tick: number): void {
    this.state = DroneState.ISOLATED;
    this.becameIsolatedAtTick = tick;
  }

  private markAsFailedAtTick(tick: number): void {
    this.state = DroneState.FAILED;
    this.failedAtTick = tick;
  }

  public isActive(): boolean {return this.state === DroneState.ACTIVE}
  public isIsolated(): boolean {return this.state === DroneState.ISOLATED}
  public isFailed(): boolean {return this.state === DroneState.FAILED}

  public getState(): DroneState | null {
    return this.state;
  }

  public setState(state: DroneState) {
    this.state = state;
  }

  public distanceTo(other: Drone): number {
    return this.location.distanceTo(other.location);
  }

  public snapshot(): DroneSnapshot {
    return new DroneSnapshot(
      this.id,
      this.location.clone(),
      this.orientation.clone(),
      this.velocity.clone(),
      this.communicationRange,
      this.state
    )
  }
}
