import {DroneId} from "./DroneId";

export interface Message {
    text: string;
    sender?: DroneId;
    recipient: DroneId;
}