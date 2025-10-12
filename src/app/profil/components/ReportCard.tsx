"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeColors } from "@/context/ThemeContext";
import { MapPin, Clock, AlertCircle } from "lucide-react";
import { CATEGORY_LABELS } from "../../../../types/report.types";

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportCardProps {
  report: Report;
  detailed?: boolean;
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Függőben',
    'IN_REVIEW': 'Vizsgálat alatt',
    'IN_PROGRESS': 'Folyamatban',
    'RESOLVED': 'Megoldva',
    'REJECTED': 'Elutasítva',
    'CLOSED': 'Lezárva',
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING': return '#f59e0b'; // orange
    case 'IN_REVIEW': return '#3b82f6'; // blue
    case 'IN_PROGRESS': return '#8b5cf6'; // purple
    case 'RESOLVED': return '#10b981'; // green
    case 'REJECTED': return '#ef4444'; // red
    case 'CLOSED': return '#6b7280'; // gray
    default: return '#9ca3af';
  }
};

const getUrgencyText = (urgency: string): string => {
  const urgencyMap: Record<string, string> = {
    'LOW': 'Alacsony',
    'MEDIUM': 'Közepes',
    'HIGH': 'Magas',
    'URGENT': 'Sürgős',
  };
  return urgencyMap[urgency] || urgency;
};

const getUrgencyColor = (urgency: string): string => {
  switch (urgency) {
    case 'LOW': return '#10b981'; // green
    case 'MEDIUM': return '#f59e0b'; // orange
    case 'HIGH': return '#ef4444'; // red
    case 'URGENT': return '#dc2626'; // dark red
    default: return '#9ca3af';
  }
};

export function ReportCard({ report, detailed = false }: ReportCardProps) {
  const colors = useThemeColors();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const categoryLabel = CATEGORY_LABELS[report.category as keyof typeof CATEGORY_LABELS] || report.category;

  return (
    <Link href={`/bejelentes/${report.id}`}>
      <Card
        className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          borderLeft: `4px solid ${getStatusColor(report.status)}`
        }}
      >
        <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1" style={{ color: colors.text }}>
              {report.title}
            </h3>
            <p className="text-sm mb-2" style={{ color: colors.text, opacity: 0.8 }}>
              {categoryLabel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              style={{
                backgroundColor: getStatusColor(report.status),
                color: 'white',
                border: 'none'
              }}
            >
              {getStatusText(report.status)}
            </Badge>
            <Badge
              variant="outline"
              style={{
                borderColor: getUrgencyColor(report.urgency),
                color: getUrgencyColor(report.urgency)
              }}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {getUrgencyText(report.urgency)}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {detailed && (
          <p className="text-sm" style={{ color: colors.text, opacity: 0.9 }}>
            {report.description}
          </p>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.text, opacity: 0.7 }}>
          <MapPin className="h-4 w-4" />
          <span>{report.location}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs" style={{ color: colors.text, opacity: 0.6 }}>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Bejelentve: {formatDate(report.createdAt)}</span>
          </div>
          {detailed && report.updatedAt !== report.createdAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Frissítve: {formatDate(report.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Report ID for reference */}
        <div className="text-xs font-mono pt-2 border-t" style={{
          color: colors.text,
          opacity: 0.5,
          borderColor: colors.border
        }}>
          Azonosító: {report.id.slice(0, 8)}...
        </div>
        </div>
      </Card>
    </Link>
  );
}
