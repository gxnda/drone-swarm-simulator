import {Box3, Vector3} from "three";

type SpatialEntity =
  | { location: Vector3; box?: never }   // point entity
  | { box: Box3; location?: never };     // box entity

export class SpatialHash<Type extends SpatialEntity> {
    /**
     * Basically splits the world into a grid, then all drones in the world are put into their own little cell.
     * Ideally, these cells should be the communication radius range for the drone, so then you only need to check
     * the ones immediately around it.
     *
     * All items must have a "location" attribute
     */

    public readonly chunkSize: number;
    private chunks: Map<string, Map<string, Array<Type>>>
    private readonly _items: Set<Type>;

    constructor(cellSize: number) {
        this.chunkSize = cellSize;
        this.chunks = new Map<string, Map<string, Array<Type>>>();
        this._items = new Set<Type>();
    }

    public get items(): ReadonlySet<Type> {
        return this._items;
    }

    public addItem(item: Type) {
        this._items.add(item);
    }

    public removeItem(item: Type) {
        this._items.delete(item);
        this.chunks.forEach((chunk => {
            chunk.forEach((values, key) => {
                const filtered = values.filter(v => v !== item);
                if (filtered.length !== values.length) {
                    chunk.set(key, filtered);
                    return;
                }
            });
        }));
    }

    private static ChunkCoordToVector3(coords: string): Vector3 {
        const firstThree = coords.split(" ").slice(0, 3);
        return new Vector3(...firstThree.map(parseFloat));
    }

    private static Vector3ToChunkCoord(vec: Vector3): string {
        return `${vec.x} ${vec.y} ${vec.z}`
    }

    private static isValidChunkCoord(coords: string): boolean {
        const vec = SpatialHash.ChunkCoordToVector3(coords)
        return SpatialHash.isVecValidChunkCoord(vec)
    }

    private static isVecValidChunkCoord(vec: Vector3): boolean {
        return Number.isInteger(vec.x) && Number.isInteger(vec.y) && Number.isInteger(vec.z)
    }

    private getChunkCentre(coords: string): Vector3 {
        return SpatialHash.ChunkCoordToVector3(coords)
          .multiplyScalar(this.chunkSize)
          .add(
            new Vector3(1, 1, 1)
              .normalize()
              .multiplyScalar(this.chunkSize / 2)
          )
    }

    private getSpecificChunk(chunkCoords: string): Map<string, Array<Type>> {
        if (!SpatialHash.isValidChunkCoord(chunkCoords)) {
            throw new TypeError("Chunk coord invalid!")
        }

        let chunk = this.chunks.get(chunkCoords);
        if (!chunk) {
            chunk = new Map<string, Array<Type>>();
            this.chunks.set(chunkCoords, chunk);
        }
        return chunk;
    }

    private getChunkContaining(coords: Vector3): Map<string, Array<Type>> {
        return this.getSpecificChunk(this.getChunkCoords(coords));
    }

    private getChunkCoords(coords: Vector3): string {
        return SpatialHash.Vector3ToChunkCoord(coords.clone().divideScalar(this.chunkSize).floor())
    }

    private addToChunk(chunk: Map<string, Type[]>, stringCoord: string, item: Type): Map<string, Type[]> {
        // Adds item to chunk at given coord, keeps a list at that coord
        // incase there is overlap, but disallows duplicate items.
        let locationArray = chunk.get(stringCoord);
        if (!locationArray) {
            locationArray = new Array<Type>();
        }
        if (!locationArray.includes(item)) {
            locationArray.push(item);
        }
        return chunk.set(stringCoord, locationArray);
    }


    private insertItem(item: Type) {
        if ("location" in item) {
            const chunk = this.getChunkContaining(item.location!);
            const stringCoord = SpatialHash.Vector3ToChunkCoord(item.location!);
            this.addToChunk(chunk, stringCoord, item);
        } else if ("box" in item) {
            const box = item.box;
            const min = box.min.clone().divideScalar(this.chunkSize).floor();
            const max = box.max.clone().divideScalar(this.chunkSize).floor();

            let lastChunk: Map<string, Type[]> | undefined;
            const iterCoord = new Vector3();
            for (let x = min.x; x <= max.x; x++) {
                for (let y = min.y; y <= max.y; y++) {
                    for (let z = min.z; z <= max.z; z++) {
                        iterCoord.set(x, y, z);
                        const chunk = this.getSpecificChunk(SpatialHash.Vector3ToChunkCoord(iterCoord));

                        if (chunk === lastChunk) continue;
                        const stringCoord = SpatialHash.Vector3ToChunkCoord(iterCoord);
                        this.addToChunk(chunk, stringCoord, item);
                        lastChunk = chunk;
                    }
                }
            }
        } else {
            throw new Error("Item must have either 'location' or 'box'");
        }
    }

