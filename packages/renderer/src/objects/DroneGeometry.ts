import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {BufferGeometry, Mesh} from "three";

export enum DroneModelPaths {
  paper_plane = "assets/paper-plane/scene.gltf"
}

export class DroneGeometry {
  private readonly loader: GLTFLoader = new GLTFLoader();

  public async load(url: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url, (gltf) => resolve(gltf),
        undefined,
        (error) => reject(error)
      );
    });
  }

  public getGeometriesFrom(gltf: GLTF) {
    const geometries: BufferGeometry[] = [];
    gltf.scene.traverse((obj) => {
      //  INFO: This is bad apparently if there are different versions of
      //  three installed, it can brick it all. But TypeScript typechecking
      //  shits a brick if you use the .isMesh as recommended
      if (obj instanceof Mesh) {
        geometries.push(obj.geometry);
      }
    })
    return geometries;
  }
}