import {SceneManager} from "./SceneManager";
import {DroneInstancedMesh} from "../objects/DroneInstancedMesh";
import {NetworkEdgeRenderer} from "../objects/NetworkEdgeRenderer";
import {BoundsRenderer} from "../objects/BoundsRenderer";
import {ObstacleRenderer} from "../objects/ObstacleRenderer";
import {
  DroneId,
  SimulationConfig, EngineSnapshot, SerialisedObstacle,
} from "@drone-swarm/shared";
import {DroneGeometry, DroneModelPaths} from "../objects/DroneGeometry";
import {
  Box3,
  BufferGeometry,
  MeshBasicMaterial,
  Raycaster, Vector2,
  Vector3
} from "three";
import {Obstacle} from "@drone-swarm/simulation";
import {CameraMode} from "./CameraController";

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

  constructor(canvas: HTMLCanvasElement, geometry: BufferGeometry, config: SimulationConfig) {
    this.sceneManager = new SceneManager(canvas);
    this.droneMesh = new DroneInstancedMesh(
      geometry,
      new MeshBasicMaterial({color: 0xf344f1, vertexColors: true}),
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
    this.addObstacles(config.obstacles);
  }

  static async create(canvas: HTMLCanvasElement, config: SimulationConfig): Promise<RenderPipeline> {
    const gltf = await DroneGeometry.load(DroneModelPaths.paper_plane);
    const geometry = DroneGeometry.getGeometriesFrom(gltf)[0]!;
    return new RenderPipeline(canvas, geometry, config);
  }

  public addObstacles(toAdd: SerialisedObstacle[]) {
    this.obstacleRenderer.add(toAdd.map((o) => Obstacle.deserialise(o)));
    this.sceneManager.addMany(this.obstacleRenderer.getAllMeshes());
  }

  public update(snapshot: EngineSnapshot) {
    this.lastSnapshot = snapshot;
    this.droneMesh.update(snapshot.world.droneSnapshots);

    const edges: Array<[DroneId, DroneId]> = [];
    snapshot.topology.adjacency.forEach((edgeSet, from) => {
      edgeSet.forEach((to) => {
        edges.push([from, to])
      })
    });
    const locations: Map<DroneId, Vector3> = new Map();
    snapshot.world.droneSnapshots.forEach((droneSnapshot) => {
      locations.set(droneSnapshot.id, droneSnapshot.location);
    })
    this.networkRenderer.updateFromSnapshot(edges, locations);
  }

  public resize(width: number, height: number) {
    this.sceneManager.resize(width, height);
  }

  public setCameraMode(cameraMode: CameraMode) {
    this.sceneManager.cameraController.setMode(cameraMode);
  }

  public selectDroneAtScreenPosition(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2(x, y), this.sceneManager.camera)
    const closestArr = this.raycaster.intersectObject(this.droneMesh.mesh);
    if (closestArr.length === 0) {
      // didn't intersect anything
      this.droneMesh.setSelected(null);
    } else {
      const closest = closestArr[0]!.instanceId!;
      this.droneMesh.setSelected(this.droneMesh.instanceIdToIndex(closest));
    }
  }

  public render() {
    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000; // seconds
    this.lastFrameTime = now;
    this.sceneManager.cameraController.update(dt);
    this.sceneManager.render();
  }

}