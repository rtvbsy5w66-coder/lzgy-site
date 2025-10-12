'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TimelineEvent {
  id: string;
  status: string;
  timestamp: Date;
  comment?: string | null;
  changedByName?: string;
}

interface ReportTimelineProps {
  currentStatus: string;
  history: TimelineEvent[];
  createdAt: Date;
}

const STATUS_FLOW = [
  { key: 'PENDING', label: 'Beküldve', icon: Circle, color: 'text-gray-400' },
  { key: 'IN_REVIEW', label: 'Vizsgálat alatt', icon: Clock, color: 'text-blue-500' },
  { key: 'IN_PROGRESS', label: 'Folyamatban', icon: AlertCircle, color: 'text-yellow-500' },
  { key: 'RESOLVED', label: 'Megoldva', icon: CheckCircle2, color: 'text-green-500' },
];

const getStatusIndex = (status: string): number => {
  const index = STATUS_FLOW.findIndex(s => s.key === status);
  return index !== -1 ? index : 0;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING': return '#6B7280';
    case 'IN_REVIEW': return '#3B82F6';
    case 'IN_PROGRESS': return '#F59E0B';
    case 'RESOLVED': return '#10B981';
    case 'REJECTED': return '#EF4444';
    case 'CLOSED': return '#6B7280';
    default: return '#6B7280';
  }
};

export function ReportTimeline({ currentStatus, history, createdAt }: ReportTimelineProps) {
  const currentIndex = getStatusIndex(currentStatus);

  // Build timeline events from history
  const timelineEvents: { status: string; date: Date; comment?: string; changedBy?: string }[] = [
    { status: 'PENDING', date: createdAt, comment: 'Bejelentés beküldve' }
  ];

  // Add events from history
  history.forEach(event => {
    if (event.comment && event.comment.includes('Státusz módosítva')) {
      const statusMatch = event.comment.match(/Státusz módosítva: (\w+)/);
      if (statusMatch) {
        timelineEvents.push({
          status: statusMatch[1],
          date: event.timestamp,
          comment: event.comment,
          changedBy: event.changedByName
        });
      }
    }
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Bejelentés állapota</h3>

      {/* Linear Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`,
              backgroundColor: getStatusColor(currentStatus)
            }}
          />
        </div>

        {/* Timeline Steps */}
        <div className="relative flex justify-between">
          {STATUS_FLOW.map((step, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;
            const isCompleted = isPast || isCurrent;

            // Find event for this status
            const event = timelineEvents.find(e => e.status === step.key);

            return (
              <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                {/* Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-white dark:bg-gray-800 border-current shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  style={{
                    color: isCompleted ? getStatusColor(step.key) : '#D1D5DB',
                    transform: isCurrent ? 'scale(1.2)' : 'scale(1)'
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Status Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Date and Time */}
                  {event && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(event.date).toLocaleDateString('hu-HU', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>

                {/* Event Details */}
                {event && event.comment && isCurrent && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-300 max-w-xs">
                    <p className="text-xs font-medium text-amber-900 mb-1">💬 Admin megjegyzés:</p>
                    <p className="text-xs text-amber-800 italic">&quot;{event.comment}&quot;</p>
                    {event.changedBy && (
                      <p className="text-xs text-amber-600 mt-2 font-medium">— {event.changedBy}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History Log */}
      {timelineEvents.length > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Előzmények</h4>
          <div className="space-y-2">
            {timelineEvents.slice().reverse().map((event, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: getStatusColor(event.status) }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {STATUS_FLOW.find(s => s.key === event.status)?.label || event.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString('hu-HU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {event.comment && (
                    <div className="mt-2 bg-amber-50 border-l-2 border-amber-400 rounded px-3 py-2">
                      <p className="text-xs font-medium text-amber-900 mb-1">💬 Admin megjegyzés:</p>
                      <p className="text-xs text-amber-800">{event.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Status Messages */}
      {currentStatus === 'REJECTED' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-900">Bejelentés elutasítva</p>
          </div>
        </div>
      )}

      {currentStatus === 'CLOSED' && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Bejelentés lezárva</p>
          </div>
        </div>
      )}
    </Card>
  );
}
