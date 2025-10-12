"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Calendar, Clock, Check } from "lucide-react";

interface PollVoteCardProps {
  vote: {
    id: string;
    votedAt: string;
    timeSpent?: number;
    poll: {
      title: string;
      category?: string;
      status: string;
    };
    option: {
      optionText: string;
    };
  };
  detailed?: boolean;
}

export function PollVoteCard({ vote, detailed = false }: PollVoteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      case 'SCHEDULED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktív';
      case 'CLOSED': return 'Lezárt';
      case 'SCHEDULED': return 'Ütemezett';
      case 'ARCHIVED': return 'Archivált';
      default: return status;
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500 dark:border-l-green-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
            {vote.poll.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(vote.votedAt)}</span>
            </div>
            {detailed && vote.timeSpent && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(vote.timeSpent)}</span>
              </div>
            )}
            {vote.poll.category && (
              <Badge className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs">
                {vote.poll.category}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Választás: &ldquo;{vote.option.optionText}&rdquo;
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant="secondary"
            className={`${getStatusColor(vote.poll.status)} text-white border-0`}
          >
            {getStatusText(vote.poll.status)}
          </Badge>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Vote className="h-4 w-4" />
            <span className="text-sm font-medium">Leadva</span>
          </div>
        </div>
      </div>

      {detailed && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Az Ön választása</span>
            </div>
            <p className="text-sm text-gray-900 font-medium pl-6">
              &ldquo;{vote.option.optionText}&rdquo;
            </p>
          </div>

          {vote.timeSpent && (
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Döntési idő:</span>
                <span>{formatDuration(vote.timeSpent)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}