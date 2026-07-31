import {MetricId, SlidingWindow} from "@drone-swarm/shared";
import {useState} from "react";

interface MetricsPanelProps {
  metrics: Map<MetricId, SlidingWindow<number>>
  visibleMetrics: Map<MetricId, boolean>,
  onToggleMetric: (metricId: MetricId) => void,
}

function MetricsPanel({
  metrics,
  visibleMetrics,
  onToggleMetric,
}: MetricsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

}