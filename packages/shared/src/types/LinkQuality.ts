export interface LinkQuality {
  latencyTicks: number; // ticks before message arrives
  dropProbability: number; // chance 0-1 of message getting lost
}