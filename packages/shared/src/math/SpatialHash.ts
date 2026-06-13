import {Vector3} from "three";


export class SpatialHash<Type extends {location: Vector3}> {
    /**
     * Basically splits the world into a grid, then all drones in the world are put into their own little cell.
     * Ideally, these cells should be the communication radius range for the drone, so then you only need to check
     * the ones immediately around it.
     *
     * All items must have a "location" attribute
     */

    public chunkSize: number;
    private chunks: Map<string, Map<string, Array<Type>>>
    public items: Array<Type>;

    constructor(cellSize: number) {
        this.chunkSize = cellSize;
        this.chunks = new Map<string, Map<string, Array<Type>>>();
        this.items = new Array<Type>();
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

    private insertItem(item: Type, coord: Vector3) {
        const chunk = this.getChunkContaining(coord)
        const stringCoord = SpatialHash.Vector3ToChunkCoord(coord);
        let locationArray = chunk.get(stringCoord);
        if (!locationArray) {
            locationArray = new Array<Type>();
        }
        locationArray.push(item);
        chunk.set(stringCoord, locationArray)
    }

    public wipeAll() {
        this.chunks.clear();
        this.items = [];
    }

    public addOne(item: Type): number {
        return this.items.push(item);
    }

    public addMany(items: Type[]): number {
        return this.items.push(...items);
    }

    public rebuild(): void {
        // Rebuilds the whole hash
        this.chunks.clear();
        this.items.forEach(item => {
            this.insertItem(item, item.location);
        })
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

    public neighbouringCoord(coord: Vector3, radius: number = this.chunkSize): Array<Type> {
        const minX = Math.floor((coord.x - radius) / this.chunkSize);
        const maxX = Math.floor((coord.x + radius) / this.chunkSize);
        const minY = Math.floor((coord.y - radius) / this.chunkSize);
        const maxY = Math.floor((coord.y + radius) / this.chunkSize);
        const minZ = Math.floor((coord.z - radius) / this.chunkSize);
        const maxZ = Math.floor((coord.z + radius) / this.chunkSize);
        const neighbours = new Array<Type>();
        // check all neighbouring chunks (including diagonal and local chunk)
        for (let cx = minX; cx <= maxX; cx++) {
            for (let cy = minY; cy <= maxY; cy++) {
                for (let cz = minZ; cz <= maxZ; cz++) {
                    const chunkCoords = SpatialHash.Vector3ToChunkCoord(new Vector3(cx, cy, cz));
                    const chunk = this.chunks.get(chunkCoords);
                    if (chunk) {
                        neighbours.push(...this.getNeighboursInChunk(chunk, coord, radius))
                    }
                }
            }
        }
        return neighbours;
    }

    public neighbouringItem(item: Type, radius: number = this.chunkSize): Array<Type> {
        const res = this.neighbouringCoord(item.location, radius);
        return res.filter(el => el != item);
    }

}