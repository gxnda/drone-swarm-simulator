import random from "random";

export class SeededRng {
  public generator;

  constructor(readonly seed?: number | string) {
    if (seed) {
      this.seed = seed;
      random.use(seed);
    }
    this.generator = random;
  }

  public int(min: number = 0, max: number = 1) {
    return this.generator.int(min, max);
  }
  public float(min: number = 0, max: number = 1) {
    return this.generator.float(min, max);
  }
  public boolean() {
    return this.generator.boolean();
  }
  public normalDistribution(mu: number, sigma: number) {
    return this.generator.normal(mu, sigma);
  }
  public normal(mu: number, sigma: number): number {
    return this.normalDistribution(mu, sigma)();
  }

}