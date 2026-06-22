import {
  Box3,
  BoxGeometry, EdgesGeometry,
  LineSegments,
  Vector3,
} from "three";

export class BoundsRenderer {
  private wireframe: LineSegments;
  public readonly box: Box3 = new Box3();

  constructor(boundBox: Box3) {
    this.box = boundBox.clone();
    const centre = new Vector3();
    this.box.getCenter(centre);
    const geometry = new BoxGeometry(
      boundBox.max.x - boundBox.min.x,
      boundBox.max.y - boundBox.min.y,
      boundBox.max.z - boundBox.min.z);
    const wireframe = new EdgesGeometry(geometry)
    this.wireframe = new LineSegments(wireframe);
    this.wireframe.position.copy(centre);
  }

  update(box: Box3) {
    this.box.copy(box);
    const centre = new Vector3();
    this.box.getCenter(centre);
    this.wireframe = new LineSegments(new EdgesGeometry(new BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z)));
    this.wireframe.position.copy(centre);
  }
}