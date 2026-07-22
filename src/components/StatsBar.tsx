'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '@/lib/useReveal';

interface Stats { questions: number; players: number; sessions: number }

export default function StatsBar() {
  const ref = useReveal<HTMLElement>();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { 'X-Admin-User-Id': '1' } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setStats({
            questions: d.data.total_questions || 0,
            players: d.data.total_users || 0,
            sessions: d.data.total_sessions || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const items = [
    { value: stats ? `${stats.questions}+` : '—', label: 'Questions disponibles', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    )},
    { value: stats ? `${stats.players}+` : '—', label: 'Joueurs inscrits', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    )},
    { value: stats ? `${stats.sessions}+` : '—', label: 'Sessions organisées', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    )},
    { value: '50 $', label: 'Récompenses par session', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    )},
  ];

  return (
    <section ref={ref} className="reveal surface-stats py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3 sm:gap-4" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{item.icon}</svg>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-white tabular-nums">{item.value}</span>
                <span className="block text-white/40 text-xs sm:text-sm">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
