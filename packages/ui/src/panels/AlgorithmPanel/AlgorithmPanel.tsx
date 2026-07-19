import {AlgorithmConfig, AlgorithmId} from "@drone-swarm/shared";

import {useState} from "react";
import AlgorithmConfigForm from "./AlgorithmConfigForm";

interface AlgorithmPanelProps {
  availableAlgorithms: {id: AlgorithmId, name: string, description: string}[],
  activeAlgorithmId: AlgorithmId,
  currentAlgorithmConfig: AlgorithmConfig,
  onAlgorithmChange: (id: AlgorithmId) => void,
  onConfigChange: (patch: Partial<AlgorithmConfig>) => void,
}

function AlgorithmPanel({
  availableAlgorithms,
  activeAlgorithmId,
  currentAlgorithmConfig,
  onAlgorithmChange,
  onConfigChange
}: AlgorithmPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeAlgorithm = availableAlgorithms.find(
    (alg) => alg.id === activeAlgorithmId
  );

  return (
    <div className={"algorithm-panel"}>
      <select
        value={activeAlgorithmId}
        onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmId)}>
        {availableAlgorithms.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      {activeAlgorithm && (
        <p className="algorithm-description">{activeAlgorithm!.description}</p>
      )}

      <button onClick={() => setIsExpanded((prev) => !prev)}>
        {isExpanded ? "Hide config" : "Show config"}
      </button>

      {isExpanded && (
        <AlgorithmConfigForm
          config={currentAlgorithmConfig}
          onChange={onConfigChange}
        />
      )}
    </div>
  )
}

export default AlgorithmPanel;