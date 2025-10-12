'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SliderCategorySelector } from './SliderCategorySelector';
import { AddressAutocomplete } from './AddressAutocomplete';
import { UrgencySelector } from './UrgencySelector';
import { DepartmentSelector } from './DepartmentSelector';
import { CostEstimateSelector } from './CostEstimateSelector';
import { 
  CreateReportData, 
  CategoryType, 
  UrgencyType, 
  DepartmentType, 
  CostEstimateType 
} from '../../../types/report.types';
import { getSubcategoriesForCategory } from '../../../types/subcategories';

interface ReportFormLayoutProps {
  initialData?: Partial<CreateReportData>;
  onSubmit?: (data: CreateReportData) => Promise<void>;
  isEditing?: boolean;
}

export function ReportFormLayout({ 
  initialData, 
  onSubmit, 
  isEditing = false 
}: ReportFormLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<Partial<CreateReportData>>({
    category: undefined,
    subcategory: '',
    title: '',
    description: '',
    addressText: '',
    addressId: undefined,
    postalCode: '',
    affectedArea: '',
    urgency: 'medium' as UrgencyType,
    department: undefined,
    estimatedCost: undefined,
    legalIssue: false,
    categoryData: {},
    ...initialData,
  });

  // Available subcategories based on selected category
  const [availableSubcategories, setAvailableSubcategories] = useState<Array<{
    value: string;
    label: string;
    description?: string;
    icon?: string;
  }>>([]);

  // Handle URL parameters - PRE-SELECT category from slider
  useEffect(() => {
    const categoryId = searchParams.get('categoryId');
    const categoryName = searchParams.get('categoryName');

    if (categoryId) {
      // Pre-select category from slider
      setFormData(prev => ({
        ...prev,
        category: categoryId as CategoryType
      }));
    }
  }, [searchParams]);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const subcategories = getSubcategoriesForCategory(formData.category);
      setAvailableSubcategories(subcategories);
      
      // Reset subcategory if it's not valid for the new category
      if (formData.subcategory && !subcategories.find(sub => sub.value === formData.subcategory)) {
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setAvailableSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, formData.subcategory]);

  // Field update handler
  const updateField = (field: keyof CreateReportData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Kategória kiválasztása kötelező';
    }

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'A cím legalább 5 karakter hosszú kell legyen';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'A leírás legalább 10 karakter hosszú kell legyen';
    }

    if (!formData.addressText || formData.addressText.length < 3) {
      newErrors.addressText = 'A helyszín megadása kötelező (min. 3 karakter)';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Sürgősség megadása kötelező';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData as CreateReportData);
      } else {
        // Default submission - create new report
        const response = await fetch('/api/reports/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          router.push(`/bejelentes/success?id=${result.reportId}`);
        } else {
          setErrors({ submit: result.error || 'Hiba történt a mentés során' });
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: 'Hiba történt a mentés során' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Bejelentkezés szükséges
        </h2>
        <p className="text-gray-600 mb-6">
          A bejelentések leadásához be kell jelentkeznie.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Bejelentkezés
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Bejelentés szerkesztése' : 'Új bejelentés'}
          </h1>
          <p className="text-gray-600 mt-2">
            V. kerületi képviselői bejelentési rendszer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* 1. KATEGÓRIA KIVÁLASZTÁS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              1. Kategória és típus
            </h3>
            
            <SliderCategorySelector
              selectedCategoryId={formData.category}
              onCategoryChange={(categoryId) => updateField('category', categoryId)}
              error={errors.category}
            />
          </div>

          {/* 2. ALAPADATOK */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              2. Alapadatok
            </h3>

            {/* Cím */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bejelentés címe *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Rövid, tömör összefoglaló..."
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.title?.length || 0}/200 karakter
              </p>
            </div>

            {/* Leírás */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Részletes leírás *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={5}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Részletes leírás a problémáról vagy javaslatról..."
                maxLength={5000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description?.length || 0}/5000 karakter
              </p>
            </div>
          </div>

          {/* 3. HELYSZÍN */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              3. Helyszín
            </h3>

            <AddressAutocomplete
              selectedAddress={formData.addressText || ''}
              selectedAddressId={formData.addressId}
              onAddressChange={(address, addressId, postalCode) => {
                updateField('addressText', address);
                updateField('addressId', addressId);
                updateField('postalCode', postalCode);
              }}
              error={errors.addressText}
            />

            {/* Érintett terület */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Érintett terület (opcionális)
              </label>
              <input
                type="text"
                value={formData.affectedArea || ''}
                onChange={(e) => updateField('affectedArea', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="pl. teljes útszakasz, park területe..."
              />
            </div>
          </div>

          {/* 4. PRIORITÁS ÉS OSZTÁLYOZÁS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              4. Prioritás és osztályozás
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UrgencySelector
                selectedUrgency={formData.urgency!}
                onUrgencyChange={(urgency) => updateField('urgency', urgency)}
                error={errors.urgency}
              />

              <DepartmentSelector
                selectedDepartment={formData.department}
                onDepartmentChange={(department) => updateField('department', department)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <CostEstimateSelector
                selectedCost={formData.estimatedCost}
                onCostChange={(cost) => updateField('estimatedCost', cost)}
              />
            </div>

            {/* Jogi kérdés checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="legalIssue"
                checked={formData.legalIssue || false}
                onChange={(e) => updateField('legalIssue', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="legalIssue" className="ml-2 text-sm text-gray-700">
                Ez a bejelentés jogi kérdéseket is érint
              </label>
            </div>
          </div>

          {/* HIBÁK MEGJELENÍTÉSE */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mentés...' : (isEditing ? 'Módosítások mentése' : 'Bejelentés leadása')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}