"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useThemeColors } from "@/context/ThemeContext";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const colors = useThemeColors();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading');
  const [message, setMessage] = useState('');

  const unsubscribeEmail = useCallback(async () => {
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Sikeresen leiratkozott a hírlevélről.');
      } else if (response.status === 404) {
        setStatus('not-found');
        setMessage('Ez az email cím nem található a hírlevél listában.');
      } else {
        setStatus('error');
        setMessage(result.error || 'Hiba történt a leiratkozás során.');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      setMessage('Hiba történt a leiratkozás során.');
    }
  }, [email]);

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('Érvénytelen leiratkozási link.');
      return;
    }

    unsubscribeEmail();
  }, [email, unsubscribeEmail]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Vissza a főoldalra
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border" style={{ borderColor: colors.border }}>
            {status === 'loading' && (
              <>
                <Mail className="h-16 w-16 mx-auto mb-6" style={{ color: colors.gradientFrom }} />
                <h1 className="text-2xl font-bold mb-4">Leiratkozás folyamatban...</h1>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: colors.gradientFrom }}></div>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-500" />
                <h1 className="text-2xl font-bold mb-4 text-green-700">Leiratkozás sikeres!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-gray-600">
                  Email cím: <strong>{email}</strong>
                </p>
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✅ Többé nem fog emaileket kapni tőlünk<br/>
                    ✅ Az email címe eltávolítva a listáról<br/>
                    ✅ A változás azonnal érvénybe lépett
                  </p>
                </div>
              </>
            )}

            {status === 'not-found' && (
              <>
                <Mail className="h-16 w-16 mx-auto mb-6 text-orange-500" />
                <h1 className="text-2xl font-bold mb-4 text-orange-700">Email cím nem található</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-gray-600">
                  Email cím: <strong>{email}</strong>
                </p>
                <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    Ez az email cím nem szerepel a hírlevél listánkban, vagy már korábban leiratkozott.
                  </p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <Mail className="h-16 w-16 mx-auto mb-6 text-red-500" />
                <h1 className="text-2xl font-bold mb-4 text-red-700">Hiba történt</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                  onClick={unsubscribeEmail}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Újrapróbálás
                </button>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-3">Visszajelzés</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ha kérdése van, vagy visszajelzést szeretne adni, kérjük írjon nekünk:
              </p>
              <Link 
                href="/kapcsolat"
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                style={{ background: colors.gradient }}
              >
                <Mail className="h-4 w-4" />
                Kapcsolatfelvétel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}