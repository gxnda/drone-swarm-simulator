// @vitest-environment node

import {describe, expect, it, vi} from "vitest";
import {SpatialHash} from "../../src/math/SpatialHash";
import {Vector3} from "three";


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
    it('should only return drones within radius', () => {
        let hash = new SpatialHash(0.4);
        // in
        let d1 = new Drone(new Vector3(5, 0, 0));
        let d4 = new Drone(new Vector3(5, 0, 0.5));
        let d5 = new Drone(new Vector3(5.1, 0.1, 0.1));

        // out
        let d2 = new Drone(new Vector3(6.1, 0, 0));
        let d3 = new Drone(new Vector3(5, 0.9, 0.9));

        [d1,d2,d3,d4,d5].forEach(drone => {
            hash.addOne(drone)
        })
        hash.rebuild()

        let res = hash.neighbouringCoord(new Vector3(5, 0, 0), 1);
        expect(res).toContain(d1);
        expect(res).toContain(d4);
        expect(res).toContain(d5);
        expect(res).not.toContain(d2);
        expect(res).not.toContain(d3);
    });
    it('neighbour finding should exclude the drone itself', () => {
        let hash = new SpatialHash(0.4);
        let d1 = new Drone(new Vector3(5, 0, 0));
        hash.addOne(d1);
        hash.rebuild();
        let res = hash.neighbouringItem(d1, 1);
        expect(res).not.toContain(d1);
    });
    it("updates locations when item location changes", () => {
        let hash = new SpatialHash(0.4);
        let d1Loc = new Vector3(0.5, 0, 0);
        let d1 = new Drone(d1Loc);
        hash.addOne(d1);
        hash.rebuild();
        let res = hash.neighbouringCoord(new Vector3(0, 0, 0), 1);
        expect(res).toContain(d1);

        d1Loc.set(2, 0, 0);
        hash.rebuild();
        res = hash.neighbouringCoord(new Vector3(0, 0, 0), 1);
        expect(res).not.toContain(d1);

        // Changes reference
        d1.location = new Vector3(0.5, 0, 0)
        hash.rebuild();
        res = hash.neighbouringCoord(new Vector3(0, 0, 0), 1);
        expect(res).toContain(d1);
    })
})

describe("Edge cases", () => {
    it("nothing returned when the hash is empty", () => {
        let hash = new SpatialHash(0.4);
        let res = hash.neighbouringCoord(new Vector3(5, 0, 0), 1);
        expect(res).toEqual([]);
    });
    it("includes drones on the boundary", () => {
        let hash = new SpatialHash(1);
        let d1 = new Drone(new Vector3(5, 0, 0));
        let d2 = new Drone(new Vector3(-5, 0, 0));
        let d3 = new Drone(new Vector3(0, 0, 5));
        let d4 = new Drone(new Vector3(0, 0, -5));
        let d5 = new Drone(new Vector3(0, 5, 0));
        let d6 = new Drone(new Vector3(0, -5, 0));

        [d1,d2,d3,d4,d5,d6].forEach(drone => {
            hash.addOne(drone)
        })
        hash.rebuild()

        let res = hash.neighbouringCoord(new Vector3(0, 0, 0), 5);
        expect(res).toContain(d1);
        expect(res).toContain(d2);
        expect(res).toContain(d3);
        expect(res).toContain(d4);
        expect(res).toContain(d5);
        expect(res).toContain(d6);
        expect(res).toHaveLength(6);
    });
    it("returns two drones at the same position", () => {
        let hash = new SpatialHash(1);
        let d1 = new Drone(new Vector3(0.5, 0, 0));
        let d2 = new Drone(new Vector3(0.5, 0, 0));
        [d1,d2].forEach(drone => {
            hash.addOne(drone)
        })
        hash.rebuild()

        let res = hash.neighbouringCoord(new Vector3(0, 0, 0), 2);
        expect(res).toContain(d1)
        expect(res).toContain(d2)
        expect(res).toHaveLength(2);
    })
})