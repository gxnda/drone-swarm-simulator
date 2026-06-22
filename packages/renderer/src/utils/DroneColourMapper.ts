import {DroneState} from "@drone-swarm/shared";
import {Color} from "three";

export class DroneColourMapper {
  public colours: Record<DroneState, Color> = {
    [DroneState.ACTIVE]: new Color(0x00ff00),   // Green
    [DroneState.FAILED]: new Color(0xff0000),   // Red
    [DroneState.ISOLATED]: new Color(0xffff00), // Yellow
  };

  public colourFor(state: DroneState): Color {
    return this.colours[state];
  }

  public colourForSelection(): Color {
    return new Color(0x0000ff);                 // Blue
  }
}