import { Vector3 } from "three";
import { DroneId } from "../DroneId";
import { NS3Transmission } from "./NS3Transmission";

export interface NS3Input {
  deltaTime: number,
  nodePositions: Map<DroneId, Vector3>,
  transmissions: NS3Transmission[]
}
