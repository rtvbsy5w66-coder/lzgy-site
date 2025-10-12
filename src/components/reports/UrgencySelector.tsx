'use client';

import { 
  UrgencyType, 
  URGENCY_LEVELS, 
  URGENCY_LABELS, 
  URGENCY_ICONS,
  URGENCY_COLORS 
} from '../../../types/report.types';

interface UrgencySelectorProps {
  selectedUrgency: UrgencyType;
  onUrgencyChange: (urgency: UrgencyType) => void;
  error?: string;
}

export function UrgencySelector({ 
  selectedUrgency, 
  onUrgencyChange, 
  error 
}: UrgencySelectorProps) {
  const urgencyOptions = Object.values(URGENCY_LEVELS).map(urgencyKey => ({
    value: urgencyKey,
    label: URGENCY_LABELS[urgencyKey],
    icon: URGENCY_ICONS[urgencyKey],
    colorClass: URGENCY_COLORS[urgencyKey],
  }));

  const getUrgencyDescription = (urgency: UrgencyType): string => {
    switch (urgency) {
      case 'low':
        return 'Nem sürgős, időben megoldható';
      case 'medium':
        return 'Normál ütemezésű intézkedés';
      case 'high':
        return 'Sürgős beavatkozás szükséges';
      case 'emergency':
        return 'Azonnali intézkedés szükséges';
      default:
        return '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sürgősség *
      </label>
      
      <div className="space-y-2">
        {urgencyOptions.map((urgency) => (
          <div
            key={urgency.value}
            onClick={() => onUrgencyChange(urgency.value)}
            className={`
              p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedUrgency === urgency.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="urgency"
                value={urgency.value}
                checked={selectedUrgency === urgency.value}
                onChange={() => onUrgencyChange(urgency.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{urgency.icon}</span>
                  <span className="font-medium text-gray-900">
                    {urgency.label}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.colorClass}`}>
                    {urgency.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getUrgencyDescription(urgency.value)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {selectedUrgency && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Kiválasztott sürgősség:</span>{' '}
            {URGENCY_ICONS[selectedUrgency]} {URGENCY_LABELS[selectedUrgency]}
          </p>
        </div>
      )}
    </div>
  );
}