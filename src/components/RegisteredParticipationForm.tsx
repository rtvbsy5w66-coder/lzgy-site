"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserCheck, 
  Send, 
  ArrowLeft,
  Mail,
  Bell,
  Users,
  Heart,
  Info,
  Crown
} from 'lucide-react';
import { useThemeColors } from '@/context/ThemeContext';
import { RegisteredSignatureRequest, RegisteredVoteRequest } from '@/types/participation';

interface RegisteredParticipationFormProps {
  type: 'petition' | 'poll' | 'quiz';
  title: string;
  onSubmit: (data: RegisteredSignatureRequest | RegisteredVoteRequest) => void;
  onBack: () => void;
  isSubmitting: boolean;
  // For polls
  options?: Array<{ id: string; text: string; description?: string }>;
  selectedOptionId?: string;
  onOptionSelect?: (optionId: string) => void;
  // Session for auto-fill
  session?: any;
}

const RegisteredParticipationForm: React.FC<RegisteredParticipationFormProps> = ({
  type,
  title,
  onSubmit,
  onBack,
  isSubmitting,
  options = [],
  selectedOptionId,
  onOptionSelect,
  session
}) => {
  const colors = useThemeColors();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    postalCode: '',
    showName: false,
    allowContact: false,
    subscribeNewsletter: false
  });

  const [startTime] = useState(Date.now());

  // Auto-fill form data from session
  useEffect(() => {
    if (session?.user) {
      const user = session.user;
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    if (type === 'petition') {
      const data: RegisteredSignatureRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        city: formData.city || undefined,
        postalCode: formData.postalCode || undefined,
        showName: formData.showName,
        allowContact: formData.allowContact,
        subscribeNewsletter: formData.subscribeNewsletter
      };
      onSubmit(data);
    } else if (type === 'poll' && selectedOptionId) {
      const data: RegisteredVoteRequest = {
        optionId: selectedOptionId,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        timeSpent,
        subscribeUpdates: formData.subscribeNewsletter
      };
      onSubmit(data);
    }
  };

  const canSubmit = formData.firstName && formData.lastName && formData.email && 
    (type === 'petition' || (type === 'poll' && selectedOptionId));

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="p-4 rounded-full"
              style={{ background: colors.gradient }}
            >
              <UserCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Regisztrált Részvétel
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Kapcsolatban maradunk Önnel a további fejleményekről és eseményekről.
          </p>
        </div>

        {/* Title Card */}
        <Card className="mb-6 border-l-4" style={{ borderLeftColor: colors.accent }}>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
          </CardContent>
        </Card>

        {/* Premium User Status */}
        {session?.user && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-yellow-500" />
                <div>
                  <h3 className="text-yellow-600 dark:text-yellow-400 font-semibold">Prémium Felhasználó</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Adatai automatikusan kitöltve - {session.user.name || session.user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: selectedOptionId === option.id ? colors.accent : undefined
                    }}
                    onClick={() => onOptionSelect?.(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-4 h-4 rounded-full border-2`}
                        style={{
                          borderColor: selectedOptionId === option.id ? colors.accent : '#d1d5db',
                          backgroundColor: selectedOptionId === option.id ? colors.accent : 'transparent'
                        }}
                      >
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

        {/* Registration Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Kapcsolattartási adatok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Keresztnév *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vezetéknév *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email cím *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Város (opcionális)
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Irányítószám (opcionális)
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Privacy and Communication Preferences */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Adatvédelmi és kommunikációs beállítások
                </h4>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showName}
                    onChange={(e) => setFormData({ ...formData, showName: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">
                    Név nyilvános megjelenítése az aláírások között
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowContact}
                    onChange={(e) => setFormData({ ...formData, allowContact: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">
                    Kapcsolatfelvétel engedélyezése további információkért
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.subscribeNewsletter}
                    onChange={(e) => setFormData({ ...formData, subscribeNewsletter: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">
                    Hírlevel feliratkozás (havi frissítések és események)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
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
                    background: canSubmit ? colors.gradient : '#9ca3af'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-pulse" />
                      Küldés...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      {type === 'petition' ? 'Aláírás és Regisztráció' : 'Szavazás és Regisztráció'}
                    </>
                  )}
                </Button>
              </div>

              {/* Email Verification Notice */}
              <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="flex items-start gap-2">
                  <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Email megerősítés szükséges:</strong> {' '}
                    {type === 'petition' 
                      ? 'Az aláírás aktiválásához email megerősítést küldünk.'
                      : 'A szavazat érvényességéhez email megerősítést küldünk.'
                    }
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Regisztrált Részvétel Előnyei
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Frissítések kapása az eredményekről és következő lépésekről</li>
                  <li>• Értesítés hasonló témájú új petíciókról és szavazásokról</li>
                  <li>• Lehetőség véleménymondásra és aktív részvételre</li>
                  <li>• Hozzájárulás a demokratikus folyamatok erősítéséhez</li>
                  <li>• Bármikor lemondható hírlevel és értesítések</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisteredParticipationForm;