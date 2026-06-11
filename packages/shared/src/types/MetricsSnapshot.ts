import {ISnapshot} from "./ISnapshot";

export class MetricsSnapshot extends ISnapshot {
    public frameRate: number;
    public mspt: number;
    public numberOfRenderedEntities: number;

    constructor(frameRate: number, mspt: number, numberOfRenderedEntities: number) {
        super();
        this.frameRate = frameRate;
        this.mspt = mspt;
        this.numberOfRenderedEntities = numberOfRenderedEntities;
    }
}