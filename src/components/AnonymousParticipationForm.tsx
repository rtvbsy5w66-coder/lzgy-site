"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Check, 
  ArrowLeft,
  Info,
  Clock,
  Users
} from 'lucide-react';
import { useThemeColors } from '@/context/ThemeContext';
import { AnonymousSignatureRequest, AnonymousVoteRequest } from '@/types/participation';

interface AnonymousParticipationFormProps {
  type: 'petition' | 'poll' | 'quiz';
  title: string;
  onSubmit: (data: AnonymousSignatureRequest | AnonymousVoteRequest) => void;
  onBack: () => void;
  isSubmitting: boolean;
  // For polls
  options?: Array<{ id: string; text: string; description?: string }>;
  selectedOptionId?: string;
  onOptionSelect?: (optionId: string) => void;
}

const AnonymousParticipationForm: React.FC<AnonymousParticipationFormProps> = ({
  type,
  title,
  onSubmit,
  onBack,
  isSubmitting,
  options = [],
  selectedOptionId,
  onOptionSelect
}) => {
  const colors = useThemeColors();
  const [formData, setFormData] = useState({
    ageRange: '',
    region: '',
    allowAnalytics: true
  });

  const [startTime] = useState(Date.now());

  const ageRanges = [
    { value: '18-25', label: '18-25 év' },
    { value: '26-35', label: '26-35 év' },
    { value: '36-45', label: '36-45 év' },
    { value: '46-55', label: '46-55 év' },
    { value: '56-65', label: '56-65 év' },
    { value: '65+', label: '65+ év' },
    { value: 'prefer-not-to-say', label: 'Inkább nem mondom' }
  ];

  const regions = [
    { value: 'budapest', label: 'Budapest' },
    { value: 'pest', label: 'Pest megye' },
    { value: 'debrecen', label: 'Debrecen' },
    { value: 'szeged', label: 'Szeged' },
    { value: 'miskolc', label: 'Miskolc' },
    { value: 'pecs', label: 'Pécs' },
    { value: 'gyor', label: 'Győr' },
    { value: 'nyiregyhaza', label: 'Nyíregyháza' },
    { value: 'kecskemet', label: 'Kecskemét' },
    { value: 'szekesfehervar', label: 'Székesfehérvár' },
    { value: 'other', label: 'Egyéb' },
    { value: 'prefer-not-to-say', label: 'Inkább nem mondom' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    if (type === 'petition') {
      const data: AnonymousSignatureRequest = {
        sessionId,
        ageRange: formData.ageRange || undefined,
        region: formData.region || undefined,
        allowAnalytics: formData.allowAnalytics
      };
      onSubmit(data);
    } else if (type === 'poll' && selectedOptionId) {
      const data: AnonymousVoteRequest = {
        optionId: selectedOptionId,
        sessionId,
        timeSpent,
        allowAnalytics: formData.allowAnalytics
      };
      onSubmit(data);
    }
  };

  const canSubmit = type === 'petition' || (type === 'poll' && selectedOptionId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="p-4 rounded-full"
              style={{ background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)' }}
            >
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Anonim Részvétel
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Gyors és privát módon vehet részt. Személyes adatok nélkül.
          </p>
        </div>

        {/* Title Card */}
        <Card className="mb-6 border-l-4" style={{ borderLeftColor: '#6b7280' }}>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
          </CardContent>
        </Card>

        {/* Poll Options (if applicable) */}
        {type === 'poll' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Válasszon egy opciót
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedOptionId === option.id
                        ? 'border-gray-500 bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onOptionSelect?.(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedOptionId === option.id
                          ? 'border-gray-500 bg-gray-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedOptionId === option.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{option.text}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optional Demographics Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Opcionális demográfiai adatok
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ezek az adatok segítenek megérteni a résztvevők összetételét. Teljesen opcionálisak és anonimak.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Korcsoport (opcionális)
                </label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Válasszon korcsoportot</option>
                  {ageRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Régió (opcionális)
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Válasszon régiót</option>
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Analytics Consent */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowAnalytics}
                    onChange={(e) => setFormData({ ...formData, allowAnalytics: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">
                    Engedélyezem az anonimizált statisztikák készítését
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Ez segít megérteni a platform használatát. Semmilyen személyes adat nem kerül tárolásra.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onBack}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Vissza
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1 text-white"
                  style={{ 
                    background: canSubmit ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)' : '#9ca3af'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Küldés...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {type === 'petition' ? 'Aláírás' : 'Szavazás'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Teljes Anonimitás Garantálva
                </h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Semmilyen személyes adat nem kerül tárolásra</li>
                  <li>• Az IP-cím hash-elve és 30 nap után törölve</li>
                  <li>• Nem használunk követő cookie-kat</li>
                  <li>• A demográfiai adatok teljesen anonimizáltak</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnonymousParticipationForm;