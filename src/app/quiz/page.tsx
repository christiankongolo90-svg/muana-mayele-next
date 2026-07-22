'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useQuiz } from '@/lib/quiz';
import { startQuiz, submitAnswer, completeQuiz, getQuizSettings } from '@/lib/api';

export default function QuizPage() {
  const { user } = useAuth();
  const { state, startSession, recordAnswer, nextQuestion, setComplete, elapsedRef } = useQuiz();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completingRef = useRef(false);
  const autoCompleteRef = useRef<() => void>(() => {});

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    if (state.sessionId) {
      setLoading(false);
      return;
    }
    initQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function initQuiz() {
    if (!user) return;
    try {
      const settings = await getQuizSettings();
      if (!settings.is_open) {
        let msg = 'Le quiz est actuellement fermé. Revenez plus tard.';
        if (settings.schedule?.next_session) {
          const ns = settings.schedule.next_session;
          const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
          const dayName = dayNames[ns.day_of_week] || '';
          const start = ns.start?.slice(0, 5) || '';
          const end = ns.end?.slice(0, 5) || '';
          msg = `Le quiz n'est pas encore ouvert. Prochaine session : ${dayName} de ${start} à ${end}.`;
        }
        setError(msg);
        setLoading(false);
        return;
      }
      const data = await startQuiz(user.id);
      startSession(data.session_id, data.questions, data.time_limit, data.points_per_correct);
      setTimeLeft(data.time_limit);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const handleAutoComplete = useCallback(async () => {
    if (completingRef.current || !state.sessionId) return;
    completingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await completeQuiz(state.sessionId, elapsedRef.current);
      setComplete();
      sessionStorage.setItem('quiz_results', JSON.stringify(res));
      router.push('/results');
    } catch {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sessionId]);

  // Keep ref in sync
  autoCompleteRef.current = handleAutoComplete;

  // Timer
  useEffect(() => {
    if (loading || !state.sessionId || state.isComplete) return;

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          autoCompleteRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, state.sessionId, state.isComplete]);

  async function handleSubmit() {
    if (selectedAnswer === null || showFeedback || isSubmitting || !state.sessionId) return;
    setIsSubmitting(true);
    const question = state.questions[state.currentQuestionIndex];
    try {
      const res = await submitAnswer(state.sessionId, question.id, selectedAnswer);
      setIsCorrect(res.is_correct);
      setCorrectAnswer(res.correct_answer);
      setShowFeedback(true);
      recordAnswer(state.currentQuestionIndex, selectedAnswer, res.is_correct);

      setTimeout(() => {
        if (state.currentQuestionIndex + 1 >= state.questions.length) {
          handleAutoComplete();
        } else {
          nextQuestion();
          setSelectedAnswer(null);
          setShowFeedback(false);
          setCorrectAnswer(null);
          setIsSubmitting(false);
        }
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message);
    }
  }

  function quitQuiz() {
    if (state.sessionId && !state.isComplete) {
      if (confirm('Êtes-vous sûr de vouloir quitter le quiz ? Votre progression sera perdue.')) {
        handleAutoComplete();
      }
    } else {
      router.push('/');
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function getOptionLetter(i: number) {
    return ['A', 'B', 'C', 'D'][i];
  }

  const progress = state.questions.length > 0
    ? ((state.currentQuestionIndex + (showFeedback ? 1 : 0)) / state.questions.length) * 100
    : 0;

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isTimeLow = timeLeft < 60;

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-darker">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }} />
          <p className="text-white text-lg">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-darker p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <span className="text-4xl block mb-4">&#x1F614;</span>
          <h2 className="text-xl font-bold text-dark mb-2">Oups!</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="bg-primary text-white rounded-full px-8 py-3 font-semibold hover:bg-primary-dark transition-colors">
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-darker to-primary flex flex-col">
      {/* Header */}
      <header className="bg-primary-darker/50 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={quitQuiz} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Quitter
          </button>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${isTimeLow ? 'bg-red/20 text-red-300 animate-pulse' : 'bg-white/10 text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            {formatTime(timeLeft)}
          </div>
          <div className="text-right">
            <span className="text-white/50 text-xs block">Score</span>
            <span className="text-gold font-bold text-lg">{state.score * state.pointsPerCorrect}</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-white/50 text-xs mt-1.5 text-center">
            Question {state.currentQuestionIndex + 1} / {state.questions.length}
          </p>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex items-start justify-center px-4 py-6">
        {currentQuestion && (
          <div className="w-full max-w-2xl animate-[fadeIn_0.3s_ease]">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="mb-4">
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {currentQuestion.category}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-dark mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, i) => {
                  let optionClass = 'border-2 border-gray-200 hover:border-primary/50 hover:bg-primary/5';
                  if (selectedAnswer === i && !showFeedback) {
                    optionClass = 'border-2 border-primary bg-primary/10';
                  }
                  if (showFeedback) {
                    if (isCorrect && i === selectedAnswer) {
                      optionClass = 'border-2 border-green-500 bg-green-50';
                    } else if (!isCorrect && selectedAnswer === i) {
                      optionClass = 'border-2 border-red bg-red-50';
                    } else {
                      optionClass = 'border-2 border-gray-100 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !showFeedback && setSelectedAnswer(i)}
                      disabled={showFeedback}
                      className={`w-full flex items-center gap-3 sm:gap-4 rounded-xl px-4 py-3.5 text-left transition-all ${optionClass}`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        showFeedback && isCorrect && i === selectedAnswer ? 'bg-green-500 text-white' :
                        showFeedback && !isCorrect && selectedAnswer === i ? 'bg-red text-white' :
                        selectedAnswer === i && !showFeedback ? 'bg-primary text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {showFeedback && isCorrect && i === selectedAnswer ? '\u2713' :
                         showFeedback && !isCorrect && selectedAnswer === i ? '\u2717' :
                         getOptionLetter(i)}
                      </span>
                      <span className="text-sm sm:text-base text-dark flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-[fadeIn_0.2s_ease] ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span className="text-xl">{isCorrect ? '\u{1F389}' : '\u{1F614}'}</span>
                  <span>{isCorrect ? 'Bonne réponse ! +{state.pointsPerCorrect} points' : 'Mauvaise réponse'}</span>
                </div>
              )}

              {/* Submit button */}
              {!showFeedback && (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="w-full mt-6 bg-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Valider ma réponse
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Question indicators */}
      <div className="px-4 py-4">
        <div className="max-w-3xl mx-auto flex justify-center gap-1.5 flex-wrap">
          {state.questions.map((q, i) => {
            let dotClass = 'bg-white/20';
            if (i === state.currentQuestionIndex) dotClass = 'bg-gold scale-125';
            else if (state.answers[i] !== null) {
              dotClass = state.answers[i]?.correct ? 'bg-green-400' : 'bg-red-400';
            }
            return <div key={q.id} className={`w-2.5 h-2.5 rounded-full transition-all ${dotClass}`} />;
          })}
        </div>
      </div>
    </div>
  );
}
