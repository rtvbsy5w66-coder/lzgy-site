"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, User, Phone, MessageSquare, X, RefreshCw } from "lucide-react";

interface EventRegistrationCardProps {
  registration: {
    id: string;
    status: string;
    createdAt: string;
    name: string;
    phone?: string;
    message?: string;
    event: {
      id: string;
      title: string;
      description: string;
      location: string;
      startDate: string;
      endDate: string;
      status: string;
    };
  };
  detailed?: boolean;
  onStatusChange?: () => void; // Callback to refresh parent data
}

export function EventRegistrationCard({ registration, detailed = false, onStatusChange }: EventRegistrationCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(registration.status === 'CANCELLED');

  const handleCancelRegistration = async () => {
    setIsCancelling(true);
    setCancelMessage(null);

    try {
      const response = await fetch(`/api/events/${registration.event.id}/cancel-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: registration.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setCancelMessage('✅ Jelentkezés sikeresen lemondva!');
        setIsCancelled(true);
        // Notify parent component to refresh data
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        setCancelMessage(`❌ Hiba: ${result.error || 'Nem sikerült lemondani a jelentkezést'}`);
      }
    } catch (error) {
      console.error('Event cancellation error:', error);
      setCancelMessage('❌ Hálózati hiba történt. Próbálja újra később.');
    } finally {
      setIsCancelling(false);
      // Clear message after 5 seconds
      setTimeout(() => setCancelMessage(null), 5000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endFormatted = end.toLocaleDateString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'CANCELLED': return 'bg-red-500';
      case 'ATTENDED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Megerősített';
      case 'PENDING': return 'Függőben';
      case 'CANCELLED': return 'Törölve';
      case 'ATTENDED': return 'Részt vett';
      default: return status;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-500';
      case 'ONGOING': return 'bg-green-500';
      case 'COMPLETED': return 'bg-gray-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventStatusText = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'Közelgő';
      case 'ONGOING': return 'Folyamatban';
      case 'COMPLETED': return 'Befejezett';
      case 'CANCELLED': return 'Törölve';
      default: return status;
    }
  };

  const isEventPast = new Date(registration.event.endDate) < new Date();
  const isEventUpcoming = new Date(registration.event.startDate) > new Date();
  const canCancel = registration.status === 'CONFIRMED' && !isCancelled && isEventUpcoming;

  // Debug info - uncomment for debugging
  // console.log('EventRegistrationCard Debug:', {
  //   eventTitle: registration.event.title,
  //   registrationStatus: registration.status,
  //   isCancelled,
  //   isEventUpcoming,
  //   eventStartDate: registration.event.startDate,
  //   canCancel
  // });

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500 dark:border-l-indigo-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
            {registration.event.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(registration.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Jelentkezett: {registration.name}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{formatEventDate(registration.event.startDate, registration.event.endDate)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{registration.event.location}</span>
            </div>
          </div>

          {/* Registration status indicator and cancel button */}
          <div className="flex items-center gap-2 flex-wrap">
            {registration.status === 'CONFIRMED' && !isCancelled && (
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Jelentkezve
              </div>
            )}
            
            {(registration.status === 'CANCELLED' || isCancelled) && (
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full">
                <X className="h-3 w-3" />
                Lemondva
              </div>
            )}

            {registration.status === 'PENDING' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full">
                <Clock className="h-3 w-3" />
                Függőben
              </div>
            )}


            {/* Cancel button - only show for confirmed registrations of upcoming events */}
            {canCancel && (
              <button
                onClick={handleCancelRegistration}
                disabled={isCancelling}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCancelling ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                {isCancelling ? 'Lemondás...' : 'Lemondás'}
              </button>
            )}
          </div>

          {/* Cancel message */}
          {cancelMessage && (
            <div className="mt-2 text-xs font-medium">
              {cancelMessage}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Badge 
            variant="secondary" 
            className={`${getEventStatusColor(registration.event.status)} text-white border-0`}
          >
            {getEventStatusText(registration.event.status)}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(registration.status)} text-white border-0`}
          >
            {getStatusText(registration.status)}
          </Badge>
        </div>
      </div>

      {detailed && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {/* Esemény leírás */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/50">
            <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Esemény részletei
            </h4>
            <div
              className="prose prose-sm max-w-none
                prose-headings:text-indigo-900 dark:prose-headings:text-indigo-200 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2
                prose-h2:text-base prose-h3:text-sm
                prose-p:text-indigo-700 dark:prose-p:text-indigo-300 prose-p:my-2 prose-p:leading-relaxed
                prose-ul:my-2 prose-ul:text-indigo-700 dark:prose-ul:text-indigo-300
                prose-li:my-0.5 prose-li:text-sm
                prose-strong:text-indigo-800 dark:prose-strong:text-indigo-200 prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: registration.event.description }}
            />
          </div>

          {/* Jelentkezési részletek */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Jelentkezési adatok</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Név: {registration.name}</span>
              </div>
              {registration.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Telefon: {registration.phone}</span>
                </div>
              )}
              {registration.message && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Üzenet:</span>
                    <p className="mt-1">{registration.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Státusz információk */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">Jelentkezés:</span>
              <span>{formatDate(registration.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">Státusz:</span>
              <span>{getStatusText(registration.status)}</span>
            </div>
            {isEventPast && registration.status === 'CONFIRMED' && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="font-medium">🎉 Esemény befejezve!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}