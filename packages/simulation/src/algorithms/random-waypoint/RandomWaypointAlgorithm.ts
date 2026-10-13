import {AlgorithmId, DroneId, Message, RandomWaypointConfig, SeededRng} from "@drone-swarm/shared";
import {Vector3} from "three";
import {ICoordinationAlgorithm} from "../ICoordinationAlgorithm";
import {Drone} from "../../drone/Drone";
import {WorldView} from "../../world/World";

export class RandomWaypointAlgorithm implements ICoordinationAlgorithm {
    readonly description: string = "Random Waypoint Algorithm";
    readonly id: AlgorithmId;
    readonly name: string = "Random Waypoint";
    readonly rng: SeededRng;
    readonly pauseTime: number;

    readonly targetLocationMap: Map<DroneId, Vector3>;
    readonly CountdownsUntilMovement: Map<DroneId, number>;

    constructor(config: RandomWaypointConfig) {
        // Doesn't use a threshold distance, we use drone max speed, since that is movement speed per tick.
        this.id = config.id;
        this.rng = new SeededRng(config.rngSeed);
        this.pauseTime = config.pauseTicks;
        this.targetLocationMap = new Map();
        this.CountdownsUntilMovement = new Map();
    }

    public initialise(_drones: ReadonlyArray<Drone>, _config: RandomWaypointConfig): void {
    }
    
    private getRandomTargetLocation(drone: Readonly<Drone>, world: Readonly<WorldView>): Vector3 {
        const location = world.bounds.randomPoint(this.rng);
        if (drone.is2D) {
            location.y = world.bounds.min.y;
        }
        return location;
    }

    public computeDesiredVelocity(
        drone: Readonly<Drone>,
        _neighbours: ReadonlyArray<Readonly<Drone>>,
        world: Readonly<WorldView>
    ): Vector3 {
        // if the drone is paused, decrement the countdown and return zero velocity
        if (this.CountdownsUntilMovement.has(drone.id) && this.CountdownsUntilMovement.get(drone.id)! > 0) {
            this.CountdownsUntilMovement.set(drone.id, this.CountdownsUntilMovement.get(drone.id)! - 1);
            return new Vector3(0, 0, 0);
        }
        // set a new target location if the drone doesn't have one yet
        if (!(this.targetLocationMap.has(drone.id))) {
            this.targetLocationMap.set(drone.id, this.getRandomTargetLocation(drone, world));
        }

        // work out which direction we're going in and if we're there yet
        const targetLocation = this.targetLocationMap.get(drone.id)!;
        const unscaledDirection = new Vector3().subVectors(targetLocation, drone.location);
        const distance = unscaledDirection.length();
        if (distance < (drone.maxSpeed ?? 50)) {
            this.CountdownsUntilMovement.set(drone.id, this.pauseTime);
            this.targetLocationMap.delete(drone.id);
            return new Vector3(0, 0, 0);
        }
        // calculate velocity (assuming we want to get there as fast as possible)
        return unscaledDirection.normalize().multiplyScalar(drone.maxSpeed ?? 50);
    }

    computeOutgoingMessages(
        _drone: Readonly<Drone>,
        _neighbours: ReadonlyArray<Readonly<Drone>>,
        _world: Readonly<WorldView>): ReadonlyArray<Message> {
        return [];
    }
}