    public wipeAll() {
        this.chunks.clear();
        this._items.clear();
    }

    public addOne(item: Type): number {
        this.addItem(item);
        return this.items.size
    }

    public addMany(items: Iterable<Type>): number {
        for (const item of items) {
            this.addItem(item);
        }
        return this.items.size;
    }

    public rebuild(): void {
        // Rebuilds the whole hash
        this.chunks.clear();
        this.items.forEach(item => this.insertItem(item));
    }

    private getNeighboursInChunk(chunk: Map<string, Array<Type>>, coord: Vector3, radius: number): Array<Type> {
        const neighbours = new Array<Type>;
        chunk.forEach((itemArray, c) => {
            const cVec = SpatialHash.ChunkCoordToVector3(c);
            if (coord.distanceTo(cVec) <= radius) {
                neighbours.push(...itemArray)
            }
        });
        return neighbours;
    }

    public getBoxesInChunk(chunk: Map<string, Array<Type>>) {
        return Array.from(chunk.values())
          .flat()
          .filter(item => "box" in item)
          .map(item => item.box) as Array<Box3>;
    }

    public getPointsInChunk(chunk: Map<string, Array<Type>>) {
        return Array.from(chunk.values())
          .flat()
          .filter(item => "location" in item)
          .map(item => item.location) as Array<Vector3>;
    }

    public neighbouringCoord(coord: Vector3, radius: number = this.chunkSize): Array<Type> {
        const minX = Math.floor((coord.x - radius) / this.chunkSize);
        const maxX = Math.floor((coord.x + radius) / this.chunkSize);
        const minY = Math.floor((coord.y - radius) / this.chunkSize);
        const maxY = Math.floor((coord.y + radius) / this.chunkSize);
        const minZ = Math.floor((coord.z - radius) / this.chunkSize);
        const maxZ = Math.floor((coord.z + radius) / this.chunkSize);
        const neighbours = new Array<Type>();
        const added = new Set<Type>();
        // check all neighbouring chunks (including diagonal and local chunk)
        for (let cx = minX; cx <= maxX; cx++) {
            for (let cy = minY; cy <= maxY; cy++) {
                for (let cz = minZ; cz <= maxZ; cz++) {
                    const chunkCoord = SpatialHash.Vector3ToChunkCoord(new Vector3(cx, cy, cz));
                    const chunk = this.chunks.get(chunkCoord);
                    if (!chunk) continue;
                    const chunkCenter = this.getChunkCentre(chunkCoord);
                    // check if the furthest point of the chunk is in
                    // the radius
                    if (chunkCenter.distanceTo(coord) > radius + this.chunkSize * Math.SQRT2) continue;
                    console.log(chunk);
                    for (const [itemStringCoord, items] of chunk) {
                        const itemCoord = SpatialHash.ChunkCoordToVector3(itemStringCoord)
                        const dist = coord.distanceTo(itemCoord);
                        // actually checks distance here
                        if (dist > radius) continue;
                        for (const item of items) {
                            if (added.has(item)) continue;
                            neighbours.push(item);
                            added.add(item);
                        }
                    }
                }
            }
        }
        return neighbours;
    }

    public neighbouringItem(item: Type, radius: number = this.chunkSize): Array<Type> {
        if ("location" in item) {
            const res = this.neighbouringCoord(item.location!, radius);
            return res.filter(el => el != item);
        } else {
            throw new Error("Could not find single location of object");
        }
    }

    private distanceFromPointToItem(p: Vector3, item: Type): number {
        if ('location' in item) {
            return p.distanceTo(item.location!);
        } else {
            return item.box.distanceToPoint(p);
        }
    }

    public hasContainingBox(p: Vector3): boolean {
        const boxes = this.getBoxesInChunk(this.getChunkContaining(p));
        return boxes.some(box => box.containsPoint(p));
    }
}