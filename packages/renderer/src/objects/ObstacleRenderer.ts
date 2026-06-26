import {BoxGeometry, Material, Matrix4, Mesh, Vector3} from "three";
import {ObstacleId} from "@drone-swarm/shared";
import {disposeObject3D} from "../utils/disposer";
import {Obstacle} from "@drone-swarm/simulation";

export class ObstacleRenderer {
  private meshes: Map<ObstacleId, Mesh> = new Map();
  private readonly material: Material;

  constructor(material: Material, os?: ReadonlyArray<Obstacle>) {
    this.material = material;
    if (os) this.add(os);
  }

  public isEmpty(): boolean {
    return this.meshes.size !== 0;
  }

  public getAllMeshes(): Mesh[] {
    return Array.from(this.meshes.values())
  }

  public add(os: ReadonlyArray<Obstacle>): void {
    os.forEach((o) => {
      const box = o.box;
      // https://stackoverflow.com/questions/57360183/creating-boxbuffergeometry-from-box3
      const dimensions = new Vector3().subVectors( box.max, box.min );
      const boxGeo = new BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
      const matrix = new Matrix4().setPosition(dimensions.addVectors(box.min, box.max).multiplyScalar( 0.5 ));
      boxGeo.applyMatrix4(matrix);
      this.meshes.set(o.id, new Mesh(boxGeo, this.material));
    })
  }

  public dispose(): void {
    this.meshes.forEach((mesh) => {
      disposeObject3D(mesh);
    })
  }


}