import {DroneId} from "./DroneId";

export class Message {
    public text: string;
    public sender?: DroneId;
    public recipient?: DroneId;

    constructor(text: string, sender=null, recipient=null) {
        this.text = text;
        if (sender) {
           this.sender = sender;
        }
        if (recipient) {
            this.recipient = recipient
        }
    }
}