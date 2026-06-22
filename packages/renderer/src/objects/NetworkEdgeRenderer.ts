import {
  BufferAttribute, BufferGeometry, Color,
  LineBasicMaterial, LineSegments, Vector3
} from "three";
import {DroneId} from "@drone-swarm/shared";

export class NetworkEdgeRenderer {
  private lineSegments: LineSegments;
  private readonly maxEdges: number;
  private readonly edges: Float32Array;
  private readonly geometry: BufferGeometry;
  private readonly positionAttribute: BufferAttribute;
  private readonly material: LineBasicMaterial;

  constructor(maxEdges: number) {
    this.maxEdges = maxEdges;
    this.edges = new Float32Array(this.maxEdges * 6);
    this.positionAttribute = new BufferAttribute(this.edges, 3);
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", this.positionAttribute);
    this.material = new LineBasicMaterial({ color: 0x4f4f4f, transparent: true, opacity: 0.5 });
    this.lineSegments = new LineSegments(this.geometry, this.material);
  }

  public updateFromSnapshot(
    edges: ReadonlyArray<[DroneId, DroneId]>, dronePositions: Map<DroneId, Vector3>): void {
    const edgeCount = Math.min(edges.length, this.maxEdges);
    this.edges.set(new Float32Array(this.maxEdges * 6));
    for (let i = 0; i < edgeCount; i+=6) {
      let pos: Vector3 = dronePositions.get(edges[i]![0])!;
      this.edges[i] = pos.x;
      this.edges[i + 1] = pos.y;
      this.edges[i + 2] = pos.z;
      pos = dronePositions.get(edges[i]![1])!;
      this.edges[i + 3] = pos.x;
      this.edges[i + 4] = pos.y;
      this.edges[i + 5] = pos.z;
    }
    this.geometry.setDrawRange(0, edgeCount * 2);
    this.positionAttribute.needsUpdate = true;
  }

  public setEdgeOpacity(opacity: number): void {
    this.material.opacity = opacity;
  }

  public setEdgeColor(color: Color): void {
    this.material.color = color;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}