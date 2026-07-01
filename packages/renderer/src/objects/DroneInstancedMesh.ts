// INFO: We assume drones never get removed (only ever failed)

import {
  BufferGeometry, Color,
  DynamicDrawUsage, InstancedBufferAttribute,
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
  readonly mesh: InstancedMesh;
  private _selected: DroneId | null = null;
  private idToIndex: Map<DroneId, number> = new Map();
  private indexToId: Map<number, DroneId> = new Map();
  private colourMapper: DroneColourMapper = new DroneColourMapper();
  private dummy: Object3D = new Object3D();
  private readonly zeroMatrix: Matrix4 = new Matrix4();
  private readonly material: Material;

  public get selected(): DroneId | null {
    return this._selected;
  }

  public instanceIdToIndex(instanceId: number): DroneId | null {
    return this.indexToId.get(instanceId) ?? null;
  }

  constructor(geometry: BufferGeometry, material: Material, capacity: number, scale?: Vector3Like) {
    this.zeroMatrix.set(
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    );

    this.material = material.clone();
    this.capacity = capacity;
    // this.material.vertexColors = true;
    this.mesh = new InstancedMesh(geometry, this.material, capacity);

    if (scale) {
      this.dummy.scale.copy(scale);
    } else {
      this.dummy.scale.set(1, 1, 1)
    }
    this.dummy.updateMatrix();

    // is this needed? I put it to try to fix the all-black bug
    const defaultColor = new Color(0xffffff);
    for (let i = 0; i < capacity; i++) {
      this.mesh.setColorAt(i, defaultColor);
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

    const attrName = 'instanceColor';
    let attr = this.mesh.geometry.getAttribute(attrName) as InstancedBufferAttribute | null;
    if (!attr) {
      attr = new InstancedBufferAttribute(new Float32Array(this.capacity * 3), 3);
      attr.setUsage(DynamicDrawUsage);
      this.mesh.geometry.setAttribute(attrName, attr as never);
    }

    let colour: Color;
    if (isSelected) {
      colour = this.colourMapper.colourForSelection();
    } else {
      colour = this.colourMapper.colourFor(state);
    }
    attr.setXYZ(index, colour.r, colour.g, colour.b);
    attr.needsUpdate = true;
  }

  private setPositionAndOrientationAt(index: number, position: Vector3Like, orientation: Quaternion) {
    const isInvalid = !orientation ||
      isNaN(orientation.x) || isNaN(orientation.y) || isNaN(orientation.z) || isNaN(orientation.w) ||
      Math.abs(orientation.length() - 1) > 0.001;

    if (isInvalid) {
      console.warn(`Invalid quaternion for drone at index ${index}, using identity.`);
      console.debug(`isQuaternion: ${orientation.isQuaternion}`);
      console.debug(`${orientation.x}-x, ${orientation.y}-y, ${orientation.z}-z, ${orientation.w}-w`);
      this.dummy.quaternion.identity();
    } else {
      this.dummy.quaternion.copy(orientation);
    }

    this.dummy.position.copy(position);
    // this.dummy.setRotationFromQuaternion(orientation);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(index, this.dummy.matrix);
  }

  private setNew(drone: DroneSnapshot): void {
    const index = this.mesh.count;
    if (this.mesh.count >= this.capacity) {
      throw new Error(`DroneInstancedMesh capacity exceeded: ${this.capacity}`);
    }

    const orientation: Quaternion = new Quaternion(...drone.orientation);

    this.setPositionAndOrientationAt(index, drone.location, orientation);
    this.setInstanceColour(index, drone.state as DroneState, drone.id === this.selected)
    this.indexToId.set(index, drone.id);
    this.idToIndex.set(drone.id, index);
    this.mesh.count += 1;
  }

  private updateExisting(drone: DroneSnapshot): void {
    const index = this.idToIndex.get(drone.id)!;
    this.setPositionAndOrientationAt(index, drone.location, new Quaternion(...drone.orientation));
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
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
    this.mesh.computeBoundingBox();
    this.mesh.computeBoundingSphere();
  }

  public dispose(): void {
    disposeObject3D(this.mesh)
  }
}