import {DroneId} from "./DroneId";

export class Message {
    public text: string;
    public sender?: DroneId;
    public recipient: DroneId;

    constructor(text: string, sender: DroneId | null, recipient: DroneId) {
        this.text = text;
        if (sender) this.sender = sender;
        this.recipient = recipient;
    }
}