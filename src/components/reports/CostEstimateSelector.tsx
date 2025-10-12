'use client';

import { 
  CostEstimateType, 
  COST_ESTIMATES, 
  COST_ESTIMATE_LABELS 
} from '../../../types/report.types';

interface CostEstimateSelectorProps {
  selectedCost?: CostEstimateType;
  onCostChange: (cost?: CostEstimateType) => void;
}

export function CostEstimateSelector({ 
  selectedCost, 
  onCostChange 
}: CostEstimateSelectorProps) {
  const costOptions = Object.values(COST_ESTIMATES).map(costKey => ({
    value: costKey,
    label: COST_ESTIMATE_LABELS[costKey],
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onCostChange(value ? (value as CostEstimateType) : undefined);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Becsült költség (opcionális)
      </label>
      
      <select
        value={selectedCost || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Válasszon költségkategóriát...</option>
        {costOptions.map((cost) => (
          <option key={cost.value} value={cost.value}>
            {cost.label}
          </option>
        ))}
      </select>
      
      <p className="mt-1 text-xs text-gray-500">
        Amennyiben tudja, körülbelül mennyibe kerülhet a megoldás
      </p>
    </div>
  );
}