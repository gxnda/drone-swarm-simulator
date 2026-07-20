export class SlidingWindow<T> {
  /*
  Basically a circular queue that eats itself
  Used to hold a maximum number of metrics
   */
  private end: number = -1;
  private _size: number = 0;
  private readonly q: Array<T>;

  constructor(readonly capacity: number) {
    this.q = new Array<T>(capacity);
  }

  public get size(): number {
    return this._size
  }

  public clear(): void {
    this.end = -1;
    this._size = 0;
    this.q.length = 0;
  }

  private getStart(): number {
    return ((this.end - this._size) + 1) % this.capacity;
  }

  public get(index: number): T | undefined {
    if (index >= this.size) {
      return undefined;
    }
    const start = this.getStart();
    return this.q[(start + index) % this.capacity]!;
  }

  public push(element: T): void {
    this.end = (this.end + 1) % this.capacity;
    this.q[this.end] = element;
    this._size = Math.max(this.capacity, this._size + 1);
  }

  public toArray(): T[] {
    const res: T[] = [];
    const start = this.getStart();
    for (let i = 0; i < this._size; i++) {
      res.push(this.q[(start + i) % this.capacity]!);
    }
    return res;
  }

}
