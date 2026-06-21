// @vitest-environment node

import {describe, expect, it, vi} from "vitest";
import {Engine} from "../src/Engine";
import {
    AlgorithmId,
    BoidsConfig,
    BoundaryBehaviour,
    SimulationConfig, WorldSnapshot,
} from "@drone-swarm/shared";
import {Vector3} from "three";

describe("Engine", () => {
    it("should initialize correctly", () => {
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
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            worldSize: new Vector3(200, 200, 200)
        };


        const engine = new Engine(config);
        engine.start();
        expect(engine.isRunning()).toBe(true);

        console.log(engine.world.droneHash.items);

        const snapshot: WorldSnapshot = engine.step();
        expect(snapshot).toBeDefined();
        expect(snapshot.droneSnapshots.length).toBe(10);
        expect(snapshot.tick).toBe(1);
    });

    it("should not crash with zero neighbours", () => {
        const config: SimulationConfig = {
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
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            worldSize: new Vector3(200, 200, 200)
        };

        const engine = new Engine(config);
        engine.start();

        // This should not throw an error
        const snapshot: WorldSnapshot = engine.step();
        expect(snapshot).toBeDefined();
    });

    it('should call updateDroneStates only once per step', () => {
        const config: SimulationConfig = {
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
            droneMaxSpeed: 5,
            droneMaxAccel: 1,
            worldSize: new Vector3(200, 200, 200)
        };

        const engine = new Engine(config);
        const updateDroneStatesSpy = vi.spyOn(engine as never, 'updateDroneStates');
        engine.step();
        expect(updateDroneStatesSpy).toHaveBeenCalledTimes(1);
    });
});
