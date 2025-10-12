"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useThemeColors } from '@/context/ThemeContext';
import ParticipationChoice from './ParticipationChoice';
import AnonymousParticipationForm from './AnonymousParticipationForm';
import RegisteredParticipationForm from './RegisteredParticipationForm';
import { 
  ParticipationFlowState, 
  AnonymousSignatureRequest, 
  RegisteredSignatureRequest,
  AnonymousVoteRequest,
  RegisteredVoteRequest
} from '@/types/participation';

interface InteractiveParticipationFlowProps {
  type: 'petition' | 'poll' | 'quiz';
  id: string;
  title: string;
  description: string;
  // For polls
  options?: Array<{ id: string; text: string; description?: string }>;
  // For quizzes
  answers?: Record<string, any>;
  // Session and login
  session?: any;
  onLogin?: () => void;
  // Callbacks
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onChoice?: (type: 'ANONYMOUS' | 'REGISTERED') => void;
}

const InteractiveParticipationFlow: React.FC<InteractiveParticipationFlowProps> = ({
  type,
  id,
  title,
  description,
  options = [],
  answers = {},
  session: propSession,
  onLogin,
  onSuccess,
  onError,
  onChoice
}) => {
  const colors = useThemeColors();
  const { data: session, status } = useSession();
  
  // Use prop session if provided, otherwise use hook session
  const currentSession = propSession || session;
  const [flowState, setFlowState] = useState<ParticipationFlowState>({
    step: 'choice',
    selectedType: null,
    isSubmitting: false,
    error: null,
    success: false
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [participationCapabilities, setParticipationCapabilities] = useState({
    allowsAnonymous: true,
    allowsRegistered: true,
    isActive: true
  });

  // Check participation capabilities on mount
  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const endpoint = type === 'petition' 
          ? `/api/petitions/${id}/sign-anonymous`
          : `/api/polls/${id}/vote-anonymous`;
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setParticipationCapabilities({
            allowsAnonymous: data.allowsAnonymous,
            allowsRegistered: true, // Always allow registered for now
            isActive: data.isActive
          });
        }
      } catch (error) {
        console.error('Error checking participation capabilities:', error);
      }
    };

    checkCapabilities();
  }, [type, id]);

  const handleParticipationChoice = (chosenType: 'ANONYMOUS' | 'REGISTERED') => {
    // If onChoice callback is provided, use it (for direct choice without form)
    if (onChoice) {
      onChoice(chosenType);
      return;
    }
    
    // Otherwise, continue with form flow
    setFlowState(prev => ({
      ...prev,
      step: 'form',
      selectedType: chosenType,
      error: null
    }));
  };

  const handleBack = () => {
    setFlowState(prev => ({
      ...prev,
      step: 'choice',
      selectedType: null,
      error: null
    }));
  };

  const handleAnonymousSubmit = async (data: AnonymousSignatureRequest | AnonymousVoteRequest) => {
    setFlowState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      let endpoint: string;
      if (type === 'petition') {
        endpoint = `/api/petitions/${id}/sign-anonymous`;
      } else if (type === 'poll') {
        endpoint = `/api/polls/${id}/vote-anonymous`;
      } else {
        endpoint = `/api/quizzes/${id}/submit-anonymous`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setFlowState(prev => ({
        ...prev,
        step: 'confirmation',
        isSubmitting: false,
        success: true
      }));

      onSuccess?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFlowState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  };

  const handleRegisteredSubmit = async (data: RegisteredSignatureRequest | RegisteredVoteRequest) => {
    setFlowState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      let endpoint: string;
      if (type === 'petition') {
        endpoint = `/api/petitions/${id}/sign`;
      } else if (type === 'poll') {
        endpoint = `/api/polls/${id}/vote`;
      } else {
        endpoint = `/api/quizzes/${id}/submit`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setFlowState(prev => ({
        ...prev,
        step: 'confirmation',
        isSubmitting: false,
        success: true
      }));

      onSuccess?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFlowState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  };

  // Show error state if not active
  if (!participationCapabilities.isActive) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 dark:text-red-400 mb-4">
                Ez a {type === 'petition' ? 'petíció' : 'szavazás'} jelenleg nem aktív vagy már lezárult.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success confirmation
  if (flowState.step === 'confirmation' && flowState.success) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                Sikeres Részvétel!
              </h1>
              <p className="text-green-700 dark:text-green-300 mb-4">
                {flowState.selectedType === 'ANONYMOUS' ? (
                  <>
                    Anonim {type === 'petition' ? 'aláírása' : 'szavazata'} sikeresen rögzítve. 
                    Köszönjük a részvételét!
                  </>
                ) : (
                  <>
                    {type === 'petition' ? 'Aláírása' : 'Szavazata'} rögzítve. 
                    {type === 'petition' && 'Email megerősítést küldtünk a megadott címre.'}
                    Köszönjük a részvételét és a regisztrációt!
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main flow
  switch (flowState.step) {
    case 'choice':
      return (
        <ParticipationChoice
          onChoice={handleParticipationChoice}
          title={title}
          description={description}
          type={type}
          session={currentSession}
          onLogin={onLogin || (() => signIn('google'))}
        />
      );

    case 'form':
      if (flowState.selectedType === 'ANONYMOUS') {
        return (
          <AnonymousParticipationForm
            type={type}
            title={title}
            onSubmit={handleAnonymousSubmit}
            onBack={handleBack}
            isSubmitting={flowState.isSubmitting}
            options={options}
            selectedOptionId={selectedOptionId}
            onOptionSelect={setSelectedOptionId}
          />
        );
      } else {
        return (
          <RegisteredParticipationForm
            type={type}
            title={title}
            onSubmit={handleRegisteredSubmit}
            onBack={handleBack}
            isSubmitting={flowState.isSubmitting}
            options={options}
            selectedOptionId={selectedOptionId}
            onOptionSelect={setSelectedOptionId}
            session={currentSession}
          />
        );
      }

    default:
      return null;
  }
};

export default InteractiveParticipationFlow;