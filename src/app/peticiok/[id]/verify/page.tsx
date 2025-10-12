'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface VerificationResult {
  success: boolean;
  message: string;
  redirectTo?: string;
}

export default function PetitionVerifyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const petitionId = params.id;
  const token = searchParams.get('token');

  useEffect(() => {
    const verifySignature = async () => {
      if (!token) {
        setVerificationResult({
          success: false,
          message: 'Hiányzó vagy érvénytelen megerősítési token.'
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/petitions/${petitionId}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          setVerificationResult({
            success: true,
            message: 'Aláírása sikeresen megerősítve! Köszönjük a részvételt.',
            redirectTo: `/peticiok/${petitionId}`
          });

          // Redirect after 3 seconds
          setTimeout(() => {
            router.push(`/peticiok/${petitionId}`);
          }, 3000);
        } else {
          setVerificationResult({
            success: false,
            message: result.error || 'Hiba történt az aláírás megerősítése során.'
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationResult({
          success: false,
          message: 'Hálózati hiba történt. Kérjük, próbálja újra később.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifySignature();
  }, [petitionId, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aláírás megerősítése...
          </h2>
          <p className="text-gray-600">
            Kérjük, várjon amíg feldolgozzuk a megerősítését.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {verificationResult?.success ? (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sikeres megerősítés!
              </h2>
              <p className="text-gray-600 mb-6">
                {verificationResult.message}
              </p>
              <p className="text-sm text-gray-500">
                Automatikusan átirányítjuk a petíció oldalára...
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Megerősítési hiba
              </h2>
              <p className="text-gray-600 mb-6">
                {verificationResult?.message}
              </p>
              <button
                onClick={() => router.push('/peticiok')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Vissza a petíciókhoz
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}