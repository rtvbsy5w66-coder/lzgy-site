"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Check, Clock, Users, Mail, RefreshCw } from "lucide-react";

interface PetitionSignatureCardProps {
  signature: {
    id: string;
    signedAt: string;
    status: string;
    isAnonymous: boolean;
    showName: boolean;
    petition: {
      id: string;
      title: string;
      status: string;
      targetGoal: number;
      category: {
        name: string;
        color: string;
      };
      _count?: {
        signatures: number;
      };
    };
  };
  detailed?: boolean;
}

export function PetitionSignatureCard({ signature, detailed = false }: PetitionSignatureCardProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch(`/api/petitions/${signature.petition.id}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureId: signature.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResendMessage('✅ Megerősítő email újra elküldve!');
      } else {
        setResendMessage(`❌ Hiba: ${result.error || 'Nem sikerült újraküldeni az emailt'}`);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendMessage('❌ Hálózati hiba történt. Próbálja újra később.');
    } finally {
      setIsResending(false);
      // Clear message after 5 seconds
      setTimeout(() => setResendMessage(null), 5000);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-500';
      case 'PENDING_VERIFICATION': return 'bg-yellow-500';
      case 'REJECTED': return 'bg-red-500';
      case 'SPAM': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'Hitelesített';
      case 'PENDING_VERIFICATION': return 'Hitelesítés alatt';
      case 'REJECTED': return 'Elutasított';
      case 'SPAM': return 'Spam';
      default: return status;
    }
  };

  const getPetitionStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      case 'PAUSED': return 'bg-yellow-500';
      case 'DRAFT': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPetitionStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktív';
      case 'CLOSED': return 'Lezárt';
      case 'PAUSED': return 'Szünetel';
      case 'DRAFT': return 'Tervezet';
      case 'ARCHIVED': return 'Archivált';
      default: return status;
    }
  };

  const progressPercentage = signature.petition._count?.signatures 
    ? Math.min((signature.petition._count.signatures / signature.petition.targetGoal) * 100, 100)
    : 0;

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {signature.petition.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(signature.signedAt)}</span>
            </div>
            <Badge
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs"
              style={{ borderColor: signature.petition.category.color }}
            >
              {signature.petition.category.name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-700 font-medium">
              {signature.isAnonymous ? 'Anonim aláírás' : 'Nyilvános aláírás'}
            </span>
          </div>

          {/* Resend verification for pending signatures */}
          {signature.status === 'PENDING_VERIFICATION' && (
            <div className="mt-2">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                {isResending ? 'Küldés...' : 'Email újraküldése'}
              </button>
              
              {resendMessage && (
                <div className="mt-2 text-xs font-medium">
                  {resendMessage}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Badge 
            variant="secondary" 
            className={`${getPetitionStatusColor(signature.petition.status)} text-white border-0`}
          >
            {getPetitionStatusText(signature.petition.status)}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(signature.status)} text-white border-0`}
          >
            {getStatusText(signature.status)}
          </Badge>
        </div>
      </div>

      {detailed && (
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
          {/* Aláírás státusz */}
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Aláírás státusz</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-purple-700 pl-6">
              <span>Típus: {signature.isAnonymous ? 'Anonim' : 'Nyilvános'}</span>
              <span>Állapot: {getStatusText(signature.status)}</span>
            </div>
          </div>

          {/* Petíció előrehaladás */}
          {signature.petition._count && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Petíció előrehaladás</span>
              </div>
              <div className="pl-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>{signature.petition._count.signatures} / {signature.petition.targetGoal} aláírás</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Aláírás részletei */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">Aláírva:</span>
              <span>{formatDate(signature.signedAt)}</span>
            </div>
            {!signature.isAnonymous && signature.showName && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Névvel:</span>
                <span>Igen</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}