import {DroneId} from "./DroneId";

export interface IPayload {
    type: string
}

export interface Message {
    payload: IPayload;
    sender?: DroneId;
    recipient: DroneId;
}