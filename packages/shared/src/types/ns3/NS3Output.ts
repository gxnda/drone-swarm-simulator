import { DroneId } from "../DroneId";
import { RecievedFrame } from "./RecievedFrame";

export interface NS3Output {
  recievedFrames: Map<DroneId, RecievedFrame[]>,
  // droppedTransmissions: TODO: add for metrics
}
