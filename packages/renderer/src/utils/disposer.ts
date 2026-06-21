import {BufferGeometry, Material, Mesh, Object3D, Scene, Texture} from "three";

export function disposeObject3D(object: Object3D): void {
  object.traverse(child => {
    if (child instanceof Mesh) {
      disposeGeometry(child.geometry);
      disposeMaterial(child.material);
    }
  })
}

export function disposeGeometry(geometry: BufferGeometry): void {
  geometry.dispose();
}

export function disposeMaterial(material: Material | Material[]): void {
  const materials = Array.isArray(material) ? material : [material];
  for (const material of materials) {
    for (const key of Object.keys(material) as (keyof Material)[]) {
      const value = material[key];
      if (value instanceof Texture) value.dispose();
    }
    material.dispose();
  }
}

export function disposeScene(scene: Scene): void {
  disposeObject3D(scene);
  scene.clear();
}