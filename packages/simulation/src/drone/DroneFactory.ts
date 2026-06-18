import {Vector3} from "three";
import {SeededRng, SpawnStrategy} from "@drone-swarm/shared";

export class DroneFactory {
  static spawn(strategy: SpawnStrategy, rng: SeededRng): Vector3[] {
    switch (strategy.type) {
      case "random": {
        const drones: Vector3[] = [];
        for (let i = 0; i < strategy.count; i++) {
          const x = rng.float(strategy.boundMin.x, strategy.boundMax.x);
          const y = rng.float(strategy.boundMin.y, strategy.boundMax.y);
          const z = rng.float(strategy.boundMin.z, strategy.boundMax.z);
          drones.push(new Vector3(x, y, z));
        }
        return drones;
      }
      case "grid": {
        const drones: Vector3[] = [];
        for (let x = 0; x < strategy.count.x; x++) {
          for (let y = 0; y < strategy.count.y; y++) {
            for (let z = 0; z < strategy.count.z; z++) {
              drones.push(
                new Vector3(
                  x * strategy.spacing,
                  y * strategy.spacing,
                  z * strategy.spacing
                )
              );
            }
          }
        }
        return drones;
      }
      case "cluster": {
        const drones: Vector3[] = [];
        // https://stackoverflow.com/questions/2751938/random-number-within-a-range-based-on-a-normal-distribution
        const dist = rng.normalDistribution(0, Math.sqrt(strategy.radius) / 3);
        for (let i = 0; i < strategy.count; i++) {
          const theta = rng.float(0, Math.PI);
          const phi = rng.float(0, 2 * Math.PI);
          let r = dist();
          while (r > strategy.radius) r = dist();
          const vector = new Vector3();
          drones.push(vector.setFromSphericalCoords(r, phi, theta));
        }
        return drones;
      }
      case "sphereSurface": {
        const drones: Vector3[] = [];
        for (let i = 0; i < strategy.count; i++) {
          const theta = rng.float(0, Math.PI);
          const phi = rng.float(0, 2 * Math.PI);
          const vector = new Vector3();
          drones.push(vector.setFromSphericalCoords(strategy.radius, phi, theta));
        }
        return drones;
      }
    }
  }
}