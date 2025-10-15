
interface FeatureBarProps {
  name: string;
  credits: string;
  percentage: number;
  color?: string;
  estimatedCost?: string;
}

export const FeatureBar = ({ name, credits, percentage, color = "#8A3FFC", estimatedCost }: FeatureBarProps) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2">
      <div>
        <div className="text-white text-sm font-medium">{name}</div>
        <div className="text-gray-500 text-xs">{credits}</div>
        {estimatedCost && (
          <div className="text-gray-500 text-xs">{estimatedCost}</div>
        )}
      </div>
      <div className="text-sm font-semibold" style={{ color }}>{percentage}%</div>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-2">
      <div
        className="h-2 rounded-full"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

export default FeatureBar;