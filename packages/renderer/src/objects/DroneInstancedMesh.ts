// INFO: We assume drones never get removed (only ever failed)

import {
  BufferGeometry,
  DynamicDrawUsage,
  InstancedMesh,
  Material,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3Like
} from "three";
import {DroneId, DroneSnapshot, DroneState} from "@drone-swarm/shared";
import {DroneColourMapper} from "../utils/DroneColourMapper";
import {disposeObject3D} from "../utils/disposer";

export class DroneInstancedMesh {
  public  readonly capacity: number;
  private readonly mesh: InstancedMesh;
  private _selected: DroneId | null = null;
  private idToIndex: Map<DroneId, number> = new Map();
  private indexToId: Map<number, DroneId> = new Map();
  private colourMapper: DroneColourMapper = new DroneColourMapper();
  private dummy: Object3D = new Object3D();
  private readonly zeroMatrix: Matrix4 = new Matrix4();

  public get selected(): DroneId | null {
    return this._selected;
  }

  constructor(geometry: BufferGeometry, material: Material, capacity: number, scale?: Vector3Like) {
    this.zeroMatrix.set(
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    );

    this.capacity = capacity;
    this.mesh = new InstancedMesh(geometry, material, capacity);

    material.vertexColors = true;
    if (scale) {
      this.dummy.scale.copy(scale);
    } else {
      this.dummy.scale.set(1, 1, 1)
    }
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.instanceColor?.setUsage(DynamicDrawUsage);
    this.mesh.count = 0

    this.hideUnusedInstances(0);
  }

  public setSelected(selected: DroneId | null): void {
    this._selected = selected
  }

  private hideUnusedInstances(activeCount: number): void {
    if (activeCount >= this.mesh.count) return;
    for (let i = activeCount; i < this.mesh.count; i++) {
      this.mesh.setMatrixAt(i, this.zeroMatrix);
    }
  }

  private setInstanceColour(index: number, state: DroneState = DroneState.ACTIVE, isSelected: boolean = false): void {
    if (isSelected) {
      this.mesh.setColorAt(index, this.colourMapper.colourForSelection())
    } else {
      this.mesh.setColorAt(index, this.colourMapper.colourFor(state))
    }
  }

  private setPositionAndOrientationAt(index: number, position: Vector3Like, orientation: Quaternion) {
    this.dummy.position.copy(position);
    this.dummy.setRotationFromQuaternion(orientation);

    this.mesh.setMatrixAt(index, this.dummy.matrix);
  }

  private setNew(drone: DroneSnapshot): void {
    const index = this.mesh.count;
    if (this.mesh.count >= this.capacity) {
      throw new Error(`DroneInstancedMesh capacity exceeded: ${this.capacity}`);
    }

    this.setPositionAndOrientationAt(index, drone.location, drone.orientation);
    this.setInstanceColour(index, drone.state as DroneState, drone.id === this.selected)
    this.indexToId.set(index, drone.id);
    this.idToIndex.set(drone.id, index);
    this.mesh.count += 1;
  }

  private updateExisting(drone: DroneSnapshot): void {
    const index = this.idToIndex.get(drone.id)!;
    this.setPositionAndOrientationAt(index, drone.location, drone.orientation);
    this.setInstanceColour(index, drone.state as DroneState, drone.id === this.selected)
  }

  public update(drones: ReadonlyArray<DroneSnapshot>): void {
    drones.forEach((d) => {
      const droneMeshIndex = this.idToIndex.get(d.id);
      if (droneMeshIndex === undefined) {
        this.setNew(d);
      } else {
        this.updateExisting(d);
      }
    });

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  public dispose(): void {
    disposeObject3D(this.mesh)
  }
}