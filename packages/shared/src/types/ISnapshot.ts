
export class ISnapshot {
    public serialise(): string {
        return JSON.stringify(this)
    }

    public static fromJSON(json: string): ISnapshot {
        let res: object = JSON.parse(json);
        if (res instanceof ISnapshot) {
            return res
        } else {
            throw new TypeError("Invalid JSON - Not a snapshot!")
        }
    }
}