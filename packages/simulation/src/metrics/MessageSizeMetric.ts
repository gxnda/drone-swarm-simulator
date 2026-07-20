import {IMetric} from "./IMetric";
import {Engine} from "../Engine";
import {MetricId, SlidingWindow} from "@drone-swarm/shared";

function sizeof(obj: object) {
  const encoder = new TextEncoder();
  const stack = [obj];
  const objectList = new Set<object>();
  let sizeBytes = 0;
  while (stack.length) {
    const value = stack.pop()!;
    switch (typeof value) {
      // https://stackoverflow.com/questions/2802957/number-of-bits-in-javascript-numbers
      case "number":
        sizeBytes += 8; // 64 bit floating point
        break;
      case "string":
        sizeBytes += encoder.encode(value).length;
        break;
      case "boolean":
        sizeBytes += 1; // maybe 4?
        break;
      case "object":
        if (obj === null) {
          sizeBytes += 1;
        } else if (!objectList.has(value)) {
          objectList.add(value);
          for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
              stack.push(Reflect.get(value, prop));
            }
          }
        }
        break;
    }
  }
  return sizeBytes;
}

export class MessageSizeMetric implements IMetric {
  public readonly name = "MessageComplexity" as MetricId;
  public readonly description: string = "Total messages sent per tick"
  public stats: SlidingWindow<number>;

  constructor(capacity: number) {
    this.stats = new SlidingWindow<number>(capacity);
  }

  public compute(engine: Engine): number {
    const metric = engine.getMessageBus().getMessagesAtCurrentTick();
    let averageSize = 0;
    if (metric && metric.length > 0) {
      averageSize = metric.reduce((a, b) => a + sizeof(b), 0)
      averageSize /= metric.length;
    }
    this.stats.push(averageSize);
    return averageSize;
  }

  public reset() {
    this.stats.clear();
  }
}
