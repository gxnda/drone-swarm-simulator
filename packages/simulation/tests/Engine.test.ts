// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { Engine } from "../src";
import {
    AlgorithmId,
    BoidsConfig,
    BoundaryBehaviour, EngineSnapshot,
    SimulationConfig,
} from "@drone-swarm/shared";
import { Vector3 } from "three";
import { WorldView } from "../src/world/World";

describe("Engine", () => {
    it("should initialize correctly", () => {
        const config: SimulationConfig = {
            boundsMax: new Vector3(100, 100, 100),
            boundsMin: new Vector3(-100, -100, -100),
            chunkSize: 10,
            dt: 1,
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
                cohesionWeight: 0.5,
                separationWeight: 0.5,
                alignmentWeight: 0.5,
                maxSpeed: 5,
                maxAccel: 1,
                communicationRange: 10,
                separationRange: 3
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
            metricConfig: {
                previousMetricCapacity: 25
            },
            obstacles: [],
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            worldSize: new Vector3(200, 200, 200)
        };

        const engine = new Engine(config);
        expect(engine).toBeDefined();
        expect(engine.isRunning()).toBe(false);
    });

    it("should run a simulation step without errors", () => {
        const config: SimulationConfig = {
            boundsMax: new Vector3(100, 100, 100),
            boundsMin: new Vector3(-100, -100, -100),
            chunkSize: 10,
            dt: 1,
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
                cohesionWeight: 0.5,
                separationWeight: 0.5,
                alignmentWeight: 0.5,
                maxSpeed: 5,
                maxAccel: 1,
                communicationRange: 10,
                separationRange: 3
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
            metricConfig: {
                previousMetricCapacity: 25
            },
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            obstacles: [],
            worldSize: new Vector3(200, 200, 200)
        };


        const engine = new Engine(config);
        engine.start();
        expect(engine.isRunning()).toBe(true);

        const snapshot: EngineSnapshot = engine.step();
        expect(snapshot).toBeDefined();
        expect(snapshot.world.droneSnapshots.length).toBe(10);
        expect(snapshot.world.tick).toBe(1);
    });

    it("should not crash with zero neighbours", () => {
        const config: SimulationConfig = {
            boundsMax: new Vector3(100, 100, 100),
            boundsMin: new Vector3(-100, -100, -100),
            chunkSize: 10,
            dt: 1,
            preferredBoundaryBehaviour: BoundaryBehaviour.REFLECT,
            seed: "test",
            spawnStrategy: {
                type: "random",
                count: 1,
                boundMin: new Vector3(-100, -100, -100),
                boundMax: new Vector3(100, 100, 100),
            },
            algorithmConfig: {
                id: "boids" as AlgorithmId,
                name: "Boids",
                description: "Boids algorithm",
                cohesionWeight: 0.5,
                separationWeight: 0.5,
                alignmentWeight: 0.5,
                maxSpeed: 5,
                maxAccel: 1,
                communicationRange: 0.0001, // very small range
                separationRange: 3
            } as BoidsConfig,
            networkConfig: {
                latencyConfig: {
                    type: "FlatLatencyConfig",
                    ticks: 1
                },
                attenuationConfig: {
                    type: "FreeSpaceConfig",
                    range: 0.0001
                }
            },
            metricConfig: {
                previousMetricCapacity: 25
            },
            obstacles: [],
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            worldSize: new Vector3(200, 200, 200)
        };

        const engine = new Engine(config);
        engine.start();

        // This should not throw an error
        const snapshot: EngineSnapshot = engine.step();
        expect(snapshot).toBeDefined();
    });

    it('should call updateDroneStates only once per step', () => {
        const config: SimulationConfig = {
            dt: 0.05,
            boundsMax: new Vector3(100, 100, 100),
            boundsMin: new Vector3(-100, -100, -100),
            chunkSize: 10,
            preferredBoundaryBehaviour: BoundaryBehaviour.REFLECT,
            seed: "test",
            spawnStrategy: {
                type: "random",
                count: 1,
                boundMin: new Vector3(-100, -100, -100),
                boundMax: new Vector3(100, 100, 100),
            },
            algorithmConfig: {
                id: "boids" as AlgorithmId,
                name: "Boids",
                description: "Boids algorithm",
                cohesionWeight: 0.5,
                separationWeight: 0.5,
                alignmentWeight: 0.5,
                maxSpeed: 5,
                maxAccel: 1,
                communicationRange: 10,
                separationRange: 3
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
            metricConfig: {
                previousMetricCapacity: 25
            },
            obstacles: [],
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            worldSize: new Vector3(200, 200, 200)
        };

        const engine = new Engine(config);
        const updateDroneStatesSpy = vi.spyOn(engine as never, 'updateDroneStates');
        engine.step();
        expect(updateDroneStatesSpy).toHaveBeenCalledTimes(1);
    });

    it("should use dt for elapsed time and movement", () => {
        const config: SimulationConfig = {
            boundsMax: new Vector3(100, 100, 100),
            boundsMin: new Vector3(-100, -100, -100),
            chunkSize: 10,
            dt: 0.25,
            preferredBoundaryBehaviour: BoundaryBehaviour.REFLECT,
            seed: "dt-test",
            spawnStrategy: {
                type: "grid",
                count: new Vector3(1, 1, 1),
                spacing: 1,
            },
            algorithmConfig: {
                id: "boids" as AlgorithmId,
                name: "Boids",
                description: "Boids algorithm",
                cohesionWeight: 0.5,
                separationWeight: 0.5,
                alignmentWeight: 0.5,
                maxSpeed: 5,
                maxAccel: 1,
                communicationRange: 0.0001,
                separationRange: 3
            } as BoidsConfig,
            networkConfig: {
                latencyConfig: {
                    type: "FlatLatencyConfig",
                    ticks: 1
                },
                attenuationConfig: {
                    type: "FreeSpaceConfig",
                    range: 0.0001
                }
            },
            metricConfig: {
                previousMetricCapacity: 25
            },
            obstacles: [],
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            worldSize: new Vector3(200, 200, 200)
        };

        const engine = new Engine(config);
        const drone = [...engine.world.getDrones()][0]!;
        const initialLocation = drone.location.clone();

        engine.step();

        expect(drone.location.x).toBeCloseTo(initialLocation.x + 0.25);
        expect(engine.world.elapsedSec).toBeCloseTo(0.25);
        expect(WorldView.fromWorld(engine.world).dt).toBe(0.25);
        expect(WorldView.fromWorld(engine.world).elapsedSec).toBeCloseTo(0.25);
    });

    it("should scale the acceleration limit by dt", () => {
        const config: SimulationConfig = {
            boundsMax: new Vector3(100, 100, 100),
            boundsMin: new Vector3(-100, -100, -100),
            chunkSize: 10,
            dt: 0.5,
            preferredBoundaryBehaviour: BoundaryBehaviour.REFLECT,
            seed: "acceleration-test",
            spawnStrategy: {
                type: "grid",
                count: new Vector3(1, 1, 1),
                spacing: 1,
            },
            algorithmConfig: {
                id: "boids" as AlgorithmId,
                name: "Boids",
                description: "Boids algorithm",
                cohesionWeight: 0,
                separationWeight: 0,
                alignmentWeight: 0,
                maxSpeed: 10,
                maxAccel: 2,
                communicationRange: 0.0001,
                separationRange: 3
            } as BoidsConfig,
            networkConfig: {
                latencyConfig: {
                    type: "FlatLatencyConfig",
                    ticks: 1
                },
                attenuationConfig: {
                    type: "FreeSpaceConfig",
                    range: 0.0001
                }
            },
            metricConfig: {
                previousMetricCapacity: 25
            },
            obstacles: [],
            droneMaxSpeed: 10,
            droneMaxAccel: 2,
            worldSize: new Vector3(200, 200, 200)
        };

        const engine = new Engine(config);
        engine.setAlgorithm({
            id: "boids" as AlgorithmId,
            name: "test",
            description: "test",
            computeDesiredVelocity: () => new Vector3(5, 0, 0),
            computeOutgoingMessages: () => [],
            initialise: () => undefined,
        });
        const drone = [...engine.world.getDrones()][0]!;

        engine.step();

        expect(drone.velocity.x).toBeCloseTo(2);
        expect(drone.acceleration.x).toBeCloseTo(2);
        expect(drone.location.x).toBeCloseTo(1);
    });
});
