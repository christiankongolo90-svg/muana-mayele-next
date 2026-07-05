'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/api';

export default function Leaderboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<{ rank: number; best_score: number } | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(10, user?.id);
      setPlayers(data.leaderboard);
      if (data.user_rank) setUserRank(data.user_rank);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  function getRankIcon(rank: number) {
    if (rank === 1) return '\u{1F947}';
    if (rank === 2) return '\u{1F948}';
    if (rank === 3) return '\u{1F949}';
    return '';
  }

  function getAvatar(name: string) {
    return name.charAt(0).toUpperCase();
  }

  function formatTime(seconds: number | null) {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function getStars(points: number) {
    if (points >= 800) return 5;
    if (points >= 600) return 4;
    if (points >= 400) return 3;
    if (points >= 200) return 2;
    if (points > 0) return 1;
    return 0;
  }

  return (
    <section id="classement" className="py-16 bg-primary-darker">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 flex items-center justify-center gap-3">
          Classement
          <span className="inline-flex items-center gap-1.5 bg-red/90 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse uppercase tracking-wider">
            <span className="w-2 h-2 bg-white rounded-full" />
            EN DIRECT
          </span>
        </h2>

        {user && userRank && (
          <div className="text-center mb-6">
            <span className="text-gold text-sm">Votre classement: <strong>{userRank.rank}{userRank.rank === 1 ? 'er' : 'e'}</strong> - {userRank.best_score} pts</span>
          </div>
        )}

        <div className="space-y-2 mt-8">
          {players.map(player => {
            const isCurrentUser = user && player.user_id === user.id;
            const isTop3 = player.rank <= 3;
            const stars = getStars(player.total_points);

            return (
              <div
                key={player.rank + player.name}
                className={`flex items-center gap-3 sm:gap-4 rounded-xl px-4 py-3 transition-all ${
                  isTop3 ? 'bg-white/15 backdrop-blur-sm' : 'bg-white/5'
                } ${isCurrentUser ? 'ring-2 ring-gold' : ''} hover:bg-white/20`}
              >
                {/* Rank */}
                <div className="w-10 text-center shrink-0">
                  {isTop3 ? (
                    <span className="text-2xl">{getRankIcon(player.rank)}</span>
                  ) : (
                    <span className="text-white/60 font-bold text-lg">{player.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  isTop3 ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/70'
                }`}>
                  {getAvatar(player.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm truncate">{player.name}</span>
                    {isCurrentUser && (
                      <span className="bg-gold text-primary-dark text-[10px] font-bold px-1.5 py-0.5 rounded">Vous</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {player.best_time !== null && (
                      <span className="text-white/40 text-xs">&#x23F1; {formatTime(player.best_time)}</span>
                    )}
                    {stars > 0 && (
                      <span className="text-gold text-xs">{'\u2B50'.repeat(stars)}</span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <span className="text-gold font-bold text-lg">{player.total_points}</span>
                  <span className="block text-white/40 text-[10px] uppercase tracking-wider">Points</span>
                </div>
              </div>
            );
          })}
        </div>

        {players.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-white/50 text-sm">Aucun participant pour le moment. Soyez le premier !</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-3" />
            <p className="text-white/50 text-sm">Chargement...</p>
          </div>
        )}
      </div>
    </section>
  );
}
