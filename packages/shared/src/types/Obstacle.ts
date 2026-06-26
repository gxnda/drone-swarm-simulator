import {Box3, Vector3} from "three";
import {ObstacleId} from "./ObstacleId";
import {SerialisedObstacle} from "./SerialisedObstacle";

export class Obstacle {
  id: ObstacleId
  box: Box3;

  constructor(id: ObstacleId, box: Box3) {
    this.id = id;
    this.box = box;
  }

  public static deserialise(o: SerialisedObstacle): Obstacle {
    if (o.type === "box") {
      return new Obstacle(
        o.id as ObstacleId,
        new Box3(new Vector3(...o.min), new Vector3(...o.max))
      );
    } else {
      throw new Error("Unknown obstacle");
    }
  }

  public contains(o: Obstacle, p: Vector3): boolean {
    return o.box.containsPoint(p)
  }

  public serialise(): SerialisedObstacle {
    return {
      type: "box",
      id: this.id as string,
      min: [this.box.min.x, this.box.min.y, this.box.min.z],
      max: [this.box.max.x, this.box.max.y, this.box.max.z]
    };
  }
}

