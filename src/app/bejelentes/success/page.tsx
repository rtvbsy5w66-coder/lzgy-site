'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ReportSuccessPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setReportId(id);
    } else {
      // Redirect to home if no report ID
      router.push('/');
    }
  }, [searchParams, router]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bejelentkezés szükséges
          </h2>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Bejelentkezés
          </Link>
        </div>
      </div>
    );
  }

  if (!reportId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bejelentés sikeresen elküldve!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Köszönjük a bejelentését! A rendszerben rögzítettük az alábbi azonosítóval:
          </p>

          {/* Report ID */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Bejelentés azonosító:</p>
            <p className="text-lg font-mono font-semibold text-gray-900 tracking-wide">
              {reportId?.slice(0, 12).toUpperCase()}
            </p>
          </div>

          {/* What happens next */}
          <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Mi történik ezután?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• A bejelentést továbbítjuk a megfelelő hivatali osztályhoz</li>
              <li>• E-mailben értesítést kap a státusz változásokról</li>
              <li>• A bejelentés állapotát bármikor ellenőrizheti</li>
              <li>• Válaszidő: általában 5-15 munkanap</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/bejelentes/${reportId}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bejelentés megtekintése
            </Link>
            
            <Link
              href="/bejelentesek"
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Összes bejelentésem
            </Link>
            
            <Link
              href="/bejelentes"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Új bejelentés
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Kérdés esetén vegye fel a kapcsolatot a képviselői irodával.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}