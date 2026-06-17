import {Box3, Vector3} from "three";

export type SerialisedObstacle =
  | { type: "box"; min: [number,number,number]; max: [number,number,number] };

export type Obstacle = { box: Box3 };

export function deserialise(o: SerialisedObstacle): Obstacle {
  if (o.type === "box") {
    return {
      box: new Box3(new Vector3(...o.min), new Vector3(...o.max))
    };
  } else {
    throw new Error("Unknown obstacle");
  }
}

export function obstacleContains(o: Obstacle, p: Vector3): boolean {
    return o.box.containsPoint(p)
}

export function serialise(obstacle: Obstacle): SerialisedObstacle {
    return {
      type: "box",
      min: [obstacle.box.min.x, obstacle.box.min.y, obstacle.box.min.z],
      max: [obstacle.box.max.x, obstacle.box.max.y, obstacle.box.max.z]
    };
}
