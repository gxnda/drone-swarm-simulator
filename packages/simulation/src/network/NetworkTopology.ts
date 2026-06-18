import {DroneId, DroneIdPair, idsToPair, SeededRng} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
import {IAttenuationModel} from "./models/attenuation/IAttenuationModel";
import {ILatencyModel} from "./models/latency/ILatencyModel";
import {LinkQuality} from "./ILinkModel";

export class NetworkTopology {
  private readonly adjacency: Map<DroneId, Set<DroneId>> = new Map();
  private readonly qualities: Map<DroneIdPair, LinkQuality> = new Map();

  constructor(
    adjacency: Map<DroneId, Set<DroneId>>,
    qualities: Map<DroneIdPair, LinkQuality>
  ) {
    this.adjacency = adjacency;
    this.qualities = qualities;
  }

  static build(
    drones: Set<Drone>,
    attenuationModel: IAttenuationModel,
    latencyModel: ILatencyModel,
    rng: SeededRng,
  ): NetworkTopology {
    const adjacency: Map<DroneId, Set<DroneId>> = new Map();
    const qualities: Map<DroneIdPair, LinkQuality> = new Map();

    drones.forEach(from => {
      adjacency.set(from.id, new Set());
      drones.forEach(to => {
        const dropProbability = attenuationModel.getDropProbability(from, to, rng);
        if (dropProbability) {
          adjacency.get(from.id)!.add(to.id);
          qualities.set(idsToPair(from.id, to.id), {latencyTicks: 1, dropProbability: dropProbability.dropProbability});
        }
      })
    });
    const topology: NetworkTopology = new NetworkTopology(adjacency, qualities);

    drones.forEach(from => {
      drones.forEach(to => {
        const quality = qualities.get(idsToPair(from.id, to.id))!;
        quality.latencyTicks = latencyModel.getLatency(from, to, topology, rng);
        topology.setQuality(from.id, to.id, quality);
      })
    });
    return topology;
  }

  public getNeighbours(id: DroneId): Set<DroneId> {
    return this.adjacency.get(id) ?? new Set();
  }

  public getQuality(from: DroneId, to: DroneId): LinkQuality | undefined {
    return this.qualities.get(idsToPair(from, to));
  }

  public setQuality(from: DroneId, to: DroneId, quality: LinkQuality): void {
    this.qualities.set(idsToPair(from, to), quality);
  }

  public averageQuality(): LinkQuality {
    let averageLatency = 0;
    let averageDropProbability = 0;
    const count = this.qualities.size;
    this.qualities.values().forEach((quality) => {
      averageLatency += quality.latencyTicks;
      averageDropProbability += quality.dropProbability;
    });
    return {
      latencyTicks: averageLatency / count,
      dropProbability: averageDropProbability / count,
    }

  }

  public getAll(): Set<DroneId> {
    const all: Set<DroneId> = new Set(this.adjacency.keys());
    for (const neighbors of this.adjacency.values()) {
      for (const neighbor of neighbors) {
        all.add(neighbor);
      }
    }
    return all
  }

  private dfs(id: DroneId): Set<DroneId> {
    const seen: Set<DroneId> = new Set([id]);
    const stack = [id];
    let current: DroneId;
    let neighbours: Set<DroneId>;
    while (stack.length > 0) {
      current = stack.pop()!;
      neighbours = this.getNeighbours(current);
      neighbours.forEach((nId) => {
        if (!seen.has(nId)) {
          stack.push(nId);
          seen.add(nId);
        }});
    }
    return seen;
  }

  private bfsAndIters(id: DroneId) {
    const seen: Set<DroneId> = new Set([id]);
    const queue: DroneId[] = [id];
    let current: DroneId;
    let neighbours: Set<DroneId>;
    let i = 0;
    while (i < queue.length) {
      current = queue[i]!;
      i += 1
      neighbours = this.getNeighbours(current);
      neighbours.forEach((nId) => {
        if (!seen.has(nId)) {
          queue.push(nId);
          seen.add(nId);
        }});
    }
    return {seen: seen, i: i};
  }

  private bfsItersRequired(id: DroneId): number {
    return this.bfsAndIters(id)["i"];
  }

  public bfs(id: DroneId): Set<DroneId> {
    return this.bfsAndIters(id)["seen"];
  }

  public isLinked(a: DroneId, b: DroneId): boolean {
    // Modified BFS to check if there exists a link between two drones
    if (a === b) return true;
    const seen: Set<DroneId> = new Set([a]);
    const queue: DroneId[] = [a];
    let current: DroneId;
    let neighbours: Set<DroneId>;
    let i = 0;
    while (i < queue.length) {
      current = queue[i]!;
      i += 1
      neighbours = this.getNeighbours(current);
      for (const neighbor of neighbours) {
        if (neighbor === b) return true;
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return false;
  }

  public getDegree(id: DroneId): number {
    return this.getNeighbours(id).size;
  }

  public getConnectedComponents(): Map<DroneId, Set<DroneId>> {
    let remaining = this.getAll();
    let current: DroneId;
    const connectedComponents: Map<DroneId, Set<DroneId>> = new Map();
    while (remaining.size > 0) {
      current = remaining.values().next().value!;
      const seen = this.bfs(current);
      remaining = remaining.difference(seen);
      connectedComponents.set(current, seen);
    }
    return connectedComponents
  }

  public isConnected(): boolean {
    return this.getConnectedComponents().size === 1
  }

  public isPartitioned(): boolean {
    return this.getConnectedComponents().size > 1
  }

  public getDiameter(): number {
    // longest minimum communication distance between two nodes
    let maxDiameter = 0;
    this.getAll().forEach((neighbor) => {
      maxDiameter = Math.max(maxDiameter, this.bfsItersRequired(neighbor));
    })
    return maxDiameter;
  }
  
  public getAverageDegree(): number {
    const all = this.getAll();
    let totalDegree = 0;
    all.forEach((neighbor) => totalDegree += this.getDegree(neighbor));
    return totalDegree / all.size;
  }

  public getEdges(): ReadonlyArray<[DroneId, DroneId]> {
    const edges: [DroneId, DroneId][] = [];
    this.adjacency.keys().forEach((key) => {
      this.adjacency.get(key)!.forEach((neighbor) => {
        edges.push([neighbor, neighbor]);
      })
    })
    return edges as ReadonlyArray<[DroneId, DroneId]>;
  }
}