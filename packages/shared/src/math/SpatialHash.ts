import {Vector3} from "three";


export class SpatialHash<Type> {
    /**
     * Basically splits the world into a grid, then all drones in the world are put into their own little cell.
     * Ideally, these cells should be the communication radius range for the drone, so then you only need to check
     * the ones immediately around it.
     */

    public chunkSize: number;
    private chunks: Map<Vector3, Map<Vector3, Array<Type>>>
    private itemLocations: Map<Type, Vector3>

    constructor(cellSize: number) {
        this.chunkSize = cellSize;
        this.chunks = new Map<Vector3, Map<Vector3, Array<Type>>>();
        this.itemLocations = new Map<Type, Vector3>();
    }

    private static isVecValidChunkCoord(coords: Vector3): boolean {
        return Number.isInteger(coords.x) && Number.isInteger(coords.y) && Number.isInteger(coords.z)
    }

    private getSpecificChunk(chunkCoords: Vector3): Map<Vector3, Array<Type>> {
        if (!SpatialHash.isVecValidChunkCoord(chunkCoords)) {
            throw new TypeError("Chunk coord invalid!")
        }

        let chunk = this.chunks.get(chunkCoords);
        if (!chunk) {
            chunk = new Map<Vector3, Array<Type>>();
            this.chunks.set(chunkCoords, chunk);
        }
        return chunk;
    }

    private getChunkContaining(coords: Vector3): Map<Vector3, Array<Type>> {
        return this.getSpecificChunk(this.getChunkCoords(coords));
    }

    private getChunkCoords(coords: Vector3): Vector3 {
        return coords.clone().divideScalar(this.chunkSize).floor()
    }

    private insertItem(item: Type, coord: Vector3) {
        let chunk = this.getChunkContaining(coord)
        let locationArray = chunk.get(coord);
        if (!locationArray) {
            locationArray = new Array<Type>(item);
        }
        locationArray.push(item);
        chunk.set(coord, locationArray)
    }

    public wipeAll() {
        this.itemLocations.clear();
        this.chunks.clear();
    }

    public addOne(item: Type, coord: Vector3): void {
        this.itemLocations.set(item, coord)
    }

    public addMany(itemLocations: Map<Type, Vector3>): void {
        itemLocations.forEach((coord, item) => {
            itemLocations.set(item, coord)
        })
    }

    public rebuild(): void {
        // Rebuilds the whole hash
        this.chunks.clear();
        this.itemLocations.forEach((coord, item) => {
            this.insertItem(item, coord);
        })
    }

    private getNeighboursInChunk(chunk: Map<Vector3, Array<Type>>, coord: Vector3, radius: number): Array<Type> {
        let neighbours = new Array<Type>;
        chunk.forEach((itemArray, c) => {
            if (coord.distanceTo(c) <= radius) {
                neighbours.push(...itemArray)
            }
        });
        return neighbours;
    }

    public getNearTo(coord: Vector3, radius: number = this.chunkSize): Array<Type> {
        const minX = Math.floor((coord.x - radius) / this.chunkSize);
        const maxX = Math.floor((coord.x + radius) / this.chunkSize);
        const minY = Math.floor((coord.y - radius) / this.chunkSize);
        const maxY = Math.floor((coord.y + radius) / this.chunkSize);
        const minZ = Math.floor((coord.z - radius) / this.chunkSize);
        const maxZ = Math.floor((coord.z + radius) / this.chunkSize);
        let neighbours = new Array<Type>();
        // check all neighbouring chunks (including diagonal and local chunk)
        let delta = new Vector3();
        for (let cx = minX; cx <= maxX; cx++) {
            for (let cy = minY; cy <= maxY; cy++) {
                for (let cz = minZ; cz <= maxZ; cz++) {
                    const chunkCoords = new Vector3(cx, cy, cz);
                    const chunk = this.chunks.get(chunkCoords);
                    if (chunk) {
                        neighbours.push(...this.getNeighboursInChunk(chunk, coord, radius))
                    }
                }
            }
        }
        return neighbours;
    }

}