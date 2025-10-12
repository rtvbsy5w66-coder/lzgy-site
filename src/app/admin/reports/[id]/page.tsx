'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  FileText,
  DollarSign,
  Building,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ReportTimeline } from '@/components/reports/ReportTimeline';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  addressText: string;
  addressId?: string;
  postalCode?: string;
  affectedArea?: string;
  urgency: string;
  estimatedCost?: string;
  department?: string;
  legalIssue: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  representativeName: string;
  districtArea?: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  internalNotes?: string;
  author: {
    name: string;
    email: string;
  };
  history?: Array<{
    id: string;
    action: string;
    createdAt: string;
    comment?: string | null;
    changedBy: string;
  }>;
}

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Függőben', color: 'bg-yellow-100 text-yellow-800' },
      IN_REVIEW: { label: 'Vizsgálat alatt', color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'Folyamatban', color: 'bg-purple-100 text-purple-800' },
      RESOLVED: { label: 'Megoldva', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Elutasítva', color: 'bg-red-100 text-red-800' },
      CLOSED: { label: 'Lezárva', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig: Record<string, { label: string; color: string }> = {
      low: { label: 'Alacsony', color: 'bg-green-100 text-green-800' },
      medium: { label: 'Közepes', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Magas', color: 'bg-orange-100 text-orange-800' },
      emergency: { label: 'Sürgős', color: 'bg-red-100 text-red-800' },
    };

    const config = urgencyConfig[urgency] || { label: urgency, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <AlertCircle className="w-4 h-4 inline mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Hiba történt</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'A bejelentés nem található'}</p>
          <button
            onClick={() => router.push('/admin/reports')}
            className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Vissza a bejelentésekhez
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/reports')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Vissza a bejelentésekhez
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{report.title}</h1>
            <div className="flex items-center gap-3">
              {getStatusBadge(report.status)}
              {getUrgencyBadge(report.urgency)}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(report.createdAt).toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {report.author.name} ({report.author.email})
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <ReportTimeline
            currentStatus={report.status}
            history={report.history?.map(h => ({
              id: h.id,
              status: h.action,
              timestamp: new Date(h.createdAt),
              comment: h.comment,
              changedByName: h.changedBy
            })) || []}
            createdAt={new Date(report.createdAt)}
          />
        </div>

        {/* Single Column Layout */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Leírás</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Helyszín
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">{report.addressText}</p>
              {report.postalCode && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Irányítószám: {report.postalCode}</p>
              )}
              {report.affectedArea && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Érintett terület: {report.affectedArea}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Részletek</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Azonosító</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono mt-1 tracking-wide">{report.id.slice(0, 12).toUpperCase()}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategória</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">{report.category}</dd>
                  {report.subcategory && (
                    <dd className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.subcategory}</dd>
                  )}
                </div>

                {report.department && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      Felelős osztály
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">{report.department}</dd>
                  </div>
                )}

                {report.assignedTo && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Hozzárendelve</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">{report.assignedTo}</dd>
                  </div>
                )}

                {report.estimatedCost && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Becsült költség
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">{report.estimatedCost}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Jogi kérdés</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {report.legalIssue ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">Igen</span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">Nem</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Utolsó frissítés
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {new Date(report.updatedAt).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Resolution Note */}
            {report.resolutionNote && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Megoldás
                </h2>
                <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">{report.resolutionNote}</p>
                {report.resolvedAt && (
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Megoldva: {new Date(report.resolvedAt).toLocaleDateString('hu-HU')}
                  </p>
                )}
              </div>
            )}

            {/* Internal Notes */}
            {report.internalNotes && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Belső megjegyzések
                </h2>
                <p className="text-yellow-800 dark:text-yellow-200 whitespace-pre-wrap">{report.internalNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Műveletek</h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/admin/reports/${report.id}/edit`)}
                  className="w-full bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Szerkesztés
                </button>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Státusz módosítása
                </button>
                <button
                  onClick={() => setShowDepartmentModal(true)}
                  className="w-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  Osztály hozzárendelése
                </button>
              </div>
            </div>
          </div>

        {/* Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowStatusModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Státusz módosítása</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Használja a Szerkesztés gombot a teljes státusz módosításhoz.</p>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  router.push(`/admin/reports/${report.id}/edit`);
                }}
                className="w-full bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Szerkesztés megnyitása
              </button>
            </div>
          </div>
        )}

        {/* Department Modal */}
        {showDepartmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowDepartmentModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Osztály hozzárendelése</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Használja a Szerkesztés gombot az osztály hozzárendeléséhez.</p>
              <button
                onClick={() => {
                  setShowDepartmentModal(false);
                  router.push(`/admin/reports/${report.id}/edit`);
                }}
                className="w-full bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Szerkesztés megnyitása
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
