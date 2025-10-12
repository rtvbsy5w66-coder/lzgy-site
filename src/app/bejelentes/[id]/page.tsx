'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ReportTimeline } from '@/components/reports/ReportTimeline';
import {
  ReportData,
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  URGENCY_LABELS,
  URGENCY_ICONS,
  URGENCY_COLORS,
  DEPARTMENT_LABELS,
  COST_ESTIMATE_LABELS,
  HISTORY_ACTION_LABELS
} from '../../../../types/report.types';

export default function ReportDetailsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportId = params.id as string;

  // Validate that ID looks like a valid report ID (should be a cuid)
  const isValidReportId = reportId && /^[a-z0-9]{25}$/i.test(reportId);

  useEffect(() => {
    if (!session || !reportId || !isValidReportId) {
      if (!isValidReportId && reportId) {
        setError('Érvénytelen bejelentés azonosító');
        setIsLoading(false);
      }
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        const data = await response.json();

        if (data.success) {
          setReport(data.data);
        } else {
          setError(data.error || 'Bejelentés nem található');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Hiba történt a bejelentés betöltése során');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [session, reportId, isValidReportId]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Bejelentkezés szükséges
          </h2>
          <Link
            href="/login"
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Bejelentkezés
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {error || 'Bejelentés nem található'}
            </h1>
            <Link
              href="/bejelentesek"
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Vissza a bejelentésekhez
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">Főoldal</Link></li>
            <li>/</li>
            <li><Link href="/bejelentesek" className="hover:text-gray-700 dark:hover:text-gray-300">Bejelentések</Link></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-gray-100">{report.title}</li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {report.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-mono tracking-wide">ID: {report.id.slice(0, 12).toUpperCase()}</span>
                  <span>•</span>
                  <span>{formatDate(report.createdAt)}</span>
                  <span>•</span>
                  <span>{report.representativeName}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4 sm:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                  {STATUS_LABELS[report.status]}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${URGENCY_COLORS[report.urgency]}`}>
                  {URGENCY_ICONS[report.urgency]} {URGENCY_LABELS[report.urgency]}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Timeline */}
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

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Alapadatok</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategória</label>
                  <p className="text-gray-900 dark:text-gray-100">{CATEGORY_LABELS[report.category]}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alkategória</label>
                  <p className="text-gray-900 dark:text-gray-100">{report.subcategory}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Helyszín</label>
                  <p className="text-gray-900 dark:text-gray-100">{report.addressText}</p>
                  {report.postalCode && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.postalCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Érintett terület</label>
                  <p className="text-gray-900 dark:text-gray-100">{report.affectedArea || 'Nincs megadva'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Leírás</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{report.description}</p>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">További részletek</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Felelős osztály</label>
                    <p className="text-gray-900 dark:text-gray-100">{DEPARTMENT_LABELS[report.department]}</p>
                  </div>
                )}
                {report.estimatedCost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Becsült költség</label>
                    <p className="text-gray-900 dark:text-gray-100">{COST_ESTIMATE_LABELS[report.estimatedCost]}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jogi kérdés</label>
                  <p className="text-gray-900 dark:text-gray-100">{report.legalIssue ? 'Igen' : 'Nem'}</p>
                </div>
              </div>
            </div>

            {/* Resolution */}
            {(report.status === 'resolved' || report.resolutionNote) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Megoldás</h3>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  {report.resolvedAt && (
                    <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                      Megoldva: {formatDate(report.resolvedAt)}
                    </p>
                  )}
                  {report.resolutionNote && (
                    <p className="text-green-800 dark:text-green-300">{report.resolutionNote}</p>
                  )}
                </div>
              </div>
            )}

            {/* History */}
            {report.history && report.history.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Előzmények</h3>
                <div className="space-y-3">
                  {report.history.map((entry: any) => {
                    // Status label mapping
                    const statusLabelMap: Record<string, string> = {
                      'PENDING': 'Függőben',
                      'IN_REVIEW': 'Vizsgálat alatt',
                      'IN_PROGRESS': 'Folyamatban',
                      'RESOLVED': 'Megoldva',
                      'REJECTED': 'Elutasítva',
                      'CLOSED': 'Lezárva',
                    };

                    // Determine if this is a status change
                    const isStatusChange = ['PENDING', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].includes(entry.action);

                    // Get the display title
                    let displayTitle = '';
                    if (isStatusChange) {
                      displayTitle = `Státusz módosítva: ${statusLabelMap[entry.action] || entry.action}`;
                    } else {
                      displayTitle = HISTORY_ACTION_LABELS[entry.action as keyof typeof HISTORY_ACTION_LABELS] || entry.action;
                    }

                    // Clean up the comment - remove old format duplicates
                    let displayComment = entry.comment || '';
                    if (displayComment.startsWith('Státusz módosítva:')) {
                      // Extract only the part after the status change text
                      const parts = displayComment.split('\n');
                      displayComment = parts.slice(1).join('\n').trim();
                      // If nothing left, show nothing
                      if (!displayComment) {
                        displayComment = '';
                      }
                    }

                    return (
                      <div key={entry.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {displayTitle}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        {displayComment && (
                          <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-400 dark:border-amber-600 rounded px-3 py-2">
                            <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">💬 Megjegyzés:</p>
                            <p className="text-xs text-amber-800 dark:text-amber-200">{displayComment}</p>
                          </div>
                        )}
                        {entry.changedBy && !entry.changedBy.match(/^[a-z0-9]{25}$/i) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            👤 {entry.changedBy}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Link
              href="/bejelentesek"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ← Vissza a listához
            </Link>

            {(report.status as string) === 'REJECTED' && (
              <button
                onClick={() => {
                  const subject = `Felülvizsgálat kérése - ${report.id.slice(0, 12).toUpperCase()}`;
                  const body = `Tisztelt Admin!\n\nKérem vizsgálják felül az alábbi elutasított bejelentésemet:\n\nAzonosító: ${report.id.slice(0, 12).toUpperCase()}\nCím: ${report.title}\n\nIndoklás:\n[Kérem írja ide, hogy miért kéri a felülvizsgálatot]\n\nÜdvözlettel,\n${session?.user?.name || 'Bejelentő'}`;
                  window.location.href = `mailto:lovas.zoltan1986@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
                className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Felülvizsgálat kérése
              </button>
            )}

            {(report.status as string) === 'RESOLVED' && (
              <div className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bejelentés megoldva
              </div>
            )}

            {(report.status as string) === 'CLOSED' && (
              <div className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Bejelentés lezárva
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}