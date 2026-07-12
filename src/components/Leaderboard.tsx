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

  const top3 = players.filter(p => p.rank <= 3);
  const rest = players.filter(p => p.rank > 3);
  const podiumOrder = [
    top3.find(p => p.rank === 2),
    top3.find(p => p.rank === 1),
    top3.find(p => p.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[];

  return (
    <div id="classement">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 flex items-center justify-center gap-3">
          Classement
          <span className="inline-flex items-center gap-1.5 bg-red/90 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse uppercase tracking-wider" style={{ animation: 'pulse-live 2s ease-in-out infinite' }}>
            <span className="w-2 h-2 bg-white rounded-full" />
            EN DIRECT
          </span>
        </h2>
        <p className="text-white/40 text-sm text-center mb-8">Mis à jour en temps réel</p>

        {user && userRank && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-2.5">
              <span className="text-gold text-sm">Votre classement: <strong className="text-lg">{userRank.rank}{userRank.rank === 1 ? 'er' : 'e'}</strong></span>
              <span className="w-px h-5 bg-white/20" />
              <span className="text-gold text-sm font-bold">{userRank.best_score} pts</span>
            </div>
          </div>
        )}

        {/* Podium for top 3 */}
        {podiumOrder.length > 0 && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10 px-4">
            {podiumOrder.map((player) => {
              const isFirst = player.rank === 1;
              const isCurrentUser = user && player.user_id === user.id;
              const podiumClass = player.rank === 1 ? 'podium-1' : player.rank === 2 ? 'podium-2' : 'podium-3';
              const height = isFirst ? 'h-28 sm:h-32' : player.rank === 2 ? 'h-20 sm:h-24' : 'h-16 sm:h-20';
              const avatarSize = isFirst ? 'w-16 h-16 sm:w-20 sm:h-20 text-2xl' : 'w-12 h-12 sm:w-14 sm:h-14 text-lg';
              const stars = getStars(player.total_points);

              return (
                <div key={player.rank} className={`flex flex-col items-center ${podiumClass}`}>
                  {/* Avatar */}
                  <div className="relative mb-2">
                    <div className={`${avatarSize} rounded-full flex items-center justify-center font-bold ${
                      isFirst ? 'bg-gradient-to-br from-gold to-gold-dark text-primary-dark ring-4 ring-gold/30' :
                      'bg-white/15 text-white ring-2 ring-white/20'
                    } ${isCurrentUser ? 'ring-gold ring-4' : ''}`}>
                      {getAvatar(player.name)}
                    </div>
                    <span className="absolute -top-1 -right-1 text-xl">{getRankIcon(player.rank)}</span>
                  </div>

                  {/* Name */}
                  <span className={`font-semibold text-white text-xs sm:text-sm text-center mb-1 max-w-[80px] sm:max-w-[100px] truncate ${isFirst ? 'text-sm sm:text-base' : ''}`}>
                    {player.name.split(' ')[0]}
                  </span>

                  {/* Stars */}
                  {stars > 0 && (
                    <span className="text-gold text-[10px] mb-1">{'⭐'.repeat(Math.min(stars, isFirst ? 5 : 3))}</span>
                  )}

                  {/* Points */}
                  <span className={`font-bold mb-2 ${isFirst ? 'text-gold text-lg sm:text-xl' : 'text-gold/80 text-sm'}`}>
                    {player.total_points}
                    <span className="text-[10px] text-white/40 ml-0.5">pts</span>
                  </span>

                  {/* Podium bar */}
                  <div className={`w-20 sm:w-24 ${height} rounded-t-xl ${
                    isFirst
                      ? 'bg-gradient-to-t from-gold/30 to-gold/10 border-t-2 border-x-2 border-gold/40'
                      : 'bg-gradient-to-t from-white/10 to-white/5 border-t-2 border-x-2 border-white/15'
                  }`} />
                </div>
              );
            })}
          </div>
        )}

        {/* Rest of leaderboard */}
        <div className="space-y-2">
          {rest.map(player => {
            const isCurrentUser = user && player.user_id === user.id;
            const stars = getStars(player.total_points);

            return (
              <div
                key={player.rank + player.name}
                className={`flex items-center gap-3 sm:gap-4 rounded-xl px-4 py-3 transition-all glass-card ${
                  isCurrentUser ? 'ring-2 ring-gold' : ''
                } hover:bg-white/15`}
              >
                <div className="w-10 text-center shrink-0">
                  <span className="text-white/50 font-bold text-lg">{player.rank}</span>
                </div>

                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-white/10 text-white/70">
                  {getAvatar(player.name)}
                </div>

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
                      <span className="text-gold text-xs">{'⭐'.repeat(stars)}</span>
                    )}
                  </div>
                </div>

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
            <span className="text-4xl block mb-3">&#x1F3C6;</span>
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
    </div>
  );
}
