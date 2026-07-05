'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { adminGetStats } from '@/lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    adminGetStats(user.id)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;
  }

  if (!stats) return <p className="text-gray-500 py-10 text-center">Erreur lors du chargement des statistiques.</p>;

  const cards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '\u{1F465}', color: 'bg-blue-50 text-blue-600' },
    { label: 'Questions', value: stats.totalQuestions, icon: '\u2753', color: 'bg-purple-50 text-purple-600' },
    { label: 'Sessions', value: stats.totalSessions, icon: '\u{1F3AE}', color: 'bg-green-50 text-green-600' },
    { label: 'Completees', value: stats.completedSessions, icon: '\u2705', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Score moyen', value: stats.averageScore, icon: '\u{1F4CA}', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
            <p className="text-2xl font-bold text-dark">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-dark mb-4">Utilisateurs recents</h3>
          {stats.recentUsers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">{u.full_name?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark truncate">{u.full_name}</p>
                    <p className="text-xs text-gray-400">{u.country_code} {u.phone}</p>
                  </div>
                  {u.role === 'admin' && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Admin</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucun utilisateur</p>
          )}
        </div>

        {/* Recent sessions */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-dark mb-4">Sessions recentes</h3>
          {stats.recentSessions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSessions.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-xs">&#x1F3AE;</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-400">{s.correct_answers}/{s.total_questions} - {s.total_points} pts</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(s.started_at).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune session</p>
          )}
        </div>
      </div>
    </div>
  );
}
