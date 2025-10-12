'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { IssueCategory, FormField, IssueSubmissionData, IssuePriority } from '@/types/issues';
import { useThemeColors } from '@/context/ThemeContext';

interface DynamicIssueFormProps {
  category: IssueCategory;
  onSubmit: (data: IssueSubmissionData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function DynamicIssueForm({ category, onSubmit, onBack, isSubmitting = false }: DynamicIssueFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<Record<string, any>>({
    categoryId: category.id,
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    reporterAddress: '',
    title: '',
    description: '',
    location: '',
    urgency: IssuePriority.MEDIUM,
    customFields: {}
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const themeColors = useThemeColors();

  // Automatikusan kitölti a bejelentkezett felhasználó adatait
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        reporterName: session.user.name || '',
        reporterEmail: session.user.email || '',
      }));
    }
  }, [session]);

  const handleInputChange = (fieldId: string, value: any, isCustomField = false) => {
    if (isCustomField) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [fieldId]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldId]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Alapvető mezők validációja
    if (!formData.reporterName.trim()) {
      newErrors.reporterName = 'A név megadása kötelező';
    }
    
    if (!formData.reporterEmail.trim()) {
      newErrors.reporterEmail = 'Az email cím megadása kötelező';
    } else if (!/\S+@\S+\.\S+/.test(formData.reporterEmail)) {
      newErrors.reporterEmail = 'Érvényes email címet adjon meg';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'A probléma címe kötelező';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'A probléma leírása kötelező';
    }

    // Kategória-specifikus mezők validációja
    if (category.formFields) {
      category.formFields.forEach((field: FormField) => {
        const value = formData.customFields[field.id];
        
        if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
          newErrors[field.id] = `${field.label} megadása kötelező`;
        }
        
        if (value && field.validation) {
          const { min, max, pattern, message } = field.validation;
          
          if (min && value.length < min) {
            newErrors[field.id] = message || `Minimum ${min} karakter szükséges`;
          }
          
          if (max && value.length > max) {
            newErrors[field.id] = message || `Maximum ${max} karakter engedélyezett`;
          }
          
          if (pattern && !new RegExp(pattern).test(value)) {
            newErrors[field.id] = message || 'Érvénytelen formátum';
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submissionData: IssueSubmissionData = {
      categoryId: category.id,
      reporterName: formData.reporterName,
      reporterEmail: formData.reporterEmail,
      reporterPhone: formData.reporterPhone || undefined,
      reporterAddress: formData.reporterAddress || undefined,
      title: formData.title,
      description: formData.description,
      location: formData.location || undefined,
      urgency: formData.urgency,
      customFields: formData.customFields,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    onSubmit(submissionData);
  };

  const renderFormField = (field: FormField) => {
    const value = formData.customFields[field.id] || '';
    const error = errors[field.id];

    const baseInputClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
      error 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value, true)}
              placeholder={field.placeholder}
              className={baseInputClasses}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.id, parseInt(e.target.value) || '', true)}
              placeholder={field.placeholder}
              className={baseInputClasses}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value, true)}
              placeholder={field.placeholder}
              rows={4}
              className={baseInputClasses}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value, true)}
              className={baseInputClasses}
            >
              <option value="">Válasszon...</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(field.id, e.target.value, true)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={(value || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleInputChange(field.id, newValues, true);
                    }}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div 
        className="p-6 rounded-t-xl"
        style={{
          background: `linear-gradient(135deg, ${category.color || themeColors.gradientFrom}, ${category.color || themeColors.gradientTo})`
        }}
      >
        <button
          onClick={onBack}
          className="mb-4 text-white hover:text-gray-200 transition-colors duration-300"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Vissza a kategóriákhoz
        </button>
        
        <div className="flex items-center text-white">
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
            <i className={`${category.icon || 'fas fa-question-circle'} text-xl`}></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <p className="text-white text-opacity-90">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Bejelentő adatai */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-user mr-2 text-blue-600"></i>
            Kapcsolattartási adatok
            {session?.user && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                Bejelentkezve
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Teljes név <span className="text-red-500">*</span>
                {session?.user?.name && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                    (automatikusan kitöltve)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.reporterName}
                onChange={(e) => handleInputChange('reporterName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  errors.reporterName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  session?.user?.name ? 'bg-green-50 dark:bg-green-900/20' : ''
                }`}
                placeholder="Írja be a teljes nevét"
                readOnly={!!session?.user?.name}
              />
              {errors.reporterName && <p className="mt-1 text-sm text-red-500">{errors.reporterName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email cím <span className="text-red-500">*</span>
                {session?.user?.email && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                    (automatikusan kitöltve)
                  </span>
                )}
              </label>
              <input
                type="email"
                value={formData.reporterEmail}
                onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  errors.reporterEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  session?.user?.email ? 'bg-green-50 dark:bg-green-900/20' : ''
                }`}
                placeholder="pelda@email.com"
                readOnly={!!session?.user?.email}
              />
              {errors.reporterEmail && <p className="mt-1 text-sm text-red-500">{errors.reporterEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Telefonszám
              </label>
              <input
                type="tel"
                value={formData.reporterPhone}
                onChange={(e) => handleInputChange('reporterPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="+36 30 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Lakcím
              </label>
              <input
                type="text"
                value={formData.reporterAddress}
                onChange={(e) => handleInputChange('reporterAddress', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="1051 Budapest, Példa utca 1."
              />
            </div>
          </div>
        </div>

        {/* Probléma adatai */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-exclamation-triangle mr-2 text-orange-600"></i>
            Probléma részletei
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Probléma címe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Röviden foglalja össze a problémát"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Részletes leírás <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Írja le részletesen a problémát, hogy jobban megérthessük..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Helyszín
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                  placeholder="Pontos helyszín megadása"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sürgősség
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value as IssuePriority)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                >
                  <option value={IssuePriority.LOW}>Alacsony</option>
                  <option value={IssuePriority.MEDIUM}>Közepes</option>
                  <option value={IssuePriority.HIGH}>Magas</option>
                  <option value={IssuePriority.URGENT}>Sürgős</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Kategória-specifikus mezők */}
        {category.formFields && category.formFields.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <i className={`${category.icon || 'fas fa-question-circle'} mr-2`} style={{ color: category.color }}></i>
              {category.name} - Részletek
            </h3>
            
            {category.formFields.map(renderFormField)}
          </div>
        )}

        {/* Mellékletek */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-paperclip mr-2 text-gray-600"></i>
            Mellékletek (opcionális)
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <i className="fas fa-upload mr-2"></i>
              Fájlok kiválasztása
            </label>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Képek, PDF vagy Word dokumentumok (max 10 MB)
            </p>
          </div>

          {/* Attached files */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="fas fa-file mr-2 text-gray-500"></i>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-300"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Vissza
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: category.color || themeColors.gradientFrom,
              boxShadow: `0 4px 16px ${category.color || themeColors.gradientFrom}30`
            }}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Küldés...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Bejelentés küldése
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}