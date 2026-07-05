'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { adminGetSession } from '@/lib/api';

export default function AdminSessionDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = Number(params.id);

  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    adminGetSession(user.id, sessionId)
      .then(data => { setSession(data.session); setAnswers(data.answers); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, sessionId]);

  function formatDate(d: string) {
    try { return new Date(d).toLocaleString('fr-FR'); } catch { return d; }
  }

  function getOptionLetter(i: number) { return ['A', 'B', 'C', 'D'][i]; }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;
  if (error) return <p className="text-red py-10 text-center">{error}</p>;
  if (!session) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => router.push('/admin/sessions')} className="text-sm text-primary hover:underline">&larr; Retour aux sessions</button>

      {/* Session info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-dark mb-4">Session #{session.id}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-400 block">Joueur</span><span className="font-medium">{session.full_name}</span></div>
          <div><span className="text-gray-400 block">Statut</span><span className={`font-medium ${session.is_completed ? 'text-green-600' : 'text-orange-500'}`}>{session.is_completed ? 'Complete' : 'En cours'}</span></div>
          <div><span className="text-gray-400 block">Score</span><span className="font-medium text-primary">{session.total_points || 0} pts</span></div>
          <div><span className="text-gray-400 block">Resultats</span><span className="font-medium">{session.correct_answers || 0}/{session.total_questions}</span></div>
          <div><span className="text-gray-400 block">Temps</span><span className="font-medium">{session.time_taken ? `${Math.floor(session.time_taken / 60)}:${(session.time_taken % 60).toString().padStart(2, '0')}` : '--'}</span></div>
          <div><span className="text-gray-400 block">Pourcentage</span><span className="font-medium">{session.percentage || 0}%</span></div>
          <div><span className="text-gray-400 block">Debut</span><span className="font-medium text-xs">{formatDate(session.started_at)}</span></div>
          <div><span className="text-gray-400 block">Fin</span><span className="font-medium text-xs">{session.ended_at ? formatDate(session.ended_at) : '--'}</span></div>
        </div>
      </div>

      {/* Answers */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-dark mb-4">Reponses ({answers.length})</h3>
        <div className="space-y-3">
          {answers.map((a, i) => {
            const opts = typeof a.options === 'string' ? JSON.parse(a.options) : a.options;
            return (
              <div key={i} className={`border rounded-lg p-4 ${a.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Q{i + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{a.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${a.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {a.is_correct ? '\u2713 Correct' : '\u2717 Incorrect'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-dark mb-2">{a.question}</p>
                <div className="space-y-1">
                  {Array.isArray(opts) && opts.map((opt: string, j: number) => (
                    <div key={j} className={`text-xs px-2 py-1 rounded ${j === Number(a.correct_answer) ? 'text-green-700 bg-green-50 font-medium' : Number(a.selected_answer) === j && j !== Number(a.correct_answer) ? 'text-red-700 bg-red-50 font-medium' : 'text-gray-500'}`}>
                      {getOptionLetter(j)}. {opt}
                      {j === Number(a.correct_answer) && ' \u2713'}
                      {Number(a.selected_answer) === j && j !== Number(a.correct_answer) && ' \u2717'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
