'use client';

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import type { ApiQuestion } from './api';

interface AnswerRecord {
  answer: number;
  correct: boolean;
}

interface QuizState {
  sessionId: number | null;
  questions: ApiQuestion[];
  currentQuestionIndex: number;
  score: number;
  answers: (AnswerRecord | null)[];
  timeLimit: number;
  pointsPerCorrect: number;
  isComplete: boolean;
}

interface QuizContextType {
  state: QuizState;
  startSession: (sessionId: number, questions: ApiQuestion[], timeLimit: number, pointsPerCorrect: number) => void;
  recordAnswer: (index: number, answer: number | null, isCorrect: boolean) => void;
  nextQuestion: () => void;
  setComplete: () => void;
  reset: () => void;
  elapsedRef: React.MutableRefObject<number>;
}

const initialState: QuizState = {
  sessionId: null,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  answers: [],
  timeLimit: 1200,
  pointsPerCorrect: 50,
  isComplete: false,
};

const QuizContext = createContext<QuizContextType>({
  state: initialState,
  startSession: () => {},
  recordAnswer: () => {},
  nextQuestion: () => {},
  setComplete: () => {},
  reset: () => {},
  elapsedRef: { current: 0 },
});

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>(initialState);
  const elapsedRef = useRef(0);

  const startSession = useCallback((sessionId: number, questions: ApiQuestion[], timeLimit: number, pointsPerCorrect: number) => {
    elapsedRef.current = 0;
    setState({
      sessionId,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      answers: new Array(questions.length).fill(null),
      timeLimit,
      pointsPerCorrect,
      isComplete: false,
    });
  }, []);

  const recordAnswer = useCallback((index: number, answer: number | null, isCorrect: boolean) => {
    setState(prev => {
      const answers = [...prev.answers];
      answers[index] = answer !== null ? { answer, correct: isCorrect } : null;
      return { ...prev, answers, score: prev.score + (isCorrect ? 1 : 0) };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
  }, []);

  const setComplete = useCallback(() => {
    setState(prev => ({ ...prev, isComplete: true }));
  }, []);

  const reset = useCallback(() => {
    elapsedRef.current = 0;
    setState(initialState);
  }, []);

  return (
    <QuizContext.Provider value={{ state, startSession, recordAnswer, nextQuestion, setComplete, reset, elapsedRef }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  return useContext(QuizContext);
}
