import {DroneId} from "@drone-swarm/shared";

export class NetworkTopology {
  private readonly adjacency: Map<DroneId, Set<DroneId>> = new Map();

  public getNeighbours(id: DroneId): Set<DroneId> {
    return this.adjacency.get(id) ?? new Set();
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

  private bfs(id: DroneId): Set<DroneId> {
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
    return seen;
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
    let remaining: Set<DroneId> = new Set(this.adjacency.keys());
    // If it's directed we might be missing receivers
    for (const neighbors of this.adjacency.values()) {
      for (const neighbor of neighbors) {
        remaining.add(neighbor);
      }
    }
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

}