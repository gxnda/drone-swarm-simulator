import { DroneId, Message } from "@drone-swarm/shared";
import { Drone } from "../drone/Drone";

/**
 * The ether that messages get sent across
 *
 * Has a queue of arrival ticks and messages, when a message is sent it can
 * randomly disappear
 */
export interface IMessageBus {

  getTotalSentThisTick(): number;
  getMessagesAtCurrentTick(): Message[];

  send(
    message: Message,
    senderId: DroneId,
    recipientId: DroneId | "BROADCAST",
    currentTick: number,
  ): void;
  deliver(idToDrones: Map<DroneId, Drone>, currentTick: number): void;
  getInFlightCount(): number;
}
