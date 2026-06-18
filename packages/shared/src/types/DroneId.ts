export type DroneId = string & {readonly __brand: "DroneId"};

export type DroneIdPair = string & {readonly __brand: "DroneIdPair"};

export function idsToPair(a: DroneId, b: DroneId): DroneIdPair {
  return `${a}-${b}` as DroneIdPair;
}

export function pairToIds(pair: DroneIdPair): [DroneId, DroneId] {
  const [a, b] = pair.split("-");
  return [a as DroneId, b as DroneId];
}