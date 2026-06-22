import {DroneId, WorldSnapshot} from "@drone-swarm/shared";
import {CurvePath, PerspectiveCamera, Vector3} from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export enum CameraMode {
  Orbit="orbit",
  Follow="follow",
  Cinematic="cinematic"
}

export class CameraController {
  private mode: CameraMode = CameraMode.Orbit;
  private orbitControls: OrbitControls;
  private followTargetId: DroneId | null = null;
  private cinematicPath: CurvePath<Vector3> | null = null;
  private cinematicProgress: number = 0;

  constructor(camera: PerspectiveCamera, domElement: HTMLCanvasElement) {
    this.orbitControls = new OrbitControls(camera, domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;
  }

  public followDrone(id: DroneId): void {
    this.setMode(CameraMode.Follow);
    this.followTargetId = id;
  }

  public update(snapshot: WorldSnapshot, deltaTime: number): void {
    if (this.mode === CameraMode.Orbit) {
      this.orbitControls.update(deltaTime);
    }
  }

  public reset(): void {
    // return to orbit mode and reset everything
    this.setMode(CameraMode.Orbit);
    this.followTargetId = null;
    this.cinematicProgress = 0;
    this.orbitControls.reset();
  }

  public dispose(): void {
    this.orbitControls.dispose();
  }
}
