'use client';

import { 
  DepartmentType, 
  DEPARTMENTS, 
  DEPARTMENT_LABELS 
} from '../../../types/report.types';

interface DepartmentSelectorProps {
  selectedDepartment?: DepartmentType;
  onDepartmentChange: (department?: DepartmentType) => void;
}

export function DepartmentSelector({ 
  selectedDepartment, 
  onDepartmentChange 
}: DepartmentSelectorProps) {
  const departmentOptions = Object.values(DEPARTMENTS).map(departmentKey => ({
    value: departmentKey,
    label: DEPARTMENT_LABELS[departmentKey],
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onDepartmentChange(value ? (value as DepartmentType) : undefined);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Felelős osztály (opcionális)
      </label>
      
      <select
        value={selectedDepartment || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Válasszon osztályt...</option>
        {departmentOptions.map((department) => (
          <option key={department.value} value={department.value}>
            {department.label}
          </option>
        ))}
      </select>
      
      <p className="mt-1 text-xs text-gray-500">
        Ha tudja, melyik osztály hatáskörébe tartozik a bejelentés
      </p>
    </div>
  );
}