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
  boundsMax: new Vector3(300, 300, 300),
  boundsMin: new Vector3(-300, -300, -300),
  chunkSize: 10,
  preferredBoundaryBehaviour: BoundaryBehaviour.REFLECT,
  seed: "test",
  spawnStrategy: {
    type: "random",
    count: 20,
    boundMin: new Vector3(-100, -100, -100),
    boundMax: new Vector3(100, 100, 100),
  },
  algorithmConfig: {
    id: "boids" as AlgorithmId,
    name: "Boids",
    description: "Boids algorithm",
    cohesionWeight: 0.6,
    separationWeight: 6,
    alignmentWeight: 0.01,
    communicationRange: 20,
    separationRange: 30
  } as BoidsConfig,
  networkConfig: {
    latencyConfig: {
      type: "FlatLatencyConfig",
      ticks: 1
    },
    attenuationConfig: {
      type: "FreeSpaceConfig",
      range: 14
    }
  },
  droneMaxSpeed: 7,
  droneMaxAccel: 0.005,
  droneMinSpeed: 5,
  obstacles: [],
  worldSize: new Vector3(200, 200, 200)
};


const engine = new Engine(config);
engine.start();

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const pipeline = await RenderPipeline.create(canvas, config);

function animate() {
  requestAnimationFrame(animate);

  // Step simulation
  const snapshot = engine.step();

  // Update scene
  pipeline.update(snapshot);

  // Render
  pipeline.render();
}
animate();
