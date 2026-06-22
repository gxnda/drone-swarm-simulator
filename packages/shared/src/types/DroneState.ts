export enum DroneState {
  ACTIVE = "ACTIVE", // all going normally
  FAILED = "FAILED", // some hardware failure or something
  ISOLATED = "ISOLATED", // can't reach anyone, all alone :(
}