'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useThemeColors } from '@/context/ThemeContext';
import { Issue, IssueStatus, IssueStatusLabels, IssueStatusColors, IssuePriorityLabels, IssuePriorityColors } from '@/types/issues';

interface TrackingResult {
  found: boolean;
  canView: boolean;
  issue?: Issue;
  message?: string;
}

export default function TrackingPage() {
  const { data: session, status } = useSession();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const themeColors = useThemeColors();

  // Loading állapot
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.gradientFrom }}></div>
      </div>
    );
  }

  // Ha nincs bejelentkezve
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen -mx-4 -mt-24 md:-mt-28">
        {/* Hero Section */}
        <div 
          className="relative pt-24 md:pt-28 transition-colors duration-300"
          style={{
            background: themeColors.gradient
          }}
        >
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center relative z-10">
              <h1 
                className="text-4xl md:text-6xl font-bold mb-4 transition-colors duration-300"
                style={{ color: themeColors.accent }}
              >
                Bejelentkezés szükséges
              </h1>
              <p 
                className="text-xl max-w-2xl mx-auto transition-colors duration-300"
                style={{ color: `${themeColors.accent}dd` }}
              >
                A bejelentések nyomon követéséhez be kell jelentkeznie.
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-900 py-16">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${themeColors.gradientFrom}20` }}
              >
                <i className="fas fa-user-lock text-3xl" style={{ color: themeColors.gradientFrom }}></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Jelentkezzen be
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                A nyomonkövetési funkció csak regisztrált felhasználók számára érhető el.
              </p>
              <a
                href="/login"
                className="w-full inline-block px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: themeColors.gradientFrom,
                  boxShadow: `0 4px 16px ${themeColors.gradientFrom}30`
                }}
              >
                Bejelentkezés
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Kérjük, adja meg a tracking számot.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/issues/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim().toUpperCase(),
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Hiba történt a keresés során.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Hálózati hiba történt. Kérjük, próbálja újra később.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: IssueStatus) => {
    const icons = {
      [IssueStatus.SUBMITTED]: 'fas fa-clock',
      [IssueStatus.REVIEWED]: 'fas fa-eye',
      [IssueStatus.IN_PROGRESS]: 'fas fa-cog fa-spin',
      [IssueStatus.RESOLVED]: 'fas fa-check-circle',
      [IssueStatus.CLOSED]: 'fas fa-archive',
      [IssueStatus.REJECTED]: 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-question-circle';
  };

  return (
    <div className="min-h-screen -mx-4 -mt-24 md:-mt-28">
      {/* Hero Section */}
      <div 
        className="relative pt-24 md:pt-28 transition-colors duration-300"
        style={{
          background: themeColors.gradient
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center relative z-10">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-4 transition-colors duration-300"
              style={{ color: themeColors.accent }}
            >
              Bejelentés nyomonkövetése
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto transition-colors duration-300"
              style={{ color: `${themeColors.accent}dd` }}
            >
              Adja meg a bejelentéskor kapott tracking számot a státusz megtekintéséhez.
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tracking szám *
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="pl. V5K-2024-123456"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                  style={{ 
                    '--tw-ring-color': themeColors.gradientFrom 
                  } as React.CSSProperties}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email cím (opcionális)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Az azonosításhoz, ha a bejelentés nem nyilvános"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                  style={{ 
                    '--tw-ring-color': themeColors.gradientFrom 
                  } as React.CSSProperties}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    <span className="text-red-700 dark:text-red-300">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor: themeColors.gradientFrom,
                  boxShadow: `0 4px 16px ${themeColors.gradientFrom}30`
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Keresés...
                  </span>
                ) : (
                  'Bejelentés keresése'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="max-w-4xl mx-auto px-4">
            {result.found && result.canView && result.issue ? (
              // Issue found and accessible
              <div className="space-y-8">
                {/* Issue Header */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {result.issue.title}
                      </h2>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-mono font-semibold" style={{ color: themeColors.gradientFrom }}>
                          {result.issue.trackingNumber}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatDate(result.issue.submittedAt.toString())}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div 
                        className="inline-flex items-center px-4 py-2 rounded-full text-white font-semibold"
                        style={{ backgroundColor: IssueStatusColors[result.issue.status] }}
                      >
                        <i className={`${getStatusIcon(result.issue.status)} mr-2`}></i>
                        {IssueStatusLabels[result.issue.status]}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Kategória</h3>
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm"
                          style={{ backgroundColor: result.issue.category?.color }}
                        >
                          <i className={result.issue.category?.icon}></i>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {result.issue.category?.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sürgősség</h3>
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: IssuePriorityColors[result.issue.urgency] }}
                      >
                        {IssuePriorityLabels[result.issue.urgency]}
                      </span>
                    </div>

                    {result.issue.location && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Helyszín</h3>
                        <p className="text-gray-700 dark:text-gray-300">{result.issue.location}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bejelentő</h3>
                      <p className="text-gray-700 dark:text-gray-300">{result.issue.reporterName}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Leírás</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {result.issue.description}
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Státusz előzmények
                  </h3>
                  
                  <div className="space-y-4">
                    {result.issue.statusUpdates?.map((update, index) => (
                      <div key={update.id} className="flex items-start space-x-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: IssueStatusColors[update.newStatus] }}
                        >
                          <i className={getStatusIcon(update.newStatus)}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {IssueStatusLabels[update.newStatus]}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(update.createdAt.toString())}
                            </span>
                          </div>
                          {update.comment && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {update.comment}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Frissítette: {update.updatedBy}
                            {update.updatedByRole && ` (${update.updatedByRole})`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : result.found && !result.canView ? (
              // Issue found but not accessible
              <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-600 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-2xl text-orange-500"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Hozzáférés megtagadva
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {result.message}
                </p>
              </div>
            ) : (
              // Issue not found
              <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-600 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-2xl text-red-500"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Bejelentés nem található
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  A megadott tracking számmal nem található bejelentés. Kérjük, ellenőrizze a számot.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Gyakori kérdések
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Hol találom a tracking számot?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                A tracking számot a bejelentés leadása után azonnal megkapja, valamint email értesítésben is elküldjük.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Mikor kapok értesítést?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Email értesítést kap minden státusz változáskor, ha ezt a bejelentésnél kérte.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Mit jelent az email cím mezõ?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Ha a bejelentés nem nyilvános, az email címmel tudjuk azonosítani, hogy Ön a bejelentő.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Mennyi idő alatt intézkednek?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                A válaszidő a probléma típusától és sürgősségétől függ. Sürgős esetekben 24 órán belül reagálunk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}