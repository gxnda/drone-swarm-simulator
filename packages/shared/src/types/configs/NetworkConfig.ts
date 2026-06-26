export interface NetworkConfig {
  readonly attenuationConfig: AttenuationConfig;
  readonly latencyConfig: LatencyConfig
}

export interface FlatLatencyConfig {
  type: "FlatLatencyConfig"
  ticks?: number
}
export interface ContentionLatencyConfig {
  type: "ContentionLatencyConfig"
  baseLatencyTicks: number;
  addedTicksPerNeighbor: number;
}
export type LatencyConfig =
  | FlatLatencyConfig
  | ContentionLatencyConfig

export interface FreeSpaceConfig {
  type: "FreeSpaceConfig"
  range: number;
}
export interface LogDistanceConfig {
  type: "LogDistanceConfig"
  referenceDistance: number
  referencePathLoss: number
  pathLossExponent: number
  shadowFadingStdDev: number
  receiverSensitivity: number
  maxRange: number
  dropSteepness: number
}
export type AttenuationConfig =
  | FreeSpaceConfig
  | LogDistanceConfig
