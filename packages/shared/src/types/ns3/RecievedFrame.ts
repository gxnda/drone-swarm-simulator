import { DroneId } from "../DroneId";

export interface RecievedFrame {
  messageId: string,
  senderId: DroneId,
  // we don't know who it was meant for, hopefully it's in the message
  rssi: number,
  snr: number,
  latencyMs: number,
}
