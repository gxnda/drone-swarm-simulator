import {SceneManager} from "./SceneManager";
import {DroneInstancedMesh} from "../objects/DroneInstancedMesh";
import {NetworkEdgeRenderer} from "../objects/NetworkEdgeRenderer";
import {BoundsRenderer} from "../objects/BoundsRenderer";
import {ObstacleRenderer} from "../objects/ObstacleRenderer";
import {
  DroneId,
  SimulationConfig, EngineSnapshot, SerialisedObstacle,
} from "@drone-swarm/shared";
import {
  Box3,
  BufferGeometry,
  MeshBasicMaterial,
  Raycaster, Vector2,
  Vector3
} from "three";
import {Obstacle} from "@drone-swarm/shared";
import {CameraMode} from "./CameraController";
import {DroneGeometry} from "../objects/DroneGeometry";

export class RenderPipeline {
  private sceneManager: SceneManager;
  private droneMesh: DroneInstancedMesh;
  private networkRenderer: NetworkEdgeRenderer;
  // private pheromoneRenderer: PheromoneRenderer
  private boundsRenderer: BoundsRenderer;
  private obstacleRenderer: ObstacleRenderer;
  // private trailRenderer: TrailRenderer
  private lastSnapshot: EngineSnapshot | null = null;
  private lastFrameTime: number = performance.now();

  private raycaster = new Raycaster();

  private edgeBuffer: Array<[DroneId, DroneId]> = [];
  private locationBuffer: Map<DroneId, Vector3> = new Map();

  private constructor(canvas: HTMLCanvasElement, geometry: BufferGeometry, config: SimulationConfig) {
    this.sceneManager = new SceneManager(canvas);
    const material = new MeshBasicMaterial({color: 0xffffff});
    this.droneMesh = new DroneInstancedMesh(
      geometry,
      material,
      1000,
    )
    this.sceneManager.add(this.droneMesh.mesh);
    this.networkRenderer = new NetworkEdgeRenderer(1000);
    this.sceneManager.add(this.networkRenderer.lineSegments);
    this.boundsRenderer = new BoundsRenderer(new Box3(config.boundsMin, config.boundsMax));
    this.sceneManager.add(this.boundsRenderer.wireframe);
    this.obstacleRenderer = new ObstacleRenderer(new MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true
    }));
    this.obstacleRenderer.add(config.obstacles.map((o) => Obstacle.deserialise(o)));
    this.sceneManager.addMany(this.obstacleRenderer.getAllMeshes());
  }

  static async create(canvas: HTMLCanvasElement, config: SimulationConfig): Promise<RenderPipeline> {
    const geometry = await DroneGeometry.loadPaperPlane();
    // const geometry = new ConeGeometry(5, 10, 4);
    return new RenderPipeline(canvas, geometry, config);
  }

  public addObstacles(toAdd: SerialisedObstacle[]) {
    this.obstacleRenderer.add(toAdd.map((o) => Obstacle.deserialise(o)));
    this.sceneManager.addMany(this.obstacleRenderer.getAllMeshes());
  }

  public selectDrone(id: DroneId | null): void {
    this.droneMesh.setSelected(id);
  }

  public setConfig(config: SimulationConfig) {
    this.sceneManager.remove(this.boundsRenderer.wireframe);
    this.boundsRenderer.dispose()
    this.boundsRenderer = new BoundsRenderer(new Box3(config.boundsMin, config.boundsMax));
    this.sceneManager.add(this.boundsRenderer.wireframe);

    this.obstacleRenderer.getAllMeshes().forEach(mesh => {
      this.sceneManager.remove(mesh);
    });
    this.obstacleRenderer.dispose()
    this.obstacleRenderer.add(config.obstacles.map((o) => Obstacle.deserialise(o)));
    this.sceneManager.addMany(this.obstacleRenderer.getAllMeshes());
  }

  public update(snapshot: EngineSnapshot) {
    this.edgeBuffer.length = 0;
    this.locationBuffer.clear();
    this.lastSnapshot = snapshot;
    this.droneMesh.update(snapshot.world.droneSnapshots);

    snapshot.topology.adjacency.forEach((edgeSet, from) => {
      edgeSet.forEach((to) => {
        this.edgeBuffer.push([from, to])
      })
    });
    snapshot.world.droneSnapshots.forEach((droneSnapshot) => {
      this.locationBuffer.set(droneSnapshot.id, droneSnapshot.location);
    })
    this.networkRenderer.updateFromSnapshot(this.edgeBuffer, this.locationBuffer);
  }

  public resize(width: number, height: number) {
    this.sceneManager.resize(width, height);
  }

  public setCameraMode(cameraMode: CameraMode) {
    this.sceneManager.cameraController.setMode(cameraMode);
  }

  public getDroneAtScreenPosition(x: number, y: number): DroneId | null {
    this.raycaster.setFromCamera(new Vector2(x, y), this.sceneManager.camera)
    const closestArr = this.raycaster.intersectObject(this.droneMesh.mesh);
    if (closestArr.length === 0) {
      // didn't intersect anything
      return null;
    } else {
      const closest = closestArr[0]!.instanceId!;
      return this.droneMesh.instanceIdToIndex(closest);
    }
  }

  public render() {
    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000; // seconds
    this.lastFrameTime = now;
    this.sceneManager.cameraController.update(dt);
    this.sceneManager.render();
  }

  public dispose(): void {
    this.sceneManager.dispose();
    this.droneMesh.dispose();
    this.boundsRenderer.dispose();
    this.obstacleRenderer.dispose();
    this.networkRenderer.dispose();
  }

}