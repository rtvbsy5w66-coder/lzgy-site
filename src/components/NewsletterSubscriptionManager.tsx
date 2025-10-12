"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X, Settings, AlertTriangle } from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import { 
  NewsletterCategory, 
  NewsletterSource,
  NEWSLETTER_CATEGORIES, 
  NewsletterPreferences,
  NewsletterSubscriptionRequest 
} from "@/types/newsletter";

interface NewsletterSubscriptionManagerProps {
  userEmail?: string;
  userName?: string;
  currentSubscriptions?: NewsletterCategory[];
  onSubscriptionChange?: () => void;
  showHeader?: boolean;
}

export function NewsletterSubscriptionManager({
  userEmail,
  userName,
  currentSubscriptions = [],
  onSubscriptionChange,
  showHeader = true
}: NewsletterSubscriptionManagerProps) {
  const colors = useThemeColors();
  const [preferences, setPreferences] = useState<NewsletterPreferences>({
    [NewsletterCategory.SZAKPOLITIKA]: false,
    [NewsletterCategory.V_KERULET]: false,
    [NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO]: false,
    [NewsletterCategory.EU]: false,
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize preferences from current subscriptions
  useEffect(() => {
    const initialPreferences: NewsletterPreferences = {
      [NewsletterCategory.SZAKPOLITIKA]: currentSubscriptions.includes(NewsletterCategory.SZAKPOLITIKA),
      [NewsletterCategory.V_KERULET]: currentSubscriptions.includes(NewsletterCategory.V_KERULET),
      [NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO]: currentSubscriptions.includes(NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO),
      [NewsletterCategory.EU]: currentSubscriptions.includes(NewsletterCategory.EU),
    };
    setPreferences(initialPreferences);
  }, [currentSubscriptions]);

  // Check if there are unsaved changes
  useEffect(() => {
    const hasAnyChanges = Object.entries(preferences).some(([category, isChecked]) => {
      const categoryEnum = category as NewsletterCategory;
      const wasSubscribed = currentSubscriptions.includes(categoryEnum);
      return isChecked !== wasSubscribed;
    });
    setHasChanges(hasAnyChanges);
  }, [preferences, currentSubscriptions]);

  const handleCategoryToggle = (category: NewsletterCategory) => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSavePreferences = async () => {
    if (!userEmail || !userName) {
      alert("Felhasználói adatok hiányoznak. Kérjük, jelentkezzen be újra.");
      return;
    }

    try {
      setLoading(true);

      // Get selected categories
      const selectedCategories = Object.entries(preferences)
        .filter(([_, isSelected]) => isSelected)
        .map(([category, _]) => category as NewsletterCategory);

      // If no categories selected, unsubscribe from all
      if (selectedCategories.length === 0) {
        const response = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            unsubscribeAll: true
          }),
        });

        if (!response.ok) {
          throw new Error('Leiratkozás sikertelen');
        }
      } else {
        // Subscribe to selected categories
        const subscriptionRequest: NewsletterSubscriptionRequest = {
          name: userName,
          email: userEmail,
          categories: selectedCategories,
          source: NewsletterSource.PROFILE
        };

        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionRequest),
        });

        if (!response.ok) {
          throw new Error('Feliratkozás sikertelen');
        }
      }

      // Notify parent component
      onSubscriptionChange?.();
      
      setHasChanges(false);
      alert('Hírlevél beállítások sikeresen frissítve!');

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('Hiba történt a beállítások mentése során. Kérjük, próbálja újra.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!userEmail) {
      alert("Email cím hiányzik");
      return;
    }

    if (!confirm("Biztosan le szeretne iratkozni minden hírlevélről? Ez a művelet visszavonhatatlan.")) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          unsubscribeAll: true
        }),
      });

      if (!response.ok) {
        throw new Error('Leiratkozás sikertelen');
      }

      // Reset all preferences
      setPreferences({
        [NewsletterCategory.SZAKPOLITIKA]: false,
        [NewsletterCategory.V_KERULET]: false,
        [NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO]: false,
        [NewsletterCategory.EU]: false,
      });

      onSubscriptionChange?.();
      setHasChanges(false);
      alert('Sikeresen leiratkozott minden hírlevélről');

    } catch (error) {
      console.error('Unsubscribe all error:', error);
      alert('Hiba történt a leiratkozás során. Kérjük, próbálja újra.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(preferences).filter(Boolean).length;
  };

  return (
    <div>
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: colors.text }}>
            <Mail className="h-6 w-6" />
            Hírlevél beállítások
          </h2>
          <p className="text-sm mb-4" style={{ color: colors.text, opacity: 0.7 }}>
            Válassza ki, hogy mely területekről szeretne értesítést kapni
          </p>
          
          {/* Current Subscription Status Summary */}
          <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, border: '1px solid' }}>
            <h4 className="font-medium mb-2" style={{ color: colors.text }}>
              Jelenlegi feliratkozások ({currentSubscriptions.length}/4)
            </h4>
            {currentSubscriptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentSubscriptions.map(categoryId => {
                  const category = NEWSLETTER_CATEGORIES[categoryId as NewsletterCategory];
                  return (
                    <span
                      key={categoryId}
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: '#d1fae5',
                        color: '#10b981',
                        border: '1px solid #10b981'
                      }}
                    >
                      {category.emoji} {category.name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: colors.text, opacity: 0.6 }}>
                Még nem iratkozott fel egyetlen hírlevélre sem
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.values(NEWSLETTER_CATEGORIES).map((category) => (
          <Card 
            key={category.id} 
            className="p-4 transition-all duration-200 hover:shadow-md cursor-pointer"
            style={{ 
              backgroundColor: colors.cardBg, 
              borderColor: preferences[category.id] ? colors.gradientFrom : colors.border,
              borderWidth: preferences[category.id] ? '2px' : '1px'
            }}
            onClick={() => handleCategoryToggle(category.id)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    preferences[category.id] ? 'border-transparent' : ''
                  }`}
                  style={{
                    backgroundColor: preferences[category.id] ? colors.gradientFrom : 'transparent',
                    borderColor: preferences[category.id] ? colors.gradientFrom : colors.border
                  }}
                >
                  {preferences[category.id] && (
                    <Check className="h-4 w-4" style={{ color: colors.accent }} />
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{category.emoji}</span>
                  <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                    {category.name}
                  </h3>
                  {currentSubscriptions.includes(category.id) && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: '#10b981', 
                        color: '#10b981',
                        backgroundColor: '#d1fae5'
                      }}
                    >
                      ✓ Feliratkozva
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: colors.border, 
                      color: colors.text,
                      opacity: 0.7
                    }}
                  >
                    {category.frequency}
                  </Badge>
                </div>
                
                <p className="text-sm mb-3" style={{ color: colors.text, opacity: 0.8 }}>
                  {category.description}
                </p>
                
                <div className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                  <strong>Példa témák:</strong> {category.exampleTopics.join(', ')}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSavePreferences}
            disabled={loading || !hasChanges}
            className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: hasChanges ? colors.gradient : colors.border,
              color: hasChanges ? colors.accent : colors.text,
              opacity: hasChanges ? 1 : 0.5
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: colors.accent }}></div>
                Mentés...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                Beállítások mentése ({getSelectedCount()} kategória)
              </span>
            )}
          </button>
          
          <button
            onClick={handleUnsubscribeAll}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-medium transition-colors border disabled:opacity-50"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#ef4444',
              color: '#ef4444'
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <X className="h-4 w-4" />
              Minden leiratkozás
            </span>
          </button>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="flex-1">
              <span className="text-sm text-yellow-800 block mb-1">
                Nem mentett változások vannak. Kattintson a &quot;Beállítások mentése&quot; gombra a módosítások alkalmazásához.
              </span>
              <div className="flex gap-2 text-xs">
                {Object.entries(preferences).map(([categoryId, isSelected]) => {
                  const wasSubscribed = currentSubscriptions.includes(categoryId as NewsletterCategory);
                  if (isSelected !== wasSubscribed) {
                    const category = NEWSLETTER_CATEGORIES[categoryId as NewsletterCategory];
                    return (
                      <span
                        key={categoryId}
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: isSelected ? '#bfdbfe' : '#fecaca',
                          color: isSelected ? '#1d4ed8' : '#dc2626'
                        }}
                      >
                        {isSelected ? '+ ' : '- '}{category.name}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GDPR Info */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, border: '1px solid' }}>
        <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: colors.text }}>
          🔒 Adatvédelem
        </h4>
        <div className="text-sm space-y-2" style={{ color: colors.text, opacity: 0.8 }}>
          <p>• Email címét kizárólag a kiválasztott hírlevél kategóriák küldésére használjuk</p>
          <p>• Adatait nem adjuk át harmadik félnek</p>
          <p>• Bármikor módosíthatja vagy visszavonhatja a feliratkozását</p>
          <p>• GDPR megfelelően kezeljük személyes adatait</p>
        </div>
      </div>
    </div>
  );
}