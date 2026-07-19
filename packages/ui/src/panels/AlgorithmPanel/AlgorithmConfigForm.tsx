import {AlgorithmConfig, BoidsConfig} from "@drone-swarm/shared";

interface AlgorithmConfigProps {
  config: AlgorithmConfig;
  onChange: (config: Partial<AlgorithmConfig>) => void;
}

type BoidsField = keyof BoidsConfig;

const boidsFieldConfigs: Array<{
  key: BoidsField;
  label: string;
  type: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
}> = [
  { key: 'communicationRange', label: 'Communication Range', type: 'number', min: 0 },
  { key: 'separationWeight', label: 'Separation Weight', type: 'range', min: 0, max: 5, step: 0.1 },
  { key: 'alignmentWeight', label: 'Alignment Weight', type: 'range', min: 0, max: 5, step: 0.1 },
  { key: 'cohesionWeight', label: 'Cohesion Weight', type: 'range', min: 0, max: 5, step: 0.1 },
  { key: 'separationRange', label: 'Separation Range', type: 'number', min: 0 },
];

function AlgorithmConfigForm({
  config,
  onChange
}: AlgorithmConfigProps) {
  switch (config.id) {
    case "boids": {
      const boidsConfig = config as BoidsConfig;
      const handleChange = (field: BoidsField, value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(num)) {
          onChange({ [field]: num });
        }
      };
      return (
        <div className="algorithm-config" key={config.id}>
          {boidsFieldConfigs.map(({key, label, type, min, max, step}) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                type={type}
                id={key}
                value={boidsConfig[key]}
                onChange={(e) => {handleChange(
                  key,
                  type === "number" ? e.target.value : e.target.valueAsNumber
                )}}
                min={min}
                max={max}
                step={step}
              />
            </div>
          ))}
        </div>
      )
    }
    case "gossip":
      return <div>Config for Gossip Algorithm</div>;
    case "consensus":
      return <div>Config for Consensus Algorithm</div>;
    case "stigmergy":
      return <div>Config for Stigmergy Algorithm</div>;
    default:
      return <div>Unknown algorithm</div>;
  }
}

export default AlgorithmConfigForm;