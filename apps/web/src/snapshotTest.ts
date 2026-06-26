import {Vector3} from "three";

import {Engine} from "@drone-swarm/simulation";
import type {
  AlgorithmId,
  BoidsConfig,
  SimulationConfig
} from "@drone-swarm/shared";
import {
  BoundaryBehaviour,
} from "@drone-swarm/shared";
import {RenderPipeline} from "@drone-swarm/renderer";

const config: SimulationConfig = {
  boundsMax: new Vector3(100, 100, 100),
  boundsMin: new Vector3(-100, -100, -100),
  chunkSize: 10,
  preferredBoundaryBehaviour: BoundaryBehaviour.REFLECT,
  seed: "test",
  spawnStrategy: {
    type: "random",
    count: 10,
    boundMin: new Vector3(-100, -100, -100),
    boundMax: new Vector3(100, 100, 100),
  },
  algorithmConfig: {
    id: "boids" as AlgorithmId,
    name: "Boids",
    description: "Boids algorithm",
    cohesionWeight: 0.6,
    separationWeight: 1,
    alignmentWeight: 1,
    maxSpeed: 50,
    maxAccel: 10,
    communicationRange: 100,
    separationRange: 2
  } as BoidsConfig,
  networkConfig: {
    latencyConfig: {
      type: "FlatLatencyConfig",
      ticks: 1
    },
    attenuationConfig: {
      type: "FreeSpaceConfig",
      range: 20
    }
  },
  droneMaxSpeed: 5,
  droneMaxAccel: 1,
  obstacles: [],
  worldSize: new Vector3(200, 200, 200)
};


const engine = new Engine(config);
engine.start();

console.log(1);
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

console.log(2);
const pipeline = await RenderPipeline.create(canvas, config);

function animate() {
  requestAnimationFrame(animate);

  // Step simulation
  const snapshot = engine.step();

  // Update scene
  pipeline.update(snapshot);
  console.log(snapshot.world.droneSnapshots)

  // Render
  pipeline.render();
}
animate();
