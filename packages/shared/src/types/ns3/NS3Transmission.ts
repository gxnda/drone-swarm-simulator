import { DroneId } from "../DroneId";

export interface NS3Transmission {
  senderId: DroneId,
  recipientId: DroneId | "BROADCAST",
  messageId: string,
  payloadSizeBytes: number,
}
