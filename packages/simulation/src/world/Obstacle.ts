import {Vector3} from "three";

export type Obstacle =
  | {type: "box"; centre: Vector3; p1: Vector3; p2: Vector3; p3: Vector3 }
  | {type: "circle"; centre: Vector3; radius: number};

export function obstacleContains(obstacle: Obstacle, p: Vector3) {
  const centredPoint = p.sub(obstacle.centre);
  if (obstacle.type === "box") {
    const p1p2cross = obstacle.p1.cross(obstacle.p2);
    const p1p3cross = obstacle.p1.cross(obstacle.p3);
    const p2p3cross = obstacle.p2.cross(obstacle.p3);


  }
}