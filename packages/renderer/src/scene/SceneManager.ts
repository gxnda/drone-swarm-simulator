import {
  AmbientLight,
  DirectionalLight, Fog, Object3D,
  PerspectiveCamera,
  Scene, Vector3,
  WebGLRenderer
} from "three";
import {CameraController} from "./CameraController";

export class SceneManager {
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  public cameraController: CameraController;
  public lights: {ambient: AmbientLight, directional: DirectionalLight};
  public fog: Fog | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({canvas, antialias: true});
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a0f);
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      60,
      canvas.width / canvas.height,
      0.1,
      1000
    )
    this.camera.position.set(0, 30, 80);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.lights = {
      ambient: new AmbientLight(0xffffff, 4),
      directional: new DirectionalLight(0xffffff, 1.0)
    };
    this.lights.directional.position.set(50, 100, 50);
    this.scene.add(this.lights.ambient);
    this.scene.add(this.lights.directional);

    this.cameraController = new CameraController(this.camera, canvas);
  }

  public add(object: Object3D): void {
    this.scene.add(object);
  }

  public addMany(objects: Object3D[]): void {
    if (objects.length === 0) return;
    this.scene.add(...objects);
  }

  public remove(object: Object3D): void {
    this.scene.remove(object);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}