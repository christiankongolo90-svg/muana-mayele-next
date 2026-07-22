'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getLeaderboard } from '@/lib/api';

interface ResultsData {
  results: {
    session_id: number;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    score: number;
    total_points: number;
    percentage: number;
    time_taken: number;
  };
  answers: {
    question_id: number;
    question: string;
    options: string[];
    selected_answer: number;
    correct_answer: number;
    is_correct: boolean;
    category: string;
  }[];
}

export default function ResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [userRank, setUserRank] = useState<{ rank: number; total: number } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('quiz_results');
    if (stored) {
      try { setData(JSON.parse(stored)); } catch { router.replace('/'); }
    } else {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    getLeaderboard(100, user.id)
      .then(lb => {
        if (lb.user_rank) {
          setUserRank({ rank: lb.user_rank.rank, total: lb.total || lb.leaderboard?.length || 0 });
        }
      })
      .catch(() => {});
  }, [user]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-darker">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const { results, answers } = data;
  const pct = results.percentage;

  let grade = 'À améliorer';
  let gradeColor = 'text-red';
  if (pct >= 90) { grade = 'Excellent !'; gradeColor = 'text-gold'; }
  else if (pct >= 75) { grade = 'Très bien !'; gradeColor = 'text-green-500'; }
  else if (pct >= 60) { grade = 'Bien !'; gradeColor = 'text-blue-500'; }
  else if (pct >= 50) { grade = 'Passable'; gradeColor = 'text-orange-500'; }

  let trophy = '\u{1F949}'; // bronze
  if (pct >= 75) trophy = '\u{1F3C6}'; // gold
  else if (pct >= 50) trophy = '\u{1F948}'; // silver

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function getOptionLetter(i: number) { return ['A', 'B', 'C', 'D'][i]; }

  const strokeDashoffset = 283 - (283 * pct / 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-darker to-primary relative overflow-hidden">
      {/* Confetti for high scores */}
      {pct >= 75 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {['\u{1F389}', '\u{1F38A}', '\u2728', '\u{1F31F}', '\u{1F389}'].map((emoji, i) => (
            <span key={i} className="absolute text-3xl" style={{
              left: `${15 + i * 18}%`,
              animation: `confetti-fall ${3 + i * 0.5}s linear ${i * 0.3}s infinite`,
            }}>{emoji}</span>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">&#x1F393;</span>
          <span className="text-white font-bold text-lg">Muana Mayele</span>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-12">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center mb-8 animate-[slideUp_0.5s_ease]">
          <span className="text-5xl block mb-2">{trophy}</span>
          <h1 className="text-2xl font-bold text-dark mb-2">Quiz Terminé !</h1>
          <p className={`text-lg font-semibold ${gradeColor} mb-6`}>{grade}</p>

          {/* Rank badge */}
          {userRank && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span>🏅</span>
              <span>{userRank.rank}{userRank.rank === 1 ? 'er' : 'ème'} sur {userRank.total} participants</span>
            </div>
          )}

          {/* Circular progress */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle className="circle-bg" cx="50" cy="50" r="45" />
              <circle className="circle-progress" cx="50" cy="50" r="45" style={{ strokeDashoffset }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-dark">{pct}%</span>
              <span className="text-xs text-gray-400">Score</span>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">&#x2B50;</span>
            <span className="text-3xl font-bold text-gold">{results.total_points}</span>
            <span className="text-gray-400 text-sm">Points</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-green-50 rounded-xl p-3">
              <span className="text-green-500 text-lg block">&#x2713;</span>
              <span className="text-xl font-bold text-dark block">{results.correct_answers}</span>
              <span className="text-xs text-gray-500">Correctes</span>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <span className="text-red text-lg block">&#x2717;</span>
              <span className="text-xl font-bold text-dark block">{results.wrong_answers}</span>
              <span className="text-xs text-gray-500">Incorrectes</span>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <span className="text-blue-500 text-lg block">&#x23F1;</span>
              <span className="text-xl font-bold text-dark block">{formatTime(results.time_taken)}</span>
              <span className="text-xs text-gray-500">Temps</span>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <span className="text-purple-500 text-lg block">&#x1F4DD;</span>
              <span className="text-xl font-bold text-dark block">{results.total_questions}</span>
              <span className="text-xs text-gray-500">Questions</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button onClick={() => { sessionStorage.removeItem('quiz_results'); router.push('/quiz'); }} className="bg-primary text-white rounded-full px-6 py-3 font-semibold text-sm hover:bg-primary-dark transition-colors flex items-center gap-2">
              &#x1F504; Rejouer
            </button>
            <button onClick={() => { sessionStorage.removeItem('quiz_results'); router.push('/'); }} className="bg-gray-100 text-dark rounded-full px-6 py-3 font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
              &#x1F3E0; Accueil
            </button>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-[slideUp_0.7s_ease]">
          <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
            <span>&#x1F4CB;</span> Révision des réponses
          </h2>

          <div className="space-y-4">
            {answers.map((a, i) => (
              <div key={i} className={`border rounded-xl p-4 ${a.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">Q{i + 1}</span>
                    <span className="text-xs text-gray-400">{a.category}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${a.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {a.is_correct ? '\u2713 Correct' : '\u2717 Incorrect'}
                  </span>
                </div>
                <p className="text-sm font-medium text-dark mb-3">{a.question}</p>
                <div className="space-y-1.5">
                  {a.options.map((opt, j) => {
                    let cls = 'text-gray-500';
                    if (a.is_correct && j === a.selected_answer) cls = 'text-green-700 font-medium bg-green-50 border-green-200';
                    else if (!a.is_correct && a.selected_answer === j) cls = 'text-red-700 font-medium bg-red-50 border-red-200';

                    return (
                      <div key={j} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded border border-transparent ${cls}`}>
                        <span className="font-bold w-5">{getOptionLetter(j)}</span>
                        <span className="flex-1">{opt}</span>
                        {a.is_correct && j === a.selected_answer && <span className="text-green-500">&#x2713;</span>}
                        {!a.is_correct && a.selected_answer === j && <span className="text-red">&#x2717;</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
