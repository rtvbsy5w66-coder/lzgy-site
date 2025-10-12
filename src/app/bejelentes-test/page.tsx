'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategorySelector } from '@/components/reports/CategorySelector';
import { UrgencySelector } from '@/components/reports/UrgencySelector';
import { 
  CategoryType, 
  UrgencyType
} from '../../../types/report.types';

export default function TestReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'public_infrastructure' as CategoryType,
    urgency: 'medium' as UrgencyType,
    addressText: 'Budapest V. kerület, Fő utca 1.',
    postalCode: '1051'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          authorEmail: 'test@example.com', // Test user
          source: 'ai-analysis-test'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Bejelentés sikeresen leadva! ID: ${result.id}`);
        router.push('/admin-test');
      } else {
        const error = await response.json();
        alert(`❌ Hiba: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Hálózati hiba: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🧪 Test Bejelentés (Login nélkül)
            </h1>
            <p className="text-gray-600">
              Fejlesztői teszt oldal - OAuth bypass teszteléshez
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cím *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Rövid címe a problémának"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leírás *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Részletes leírás a problémáról"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategória *
              </label>
              <CategorySelector
                selectedCategory={formData.category}
                onCategoryChange={(category) => setFormData({...formData, category})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sürgősség *
              </label>
              <UrgencySelector
                selectedUrgency={formData.urgency}
                onUrgencyChange={(urgency) => setFormData({...formData, urgency})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cím
              </label>
              <input
                type="text"
                value={formData.addressText}
                onChange={(e) => setFormData({...formData, addressText: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Budapest V. kerület, utca neve"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🔧 Test Mode</h3>
              <p className="text-sm text-blue-700">
                Ez egy fejlesztői teszt oldal. Bejelentések test@example.com felhasználóval kerülnek mentésre.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Mentés...' : '📝 Test Bejelentés Leadása'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin-test')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                📊 Admin Test
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}