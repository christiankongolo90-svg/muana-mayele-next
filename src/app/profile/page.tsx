'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getUserStats, type UserStats } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/'); return; }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadProfile() {
    if (!user) return;
    setLoading(true); setError('');
    try {
      const data = await getUserStats(user.id);
      setProfile(data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  function getRankSuffix(r: number) { return r === 1 ? 'er' : 'ème'; }

  function getScoreClass(score: number) {
    if (score >= 180) return 'excellent';
    if (score >= 140) return 'good';
    if (score >= 100) return 'average';
    return 'low';
  }

  function getScoreBadge(score: number) {
    if (score >= 180) return '\u{1F31F}';
    if (score >= 140) return '\u{1F44D}';
    if (score >= 100) return '\u{1F4C8}';
    return '\u{1F4AA}';
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="flex-1 bg-bg pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {loading && (
            <div className="text-center py-20">
              <div className="spinner spinner-dark mx-auto mb-3" style={{ width: 36, height: 36 }} />
              <p className="text-gray-500">Chargement du profil...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20">
              <span className="text-4xl block mb-3">&#x1F615;</span>
              <p className="text-gray-500 mb-4">{error}</p>
              <button onClick={loadProfile} className="bg-primary text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-primary-dark">Réessayer</button>
            </div>
          )}

          {profile && !loading && (
            <>
              {/* Profile Header */}
              <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-3xl">&#x1F464;</div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-dark">{profile.user.full_name}</h1>
                  <p className="text-gray-500 text-sm">{profile.user.country_code} {profile.user.phone}</p>
                  {profile.user.neighborhood && <p className="text-gray-400 text-sm mt-0.5">&#x1F4CD; {profile.user.neighborhood}</p>}
                  <p className="text-gray-400 text-xs mt-1">Membre depuis {formatDate(profile.user.member_since)}</p>
                </div>
                <button onClick={() => router.push('/quiz')} className="bg-primary text-white rounded-full px-6 py-3 font-semibold text-sm hover:bg-primary-dark transition-colors whitespace-nowrap">
                  &#x1F3AE; Jouer au Quiz
                </button>
              </section>

              {/* Stats */}
              <section className="mb-6">
                <h2 className="text-lg font-bold text-dark mb-4">Mes Statistiques</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: '\u{1F3C6}', label: 'Classement', value: profile.stats.rank ? `${profile.stats.rank}${getRankSuffix(profile.stats.rank)}` : '--', color: 'bg-yellow-50' },
                    { icon: '\u2B50', label: 'Meilleur Score', value: profile.stats.best_score, color: 'bg-orange-50' },
                    { icon: '\u{1F3AF}', label: 'Points Totaux', value: profile.stats.total_points, color: 'bg-blue-50' },
                    { icon: '\u{1F4DD}', label: 'Quiz Joués', value: profile.stats.total_quizzes, color: 'bg-purple-50' },
                    { icon: '\u2705', label: 'Précision', value: `${profile.stats.accuracy}%`, color: 'bg-green-50' },
                    { icon: '\u{1F4CA}', label: 'Moyenne', value: profile.stats.average_score, color: 'bg-pink-50' },
                  ].map(stat => (
                    <div key={stat.label} className={`${stat.color} rounded-xl p-4 text-center`}>
                      <span className="text-2xl block mb-1">{stat.icon}</span>
                      <span className="text-xl font-bold text-dark block">{stat.value}</span>
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* History */}
              <section>
                <h2 className="text-lg font-bold text-dark mb-4">Historique des Quiz</h2>
                {profile.history.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <span className="text-3xl block mb-2">&#x1F3AE;</span>
                    <p className="text-gray-500 mb-4">Aucun quiz complété pour le moment</p>
                    <button onClick={() => router.push('/quiz')} className="bg-primary text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-primary-dark">Commencer mon premier quiz</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.history.map(quiz => (
                      <div key={quiz.session_id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                        <div className="text-center shrink-0">
                          <span className="text-xs text-gray-400 block">{formatDate(quiz.played_at)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">{quiz.score}</span>
                            <span className="text-xs text-gray-400">points</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span>&#x2713; {quiz.correct_answers}/{quiz.total_questions}</span>
                            <span>&#x23F1; {formatTime(quiz.time_taken)}</span>
                          </div>
                        </div>
                        <span className="text-2xl">{getScoreBadge(quiz.score)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
