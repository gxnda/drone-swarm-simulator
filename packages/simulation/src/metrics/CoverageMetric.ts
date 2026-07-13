import {SpatialHash} from "@drone-swarm/shared";
import {Drone} from "../drone/Drone";
import {Vector3} from "three";
import {NetworkTopology} from "../network/NetworkTopology";
import {Bounds} from "../world/Bounds";
import {IMetric} from "./IMetric";
import {Engine} from "../Engine";

/**
 * INFO: Likely obsolete, not a massively useful metric
 * What fraction of the world is covered by the drone ranges
 */
export class CoverageMetric implements IMetric {
  public readonly name: string = "Coverage";
  public readonly description: string = "The fraction of the world covered" +
    " by the drone ranges";
  public stats: number[] = [];

  public compute(engine: Engine): number {
    // TODO: Make efficient
    /**
     * There are a few ways to do this:
     * - Brute force against integers in the bounds of the world
     *  - Binary search against integers to find the boundaries of the
     *  region, assuming it's completely connected (May need to do this for
     *  each partition in the network).
     * - Approximating using convex hull volume
     */
    // I'm just doing a simple brute force here, so then the attenuation
    // dropProbability is incorporated into it extremely accurately
    const coverage: number = this.bruteForce(engine.world.droneHash, engine.getTopology(), engine.world.bounds);
    this.stats.push(coverage);
    return coverage;
  }

  private bruteForce(droneHash: SpatialHash<Drone>, topology: NetworkTopology, bounds: Bounds): number {
    let totalVolume = 0;
    const boundedPoints = bounds.iterate();
    // iterate over each unit box within in the bounds
    for (const p of boundedPoints) {
      // Check if this unit box is covered by any drone
      totalVolume += topology.getMaxAttenuationAt(p, droneHash);
    }
    return totalVolume;
  }

  public reset(): void {
    this.stats = [];
  }

  private createConvexHull(_ps: Vector3[]) {
    // https://web.archive.org/web/20180106161310/http://thomasdiewald.com/blog/?p=1888

    // 1) Initial phase

    //  1. Create initial simplex (tetrahedron, 4 vertices). To do this, the 6
    //  Extreme Points [EP], min/max points in X,Y and Z, of the given
    //  point cloud are extracted. From those 6 EP the two most distant
    //  build the base-line of the base triangle. The most distant point of
    //  EP to the baseline is the 3rd point of the base-triangle. To find
    //  the pyramids apex, the most distant point to the base-triangle is
    //  searched for in the whole point-list. Now having 4 points, the
    //  initial pyramid can easily be created.

    //  2. Assign points to faces. Each point in the point-list is assigned to
    //  the first face the point is in front of (“point can see face”). So
    //  each point is assigned to only one face, and each face contains its
    //  own point-set. Points that are behind all faces, are therefore
    //  automatically ignored and not used in the further process. I use a
    //  separate 2-dimensional dynamic structure for the faces point-sets.

    //  3. Push the 4 faces on the stack. Faces without points are ignored.


    // 2) Iteration Phase

    // 1. If Stack is not empty Pop Face from Stack . … and check if it has a
    // point-set, otherwise continue next iteration. Although in fact empty faces are not pushed to the stack in the first place.
    // Get most distant point of the face’s point-set.

    // 2. Find all faces that can be seen from that point. Those faces must
    // be adjacent to the current face. I call them light-faces in my
    // implementation, and therefore the point can be seen as a
    // point-light. All found light-faces are labelled as such and also
    // temporarily saved to a heap for later use.

    // 3. Extract horizon edges of light-faces and extrude to Point. Clearly
    // there is exactly one closed and convex horizon from the points view
    // that encloses all light-faces. Now each horizon-segment and the
    // current point build a new triangle. So the horizon is somehow
    // projected to the point. The new faces are build and attached to the
    // mesh (and also temporarily saved to a heap) while iteration through
    // the horizon-edges, which automatically detaches all light-faces.
    // Assign all points off all light-faces to the new created faces. This
    // is exactly the same procedure as in 1.2. Each point is assigned to
    // the first face it can see. I tried different assigning priorities,
    // but it didn’t help much. But again, points behind all faces, are
    // ignored in the further process.

    // Push new created faces on the stack, and start at (2.1). Faces
    // without points are ignored.
  }
}