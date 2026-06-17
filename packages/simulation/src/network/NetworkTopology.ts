import {DroneId} from "@drone-swarm/shared";

export class NetworkTopology {
  private readonly adjacency: Map<DroneId, Set<DroneId>> = new Map();

  public getNeighbours(id: DroneId): Set<DroneId> {
    return this.adjacency.get(id) ?? new Set();
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