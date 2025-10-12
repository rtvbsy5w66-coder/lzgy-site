'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ReportListResponse, 
  ReportData,
  CategoryType,
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  URGENCY_LABELS,
  URGENCY_ICONS,
  URGENCY_COLORS 
} from '../../../types/report.types';

export default function ReportsListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    urgency: 'all',
  });

  useEffect(() => {
    if (!session) return;

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...(filters.category !== 'all' && { category: filters.category }),
          ...(filters.status !== 'all' && { status: filters.status }),
          ...(filters.urgency !== 'all' && { urgency: filters.urgency }),
        });

        const response = await fetch(`/api/reports/list?${params}`);
        const data: ReportListResponse = await response.json();

        if (data.success) {
          setReports(data.data);
          setPagination(data.pagination);
        } else {
          setError('Hiba történt a bejelentések betöltése során');
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Hiba történt a bejelentések betöltése során');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [session, pagination.page, pagination.limit, filters]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bejelentéseim</h1>
            <p className="text-gray-600 mt-2">V. kerületi képviselői bejelentési rendszer</p>
          </div>
          <Link
            href="/bejelentes"
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Új bejelentés
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Szűrők</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategória</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Összes kategória</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Státusz</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Összes státusz</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sürgősség</label>
              <select
                value={filters.urgency}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Összes sürgősség</option>
                {Object.entries(URGENCY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{URGENCY_ICONS[key as keyof typeof URGENCY_ICONS]} {label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Results Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Bejelentések ({pagination.total})
              </h3>
              {pagination.totalPages > 1 && (
                <div className="text-sm text-gray-600">
                  {pagination.page}. oldal / {pagination.totalPages}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Betöltés...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-2">Hiba történt</p>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && reports.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-2">Még nincsenek bejelentések</p>
              <p className="text-gray-600 mb-4">Kezdje el az első bejelentés leadásával!</p>
              <Link
                href="/bejelentes"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Új bejelentés
              </Link>
            </div>
          )}

          {/* Reports List */}
          {!isLoading && !error && reports.length > 0 && (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/bejelentes/${report.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 mb-2 truncate">
                        {report.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                        <span>{CATEGORY_LABELS[report.category]}</span>
                        <span>•</span>
                        <span>{report.addressText}</span>
                        <span>•</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                        {STATUS_LABELS[report.status]}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${URGENCY_COLORS[report.urgency]}`}>
                        {URGENCY_ICONS[report.urgency]} {URGENCY_LABELS[report.urgency]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && !isLoading && (
            <div className="p-6 border-t border-gray-200 flex justify-center">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Előző
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-3 py-1 border rounded-lg ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Következő
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}