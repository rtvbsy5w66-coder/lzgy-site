'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  addressText: string;
  postalCode?: string;
  affectedArea?: string;
  urgency: string;
  estimatedCost?: string;
  department?: string;
  legalIssue: boolean;
  status: string;
  assignedTo?: string;
  resolutionNote?: string;
  internalNotes?: string;
}

export default function AdminReportEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusComment, setStatusComment] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/admin/reports/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Nem sikerült betölteni a bejelentést');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReport();
    }
  }, [params.id, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...report,
          statusComment: statusComment || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      router.push(`/admin/reports/${params.id}`);
    } catch (err) {
      console.error('Error updating report:', err);
      setError('Nem sikerült menteni a változtatásokat');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Report, value: any) => {
    if (!report) return;
    setReport({ ...report, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hiba történt</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/reports')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Vissza a bejelentésekhez
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/reports/${params.id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Vissza a bejelentéshez
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Bejelentés szerkesztése</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alapadatok</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cím *
                </label>
                <input
                  type="text"
                  value={report.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leírás *
                </label>
                <textarea
                  value={report.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Státusz *
                  </label>
                  <select
                    value={report.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="PENDING">Függőben</option>
                    <option value="IN_REVIEW">Vizsgálat alatt</option>
                    <option value="IN_PROGRESS">Folyamatban</option>
                    <option value="RESOLVED">Megoldva</option>
                    <option value="REJECTED">Elutasítva</option>
                    <option value="CLOSED">Lezárva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés a státusz változáshoz
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={3}
                  placeholder="Opcionális megjegyzés arról, hogy miért változott a státusz, vagy mi a következő lépés..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ez a megjegyzés megjelenik a bejelentő számára az email értesítésben és a timeline-on.
                </p>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Státusz változás értesítés
            </h3>
            <p className="text-blue-800 text-sm">
              Ha módosítod a státuszt, a bejelentő automatikusan email értesítést kap a változásról.
              {statusComment && ' A megjegyzésed is el lesz küldve neki.'}
            </p>
          </div>

          {/* Continue with other fields */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">További részletek</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sürgősség *
                  </label>
                  <select
                    value={report.urgency}
                    onChange={(e) => handleChange('urgency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="low">Alacsony</option>
                    <option value="medium">Közepes</option>
                    <option value="high">Magas</option>
                    <option value="emergency">Sürgős</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Administrative Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adminisztratív adatok</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Felelős osztály
                </label>
                <input
                  type="text"
                  value={report.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="pl. Közterület Felügyelet"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hozzárendelve
                </label>
                <input
                  type="text"
                  value={report.assignedTo || ''}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  placeholder="Felelős személy neve"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Becsült költség
                </label>
                <select
                  value={report.estimatedCost || ''}
                  onChange={(e) => handleChange('estimatedCost', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Nincs megadva</option>
                  <option value="under_100k">100.000 Ft alatt</option>
                  <option value="100k_500k">100.000 - 500.000 Ft</option>
                  <option value="500k_1m">500.000 Ft - 1M Ft</option>
                  <option value="1m_5m">1M - 5M Ft</option>
                  <option value="over_5m">5M Ft felett</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resolution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Megoldás és megjegyzések</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megoldás leírása
                </label>
                <textarea
                  value={report.resolutionNote || ''}
                  onChange={(e) => handleChange('resolutionNote', e.target.value)}
                  rows={4}
                  placeholder="Hogyan lett megoldva a bejelentés..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Belső megjegyzések
                </label>
                <textarea
                  value={report.internalNotes || ''}
                  onChange={(e) => handleChange('internalNotes', e.target.value)}
                  rows={4}
                  placeholder="Belső megjegyzések (nem látható a bejelentőnek)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/reports/${params.id}`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Mentés...' : 'Mentés'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
