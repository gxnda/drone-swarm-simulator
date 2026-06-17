// World border thing

import {Box3, Vector3} from "three";

export class Bounds {
  private box: Box3;
  public bounciness: number = 1;
  readonly centre: Vector3 = new Vector3();
  readonly size: Vector3 = new Vector3();

  constructor(readonly min: Vector3, readonly max: Vector3) {
    this.min = min;
    this.max = max;
    this.box = new Box3(min, max);
    this.box.getCenter(this.centre)
    this.box.getSize(this.size);
  }

  public contains(p: Vector3) {
    return this.box.containsPoint(p)
  }
  public clamp(p: Vector3, saveTo: Vector3 = new Vector3()): Vector3 {
    return this.box.clampPoint(p, saveTo)
  }

  public reflect(position: Vector3, velocity: Vector3) {
    // DOES NOT MANIPULATE P.
    const next = position.clone().add(velocity)
    const reflectedVelocity = velocity.clone();
    if (this.box.containsPoint(next)) {
      return velocity; // no reflection
    }
    if (next.x < this.min.x || next.x > this.max.x) {
      reflectedVelocity.x *= -1 * this.bounciness;
    }
    if (next.y < this.min.y || next.y > this.max.y) {
      reflectedVelocity.y *= -1 * this.bounciness;
    }
    if (next.z < this.min.z || next.z > this.max.z) {
      reflectedVelocity.z *= -1 * this.bounciness;
    }
    return reflectedVelocity;
  }

  public wrap(p: Vector3, saveTo: Vector3 = new Vector3()): Vector3 {
    if (this.contains(p)) {
      if (saveTo !== p) {
        saveTo = p.clone();
        return saveTo;
      } else {
        return p
      }
    }
    saveTo = new Vector3(
      (p.x - this.min.x) % this.size.x,
      (p.y - this.min.y) % this.size.y,
      (p.z - this.min.z) % this.size.z
    );
    return saveTo
  }

}