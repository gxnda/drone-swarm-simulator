import {AttenuationConfig, LatencyConfig} from "@drone-swarm/shared";
import {FreeSpaceModel} from "./attenuation/FreeSpaceModel";
import {LogDistanceModel} from "./attenuation/LogDistanceModel";
import {FlatLatencyModel} from "./latency/FlatLatencyModel";
import {ContentionLatencyModel} from "./latency/ContentionLatencyModel";
import {IAttenuationModel} from "./attenuation/IAttenuationModel";
import {ILatencyModel} from "./latency/ILatencyModel";

export class AttenuationModelFactory {
  static fromConfig(config: AttenuationConfig): IAttenuationModel {
    switch (config.type) {
      case "FreeSpaceConfig":
        return new FreeSpaceModel(config.range);
      case "LogDistanceConfig":
        return new LogDistanceModel(config)
    }
  }
}

export class LatencyModelFactory {
  static fromConfig(config: LatencyConfig): ILatencyModel {
    switch (config.type) {
      case "FlatLatencyConfig":
        return new FlatLatencyModel(config.ticks)
      case "ContentionLatencyConfig":
        return new ContentionLatencyModel(config)
    }
  }
}