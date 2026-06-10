import {describe, expect, it, test, vi} from "vitest";
import {SpatialHash} from "./SpatialHash";
import {Vector3} from "three";


// // Basic correctness
// query returns drones within radius
// query excludes drones outside radius
// neighbours excludes the drone itself
//
// // Edge cases
// query on empty hash returns []
// drone exactly at boundary distance — decide: inclusive or exclusive, then test it
// two drones at identical positions both returned
// rebuild with new positions reflects updated locations (not stale)
//
// // Performance sanity check (not a unit test, just a bench)
// rebuild + 200 queries on 500 drones completes in < 2ms
const Drone = vi.fn(class {
    public location: Vector3;
    constructor(location: Vector3) {
        this.location = location;
    }
})

describe("Basic correctness", () => {
    it('should return drones within radius', () => {
        let hash = new SpatialHash(0.4);
        // in
        let d1 = new Drone(new Vector3(5, 0, 0));
        let d4 = new Drone(new Vector3(5, 0, 0.5));
        let d5 = new Drone(new Vector3(5.1, 0.1, 0.1));

        // out
        let d2 = new Drone(new Vector3(6.1, 0, 0));
        let d3 = new Drone(new Vector3(5, 0.9, 0.9));

        [d1,d2,d3,d4,d5].forEach(drone => {
            hash.addOne(drone, drone.location)
        })
        hash.rebuild()

        let res = hash.getNearTo(new Vector3(5, 0, 0), 1);
        console.log(res);
        expect(res).toContain(d1);
        expect(res).toContain(d4);
        expect(res).toContain(d5);
        expect(res).not.toContain(d2);
        expect(res).not.toContain(d3);

    });
})