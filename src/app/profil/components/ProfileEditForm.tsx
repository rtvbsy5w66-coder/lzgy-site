"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Edit
} from 'lucide-react';
import { User as NextAuthUser } from 'next-auth';
import { useSession } from 'next-auth/react';

interface ProfileEditFormProps {
  user: NextAuthUser;
  onProfileUpdate?: (updatedData: any) => void;
}

export function ProfileEditForm({ user, onProfileUpdate }: ProfileEditFormProps) {
  const { update } = useSession();
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: (user as any).displayName || user.name || '',
        phoneNumber: (user as any).phoneNumber || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sikertelen profil frissítés');
      }

      setMessage({
        type: 'success',
        text: 'Profil sikeresen frissítve!'
      });

      // Update the session to reflect the new data
      await update({
        displayName: result.user.displayName,
        phoneNumber: result.user.phoneNumber
      });

      // Call the callback to update parent component
      onProfileUpdate?.(result.user);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ismeretlen hiba történt'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Profil szerkesztése
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Info Display */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Jelenlegi információk:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Név:</span>
                <span className="font-medium">{user.name || 'Nincs megadva'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Becenév:</span>
                <span className="font-medium">{(user as any).displayName || 'Nincs megadva'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Telefon:</span>
                <span className="font-medium">{(user as any).phoneNumber || 'Nincs megadva'}</span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Becenév / Megjelenítendő név
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="pl. János, JaniKa, stb."
                  maxLength={100}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ez a név jelenik meg ranglistákon, eseményeken és nyilvános aktivitásokban.
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Telefonszám
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+36 30 123 4567"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Opcionális. Esemény szervezők kapcsolatfelvételhez használhatják.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-pulse" />
                    Mentés...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Profil mentése
                  </>
                )}
              </Button>
            </div>

            {/* Info Notice */}
            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded border">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Adatvédelmi tudnivaló:</strong> {' '}
                  Ezek az adatok csak a jobb felhasználói élmény érdekében kerülnek tárolásra. 
                  A teleforszám opcionális és csak esemény szervezők láthatják. 
                  A becenév nyilvánosan megjelenhet ranglistákon és eseményeken.
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}