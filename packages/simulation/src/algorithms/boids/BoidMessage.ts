import {DroneId, IPayload, Message} from "@drone-swarm/shared";
import {Vector3} from "three";

export enum BoidPayloadType {
  STATE_BROADCAST = "BOID_STATE_BROADCAST",
}

export interface BoidStatePayload extends IPayload {
  type: BoidPayloadType.STATE_BROADCAST;
  location: Vector3;
  velocity: Vector3;
}

export interface BoidStateMessage extends Message {
  payload: BoidStatePayload;
  sender?: DroneId;
  recipient: DroneId;
}