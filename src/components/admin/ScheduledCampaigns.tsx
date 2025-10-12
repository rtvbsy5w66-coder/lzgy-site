"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Users, Send, Play, Pause, CheckCircle, AlertCircle } from "lucide-react";

interface ScheduledCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  scheduledAt: string;
  sentAt?: string;
  recipientType: string;
  sentCount?: number;
  isRecurring: boolean;
  recurringType?: string;
  nextSendDate?: string;
}

export default function ScheduledCampaigns() {
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduledCampaigns();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchScheduledCampaigns, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchScheduledCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setCampaigns(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Hiba történt a kampányok betöltésekor');
    } finally {
      setIsLoading(false);
    }
  };

  const runScheduler = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorization: process.env.NEXT_PUBLIC_SCHEDULER_KEY || 'newsletter-scheduler-secret-key-2024' })
      });
      
      if (!response.ok) throw new Error('Scheduler failed');
      const result = await response.json();
      
      alert(`Scheduler futtatva: ${result.processedCampaigns} kampány feldolgozva, ${result.totalSent} email elküldve`);
      fetchScheduledCampaigns();
    } catch (err) {
      console.error('Scheduler error:', err);
      alert('Hiba történt a scheduler futtatásakor');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'SENDING': return <Send className="w-4 h-4 text-yellow-500" />;
      case 'SENT': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Ütemezve';
      case 'SENDING': return 'Küldés alatt';
      case 'SENT': return 'Elküldve';
      case 'FAILED': return 'Sikertelen';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff <= 0) return 'Lejárt';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}n ${hours}ó`;
    if (hours > 0) return `${hours}ó ${minutes}p`;
    return `${minutes}p`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Ütemezett Kampányok
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Aktív és tervezett hírlevél kampányok
          </p>
        </div>
        <button
          onClick={runScheduler}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Play className="w-4 h-4 mr-2" />
          Scheduler Futtatása
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nincs ütemezett kampány</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(campaign.status)}
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {getStatusText(campaign.status)}
                    </span>
                    {campaign.isRecurring && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                        🔄 {campaign.recurringType}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(campaign.scheduledAt)}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {campaign.recipientType}
                    </span>
                    {campaign.sentCount !== undefined && (
                      <span className="flex items-center">
                        <Send className="w-3 h-3 mr-1" />
                        {campaign.sentCount} elküldve
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {campaign.status === 'SCHEDULED' && (
                    <div className="text-right">
                      <div className="text-lg font-mono font-semibold text-blue-600">
                        {getTimeRemaining(campaign.scheduledAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        hátra
                      </div>
                    </div>
                  )}
                  
                  {campaign.status === 'SENT' && campaign.sentAt && (
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">
                        ✅ Kész
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(campaign.sentAt)}
                      </div>
                    </div>
                  )}
                  
                  {campaign.status === 'FAILED' && (
                    <div className="text-right">
                      <div className="text-sm text-red-600 font-medium">
                        ❌ Hiba
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {campaign.isRecurring && campaign.nextSendDate && campaign.status === 'SENT' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    Következő küldés: {formatDate(campaign.nextSendDate)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500 text-center">
        Automatikus frissítés 30 másodpercenként
      </div>
    </div>
  );
}