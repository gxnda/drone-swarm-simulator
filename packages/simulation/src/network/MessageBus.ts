import {DroneId, Message, SeededRng} from "@drone-swarm/shared";
import {LinkQuality} from "./ILinkModel";
import {Drone} from "../drone/Drone";

/**
 * The ether that messages get sent across
 *
 * Has a queue of arrival ticks and messages, when a message is sent it can
 * randomly disappear
 */
export class MessageBus {
  constructor(private readonly queue: Map<number, Message[]>) {}

  public send(
    message: Message,
    currentTick: number,
    linkQuality: LinkQuality,
    rng: SeededRng
  ): void {
    // drop it randomly
    if (rng.float(0, 1) <= linkQuality.dropProbability) return;

    const arrivesAt = currentTick + linkQuality.latencyTicks;
    if (this.queue.has(arrivesAt)) {
      this.queue.get(arrivesAt)!.push(message)
    } else {
      this.queue.set(arrivesAt, [message])
    }
  }

  public getMessagesToBeDelivered(currentTick: number): Map<DroneId, Message[]> {
    const messages = this.queue.get(currentTick) ?? [];
    this.queue.delete(currentTick);
    const recipients: Map<DroneId, Message[]> = new Map();
    messages.forEach((message) => {
      if (!recipients.has(message.recipient)) {
        recipients.set(message.recipient, [message])
      } else {
        recipients.get(message.recipient)!.push(message);
      }
    });
    return recipients;
  }

  public deliver(idToDrones: Map<DroneId, Drone>, currentTick: number): void {
    const messagesToDeliver = this.getMessagesToBeDelivered(currentTick);
    messagesToDeliver.forEach((messages, recipientId) => {
      const drone = idToDrones.get(recipientId);
      if (drone) {
        messages.forEach((message) => {
          drone.receive(message);
        });
      }
    });
  }

  public getInFlightCount(): number {
    let count = 0;
    this.queue.values().forEach((mArr) => count += mArr.length);
    return count;
  }
}