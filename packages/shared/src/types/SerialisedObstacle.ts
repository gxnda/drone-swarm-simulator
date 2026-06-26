
export type SerialisedObstacle =
  | { type: "box"; id: string; min: [number,number,number]; max: [number,number,number] };
