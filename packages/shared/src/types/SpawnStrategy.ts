import {Vector3} from "three";

export type SpawnStrategy =
  | { type: "random"; count: number; boundMin: Vector3, boundMax: Vector3 }
  | { type: "grid"; count: Vector3; spacing: number }
  | { type: "cluster"; count: number; centre: Vector3; radius: number }
  | { type: "sphereSurface"; count: number; radius: number }
