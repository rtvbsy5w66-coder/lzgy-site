"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Send,
  Award,
  Target,
  Timer
} from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import crypto from "crypto";
import { Quiz, QuizQuestion, SubmitAnswerData, SubmitQuizData } from "@/types/quiz";
import InteractiveParticipationFlow from "@/components/InteractiveParticipationFlow";

interface QuizPlayerPageProps {
  params: { id: string };
}

const QuizPlayerPage: React.FC<QuizPlayerPageProps> = ({ params }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: session } = useSession();
  
  // Check if this is a retake
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isRetake = searchParams.get('retake') === 'true';
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SubmitAnswerData>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInteractiveFlow, setShowInteractiveFlow] = useState(false);
  const [participationType, setParticipationType] = useState<'ANONYMOUS' | 'REGISTERED' | null>(null);
  const [hasChosen, setHasChosen] = useState(false);
  const [showRetakeConfirmation, setShowRetakeConfirmation] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    fetchQuiz();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer setup
  useEffect(() => {
    if (quiz?.timeLimit && !result) {
      const totalTime = quiz.timeLimit * 60; // Convert to seconds
      setTimeLeft(totalTime);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            handleSubmit(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz?.timeLimit, result]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ez a kvíz nem található.');
        } else if (response.status === 403) {
          throw new Error('Ez a kvíz nem érhető el.');
        }
        throw new Error('Nem sikerült betölteni a kvízt.');
      }
      const data = await response.json();
      setQuiz(data);
      
      // If this is a retake and user is logged in, show confirmation
      if (isRetake && session?.user && data.hasCompleted) {
        setShowRetakeConfirmation(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = useCallback((questionId: string, answerData: Partial<SubmitAnswerData>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        ...answerData
      }
    }));
  }, []);

  const handleSubmit = async () => {
    if (!quiz) return;
    
    // If user is logged in, go directly to registered submission
    if (session?.user) {
      await handleDirectRegisteredSubmit();
      return;
    }
    
    // If user hasn't chosen participation type yet, show the flow
    if (!hasChosen) {
      setShowInteractiveFlow(true);
      return;
    }
    
    // If user has chosen, proceed with direct submission
    if (participationType === 'ANONYMOUS') {
      await handleDirectAnonymousSubmit();
    } else {
      await handleDirectRegisteredSubmit();
    }
  };

  const handleDirectAnonymousSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/quizzes/${params.id}/submit-anonymous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: Object.values(answers),
          sessionId: crypto.randomUUID(),
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          allowAnalytics: false
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit');
      setResult(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectRegisteredSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/quizzes/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: Object.values(answers),
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          isRetake: isRetake,
          userData: session ? {
            firstName: (session.user as any)?.displayName?.split(' ')[0] || session.user?.name?.split(' ')[0] || '',
            lastName: (session.user as any)?.displayName?.split(' ').slice(1).join(' ') || session.user?.name?.split(' ').slice(1).join(' ') || '',
            email: session.user?.email || '',
            phoneNumber: (session.user as any)?.phoneNumber || ''
          } : undefined
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit');
      setResult(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParticipationChoice = (type: 'ANONYMOUS' | 'REGISTERED') => {
    setParticipationType(type);
    setHasChosen(true);
    setShowInteractiveFlow(false);
    
    // After choice is made, proceed with submission
    if (type === 'ANONYMOUS') {
      handleDirectAnonymousSubmit();
    } else {
      handleDirectRegisteredSubmit();
    }
  };

  const handleQuizSuccess = (result: any) => {
    setResult(result);
    setShowInteractiveFlow(false);
  };

  const handleQuizError = (error: string) => {
    console.error('Quiz error:', error);
    alert(error);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Kvíz betöltése...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hiba történt</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) return null;

  // NOTE: Participation choice is now shown ONLY when user clicks submit
  // This ensures users can see and complete quiz questions first

  // Results page
  if (result) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="mb-8" style={{ borderColor: colors.accent }}>
            <CardHeader className="text-center">
              <div className="mb-4">
                <Award 
                  className={`h-16 w-16 mx-auto mb-4 ${getScoreColor(result.percentage)}`}
                />
              </div>
              <CardTitle className="text-2xl mb-2">Kvíz teljesítve!</CardTitle>
              <h2 className="text-xl text-gray-600">{quiz.title}</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(result.percentage)}`}>
                    {result.percentage}%
                  </div>
                  <p className="text-gray-600">Eredmény</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.score}/{result.totalPoints}
                  </div>
                  <p className="text-gray-600">Pontszám</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {result.timeSpent ? formatTime(result.timeSpent) : 'N/A'}
                  </div>
                  <p className="text-gray-600">Idő</p>
                </div>
              </div>

              {/* Detailed Results */}
              {quiz.showResults && result.answers && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Részletes eredmények és források:
                  </h3>
                  {result.answers.map((answer: any, index: number) => {
                    // Find the original question to get all options
                    const originalQuestion = quiz.questions.find((q: any) => q.id === answer.questionId);
                    const correctOption = originalQuestion?.options?.find((opt: any) => opt.isCorrect);

                    return (
                      <Card key={index} className={`border-l-4 ${answer.isCorrect ? 'border-l-green-500' : 'border-l-red-500'} shadow-lg`}>
                        <CardContent className="pt-6">
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-lg flex-1 pr-4">
                              {index + 1}. {answer.question}
                            </h4>
                            <div className="flex items-center gap-2 shrink-0">
                              {answer.isCorrect ? (
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="text-sm font-semibold text-green-700">
                                    Helyes
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                                  <AlertCircle className="h-5 w-5 text-red-600" />
                                  <span className="text-sm font-semibold text-red-700">
                                    Helytelen
                                  </span>
                                </div>
                              )}
                              <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full">
                                {answer.points}/{answer.maxPoints} pont
                              </span>
                            </div>
                          </div>

                          {/* Answers */}
                          <div className="space-y-3 mb-4">
                            {/* User's Answer */}
                            <div className={`p-3 rounded-lg ${answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                                {answer.isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                                Az Ön válasza:
                              </p>
                              <p className={`${answer.isCorrect ? 'text-green-800' : 'text-red-800'} font-medium`}>
                                {answer.userAnswer || 'Nincs válasz'}
                              </p>
                            </div>

                            {/* Correct Answer (if user was wrong) */}
                            {!answer.isCorrect && correctOption && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Helyes válasz:
                                </p>
                                <p className="text-green-800 font-medium">
                                  {correctOption.optionText}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Explanation & Sources */}
                          {answer.explanation && (() => {
                            // Split explanation and source
                            const parts = answer.explanation.split('Forrás:');
                            const explanationText = parts[0].trim();
                            const sourceText = parts[1] ? parts[1].trim() : null;

                            return (
                              <div className="mt-4 space-y-3">
                                {/* Explanation */}
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                                  <div className="flex items-start gap-2">
                                    <div className="mt-1">
                                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-blue-900 mb-2">📖 Magyarázat:</p>
                                      <p className="text-sm text-blue-800 leading-relaxed">
                                        {explanationText}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Source */}
                                {sourceText && (
                                  <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                                    <div className="flex items-start gap-2">
                                      <div className="mt-1">
                                        <svg className="h-5 w-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 mb-2">📚 Tudományos forrás:</p>
                                        <p className="text-sm text-amber-900 font-medium leading-relaxed italic">
                                          {sourceText}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-center gap-4 mt-8">
                <Button onClick={() => router.push('/kviz')}>
                  Más kvízek
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Újra próbálom
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vissza
          </Button>
          <h1 className="text-xl font-semibold text-center flex-1 mx-4">
            {quiz.title}
          </h1>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Kérdés {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            {currentQuestion.points > 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                <span>{currentQuestion.points} pont</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswerChange={(answerData) => handleAnswerChange(currentQuestion.id, answerData)}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Előző
          </Button>

          {isLastQuestion ? (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ 
                background: colors.gradient,
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>Küldés...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kvíz beküldése
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              style={{ 
                background: colors.gradient,
                color: 'white'
              }}
            >
              Következő
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Participation Flow */}
      {showInteractiveFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
            <Button
              onClick={() => setShowInteractiveFlow(false)}
              className="absolute top-4 right-4 z-10 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Bezárás
            </Button>
            <InteractiveParticipationFlow
              type="quiz"
              id={params.id}
              title={quiz?.title || ''}
              description={quiz?.description || ''}
              answers={answers}
              session={session}
              onLogin={() => signIn('google')}
              onSuccess={handleQuizSuccess}
              onError={handleQuizError}
            />
          </div>
        </div>
      )}

      {/* Retake Confirmation Modal */}
      {showRetakeConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full shadow-2xl border-0 bg-white dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.gradientFrom}20` }}
                >
                  <AlertCircle 
                    className="h-5 w-5" 
                    style={{ color: colors.gradientFrom }}
                  />
                </div>
                <span style={{ color: colors.text }}>Kvíz újrakitöltése</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ön már korábban kitöltötte ezt a kvízt. Biztosan újra szeretné kitölteni? 
                Az új eredmény felülírja a korábbi eredményt.
              </p>
              <div className="flex flex-col gap-4">
                {/* Primary Action: Confirm Retake */}
                <Button
                  onClick={() => {
                    setShowRetakeConfirmation(false);
                  }}
                  className="w-full h-14 font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] border-0 text-base"
                  style={{ 
                    background: colors.gradient,
                    color: colors.accent,
                    boxShadow: `0 6px 20px ${colors.gradientFrom}30`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 10px 30px ${colors.gradientFrom}40`;
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 6px 20px ${colors.gradientFrom}30`;
                    e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                  }}
                >
                  Igen, kitöltöm újra
                </Button>

                {/* Secondary Action: Cancel */}
                <Button
                  onClick={() => {
                    setShowRetakeConfirmation(false);
                    router.push('/kviz');
                  }}
                  className="w-full h-14 font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 text-base bg-white dark:bg-gray-800"
                  style={{ 
                    borderColor: '#d1d5db',
                    color: '#6b7280',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent;
                    e.currentTarget.style.color = colors.accent;
                    e.currentTarget.style.backgroundColor = `${colors.accent}05`;
                    e.currentTarget.style.boxShadow = `0 8px 25px ${colors.accent}20`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                >
                  Mégse
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Question Renderer Component
interface QuestionRendererProps {
  question: QuizQuestion;
  answer?: SubmitAnswerData;
  onAnswerChange: (answerData: Partial<SubmitAnswerData>) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ 
  question, 
  answer, 
  onAnswerChange 
}) => {
  if (question.questionType === 'TEXT_INPUT') {
    return (
      <Textarea
        value={answer?.textAnswer || ''}
        onChange={(e) => onAnswerChange({ textAnswer: e.target.value })}
        placeholder="Írja be a válaszát..."
        rows={4}
      />
    );
  }

  return (
    <RadioGroup
      value={answer?.optionId || ''}
      onValueChange={(value) => onAnswerChange({ optionId: value })}
    >
      <div className="space-y-4">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="text-base cursor-pointer flex-1">
              {option.optionText}
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
};

export default QuizPlayerPage;