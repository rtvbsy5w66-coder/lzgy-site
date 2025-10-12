'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  createdAt: string;
}

export default function AdminTestPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Direct database query without auth
        const response = await fetch('/api/reports/list?page=1&limit=50&bypass_auth=true');
        if (response.ok) {
          const data = await response.json();
          setReports(data.reports || []);
        } else {
          console.log('Response not ok:', response.status);
          // Fallback - try to get data anyway
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Admin Test - Bejelentések
            </h1>
            <div className="flex space-x-3">
              <Link
                href="/ai-demo"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                AI Demo Teszt
              </Link>
              <Link
                href="/admin-ai"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                🤖 AI Admin
              </Link>
              <Link
                href="/bejelentes-test"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📝 Test Bejelentés
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Bejelentések betöltése...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Összes bejelentés: <strong>{reports.length}</strong>
              </p>
              
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    🚨 Nincs még bejelentés az adatbázisban
                  </p>
                  <p className="text-gray-400 mt-2">
                    Próbáld ki az AI demo-t bejelentés készítéséhez!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{report.title}</h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                          
                          <div className="flex space-x-4 mt-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {report.category}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm ${
                              report.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                              report.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                              report.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {report.urgency}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                              {report.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString('hu-HU')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}