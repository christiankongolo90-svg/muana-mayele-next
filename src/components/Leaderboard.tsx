'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/api';
import { useReveal } from '@/lib/useReveal';

export default function Leaderboard() {
  const ref = useReveal<HTMLElement>();
  const { user } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<{ rank: number; best_score: number } | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(10, user?.id);
      setPlayers(data.leaderboard);
      if (data.user_rank) setUserRank(data.user_rank);
    } catch {} finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  function getAvatar(name: string) { return name.charAt(0).toUpperCase(); }

  function formatTime(seconds: number | null) {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const top3 = players.filter(p => p.rank <= 3);
  const rest = players.filter(p => p.rank > 3);
  const podiumOrder = [
    top3.find(p => p.rank === 2),
    top3.find(p => p.rank === 1),
    top3.find(p => p.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[];

  const rankColors = ['', 'from-gold to-gold-dark', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'];

  return (
    <section ref={ref} id="classement" className="reveal surface-dark py-14 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-gold/70 text-xs font-semibold uppercase tracking-widest">Classement</span>
            <span className="inline-flex items-center gap-1.5 bg-red/20 text-red text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ animation: 'pulse-live 2s ease-in-out infinite' }}>
              <span className="w-1.5 h-1.5 bg-red rounded-full" />
              EN DIRECT
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">Classement des meilleurs joueurs</h2>
          <p className="text-white/40 text-sm">Mis à jour en temps réel</p>
        </div>

        {/* User rank badge */}
        {user && userRank && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 glass-card rounded-full px-5 py-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-xs font-bold text-primary-dark">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white/70 text-sm">Vous êtes <strong className="text-gold text-base">{userRank.rank}{userRank.rank === 1 ? 'er' : 'e'}</strong></span>
              <span className="w-px h-4 bg-white/15" />
              <span className="text-gold text-sm font-bold">{userRank.best_score} pts</span>
            </div>
          </div>
        )}

        {/* Podium */}
        {podiumOrder.length > 0 && (
          <div className="flex items-end justify-center gap-2 sm:gap-5 mb-10 px-2 sm:px-4">
            {podiumOrder.map(player => {
              const isFirst = player.rank === 1;
              const isCurrentUser = user && player.user_id === user.id;
              const podiumClass = player.rank === 1 ? 'podium-1' : player.rank === 2 ? 'podium-2' : 'podium-3';
              const height = isFirst ? 'h-24 sm:h-32' : player.rank === 2 ? 'h-16 sm:h-24' : 'h-12 sm:h-20';
              const avatarSize = isFirst ? 'w-14 h-14 sm:w-18 sm:h-18 text-lg sm:text-2xl' : 'w-10 h-10 sm:w-14 sm:h-14 text-sm sm:text-base';

              return (
                <div key={player.rank} className={`flex flex-col items-center ${podiumClass}`}>
                  <div className="relative mb-2">
                    <div className={`${avatarSize} rounded-full flex items-center justify-center font-bold ${
                      isFirst ? 'bg-gradient-to-br from-gold to-gold-dark text-primary-dark ring-4 ring-gold/25' :
                      `bg-gradient-to-br ${rankColors[player.rank]} text-white/90 ring-2 ring-white/15`
                    } ${isCurrentUser ? 'ring-gold ring-4' : ''}`}>
                      {getAvatar(player.name)}
                    </div>
                    {isFirst && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <svg className="w-6 h-6 text-gold drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" /></svg>
                      </div>
                    )}
                  </div>
                  <span className={`font-semibold text-white text-[11px] sm:text-sm text-center max-w-[70px] sm:max-w-[100px] truncate ${isFirst ? 'text-xs sm:text-base' : ''}`}>
                    {player.name.split(' ')[0]}
                  </span>
                  <span className={`font-bold mt-0.5 mb-2 ${isFirst ? 'text-gold text-base sm:text-xl' : 'text-white/60 text-xs sm:text-sm'}`}>
                    {player.total_points} <span className="text-[10px] opacity-50">pts</span>
                  </span>
                  <div className={`w-16 sm:w-24 ${height} rounded-t-xl ${
                    isFirst
                      ? 'bg-gradient-to-t from-gold/20 to-gold/5 border-t-2 border-x border-gold/30'
                      : 'bg-gradient-to-t from-white/8 to-white/3 border-t border-x border-white/10'
                  }`} />
                </div>
              );
            })}
          </div>
        )}

        {/* Rest of leaderboard */}
        {rest.length > 0 && (
          <div className="space-y-1.5">
            {rest.map(player => {
              const isCurrentUser = user && player.user_id === user.id;
              return (
                <div key={player.rank + player.name}
                  className={`flex items-center gap-3 sm:gap-4 rounded-xl px-4 py-3 transition-all glass-card ${isCurrentUser ? 'ring-1 ring-gold/40 bg-gold/[0.04]' : ''} hover:bg-white/[0.08]`}>
                  <div className="w-8 text-center shrink-0">
                    <span className="text-white/40 font-bold text-sm">{player.rank}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-white/8 text-white/60">
                    {getAvatar(player.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">{player.name}</span>
                      {isCurrentUser && <span className="bg-gold/20 text-gold text-[10px] font-bold px-1.5 py-0.5 rounded">Vous</span>}
                    </div>
                    {player.best_time !== null && (
                      <span className="text-white/30 text-xs">
                        <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {formatTime(player.best_time)}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-gold font-bold">{player.total_points}</span>
                    <span className="block text-white/30 text-[10px] uppercase tracking-wider">Points</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {players.length === 0 && !loading && (
          <div className="glass-card rounded-2xl text-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-white/50 text-sm mb-1 font-medium">Aucun participant pour le moment</p>
            <p className="text-white/30 text-xs">Le classement apparaîtra dès le début de la prochaine session.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-3" />
            <p className="text-white/40 text-sm">Chargement du classement...</p>
          </div>
        )}
      </div>
    </section>
  );
}
