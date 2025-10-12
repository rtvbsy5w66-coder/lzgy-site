'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Calendar, CheckCircle, XCircle, Clock, Search, Download } from 'lucide-react';

interface Signature {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string | null;
  postalCode: string | null;
  status: string;
  isEmailVerified: boolean;
  showName: boolean;
  allowContact: boolean;
  createdAt: string;
  ipAddress: string | null;
}

interface Petition {
  id: string;
  title: string;
  targetGoal: number;
  _count: {
    signatures: number;
  };
}

export default function PetitionSignaturesPage() {
  const params = useParams();
  const router = useRouter();
  const petitionId = params.id as string;

  const [petition, setPetition] = useState<Petition | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [petitionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load petition details
      const petitionRes = await fetch(`/api/admin/petitions/${petitionId}`);
      if (petitionRes.ok) {
        const petitionData = await petitionRes.json();
        setPetition(petitionData);
      }

      // Load signatures
      const signaturesRes = await fetch(`/api/admin/petitions/${petitionId}/signatures`);
      if (signaturesRes.ok) {
        const signaturesData = await signaturesRes.json();
        setSignatures(Array.isArray(signaturesData) ? signaturesData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSignatures = signatures.filter(sig => {
    const matchesSearch =
      sig.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      sig.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Név', 'Email', 'Város', 'Irányítószám', 'Státusz', 'Email megerősítve', 'Dátum'];
    const rows = filteredSignatures.map(sig => [
      `${sig.firstName} ${sig.lastName}`,
      sig.email,
      sig.city || '',
      sig.postalCode || '',
      sig.status,
      sig.isEmailVerified ? 'Igen' : 'Nem',
      new Date(sig.createdAt).toLocaleString('hu-HU')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `petition-${petitionId}-signatures.csv`;
    link.click();
  };

  const getStatusBadge = (status: string, isEmailVerified: boolean) => {
    if (status === 'VERIFIED' || isEmailVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Megerősítve
        </span>
      );
    } else if (status === 'PENDING_VERIFICATION') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Függőben
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3" />
          {status}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/petitions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a petíciókhoz
          </button>

          {petition && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {petition.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="font-semibold text-indigo-600 text-lg">
                  {petition._count.signatures} / {petition.targetGoal} aláírás
                </span>
                <span>
                  {((petition._count.signatures / petition.targetGoal) * 100).toFixed(1)}% teljesítve
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Keresés név vagy email alapján..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Minden státusz</option>
              <option value="verified">Megerősítve</option>
              <option value="pending_verification">Függőben</option>
            </select>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportálás CSV-be
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredSignatures.length} aláírás megjelenítve
          </div>
        </div>

        {/* Signatures List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Név
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Helyszín
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Státusz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dátum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSignatures.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nincsenek aláírások
                    </td>
                  </tr>
                ) : (
                  filteredSignatures.map((signature) => (
                    <tr key={signature.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {signature.firstName} {signature.lastName}
                        </div>
                        {!signature.showName && (
                          <div className="text-xs text-gray-500">Név elrejtve</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {signature.email}
                        </div>
                        {signature.allowContact && (
                          <div className="text-xs text-green-600">Kapcsolatfelvétel engedélyezve</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {signature.city || signature.postalCode ? (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {signature.city && <span>{signature.city}</span>}
                            {signature.postalCode && (
                              <span className="text-gray-500">({signature.postalCode})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(signature.status, signature.isEmailVerified)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(signature.createdAt).toLocaleString('hu-HU')}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
