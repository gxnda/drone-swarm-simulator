import {DroneId, DroneSnapshot, Message} from "@drone-swarm/shared";
import {Matrix4, Quaternion, Vector3} from "three";
import {DroneState} from "./DroneState";

export class Drone {
  readonly id: DroneId;
  public location: Vector3;
  public orientation: Quaternion;
  public velocity: Vector3 = new Vector3(0, 0, 0);
  public acceleration: Vector3 = new Vector3(0, 0, 0);

  readonly maxSpeed: number | null = null;
  readonly maxAcceleration: number | null = null;

  public communicationRange: number;

  private state: DroneState | null = null;
  private failedAtTick: number | null = null;
  private becameIsolatedAtTick: number | null = null;

  private inbox: Message[];

  constructor(id: DroneId, location: Vector3, range: number, maxSpeed?: number, maxAcceleration?: number) {
    this.id = id;
    this.location = location;
    this.communicationRange = range;
    this.orientation = new Quaternion();

    if (maxSpeed) this.maxSpeed = maxSpeed;
    if (maxAcceleration) this.maxAcceleration = maxAcceleration;

    this.inbox = new Array<Message>();
  }

  public setOrientation(q: Quaternion) {
    this.orientation = q;
  }

  public getOrientation(): Quaternion {
    return this.orientation;
  }

  private smoothUpdateRotation(target: Quaternion, current: Quaternion, dt: number = 1, turnSpeed: number = 3.0) {
    return current.slerp(target, Math.min(1, turnSpeed * dt))
  }

  public rotateToMatchVelocityWithBanking() {
    if (this.velocity.lengthSq() < 1e-8) return this.orientation;

    const forward = this.velocity.clone().normalize();

    let up = new Vector3(0, 1, 0);
    const accPerp = this.acceleration.clone().addScaledVector(forward, -this.acceleration.dot(forward));
    if (accPerp.lengthSq() > 1e-8) {
      up = accPerp.normalize();
    }
    const target = new Quaternion();
    const m = new Matrix4().lookAt(
      new Vector3(0, 0, 0), forward, up
    )
    target.setFromRotationMatrix(m);

    this.setOrientation(this.smoothUpdateRotation(target, this.orientation));
    return this.orientation;
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

  public setInbox(inbox: Message[]): void {
    this.inbox = inbox;
  }

  public clearInbox(): void {
    this.inbox = [];
  }

  public getInbox(): Message[] {
    return this.inbox;
  }

  public addToInbox(message: Message): number {
    return this.inbox.push(message);
  }

  public receive(message: Message): void {
    this.addToInbox(message);
  }
}
