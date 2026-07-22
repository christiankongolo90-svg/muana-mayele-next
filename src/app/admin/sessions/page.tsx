'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { adminGetSessions, adminDeleteSession } from '@/lib/api';

export default function AdminSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await adminGetSessions(user.id, {
        page,
        limit: 20,
        date: dateFilter || undefined,
        sort: dateFilter ? 'points' : undefined,
      });
      setSessions(data.sessions);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [user, page, dateFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [dateFilter]);

  async function handleDelete(id: number) {
    if (!user || !confirm('Supprimer cette session ?')) return;
    try { await adminDeleteSession(user.id, id); load(); } catch (err: any) { alert(err.message); }
  }

  function formatDate(d: string) {
    try { return new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return d; }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Date :</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-w-0"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-red hover:underline font-medium"
            >
              Effacer
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {pagination.total} session(s) {dateFilter ? `le ${new Date(dateFilter + 'T00:00').toLocaleDateString('fr-FR')}` : 'au total'}
          {dateFilter && ' — triées par score'}
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">{dateFilter ? '#' : 'ID'}</th>
                <th className="px-4 py-3 font-medium text-gray-600">Joueur</th>
                <th className="px-4 py-3 font-medium text-gray-600">Score</th>
                <th className="px-4 py-3 font-medium text-gray-600">Résultats</th>
                <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center"><div className="spinner spinner-dark mx-auto" /></td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {dateFilter ? 'Aucune session pour cette date' : 'Aucune session'}
                </td></tr>
              ) : (
                sessions.map((s, index) => {
                  const answered = Number(s.live_answered || 0);
                  const correct = Number(s.live_correct || 0);
                  const points = Number(s.live_points || s.total_points || 0);
                  const isLive = !s.is_completed && answered > 0;
                  const rank = (page - 1) * 20 + index + 1;

                  return (
                    <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{dateFilter ? rank : s.id}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-dark">{s.full_name}</span>
                        <span className="block text-xs text-gray-400">{s.phone}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-primary font-bold">{points}</span>
                        <span className="text-gray-400 text-xs ml-1">pts</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {correct}/{s.total_questions || answered}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isCompleted={s.is_completed} isLive={isLive} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(s.started_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/sessions/${s.id}`} className="text-primary hover:underline text-xs font-medium">Détails</Link>
                          <button onClick={() => handleDelete(s.id)} className="text-red hover:underline text-xs font-medium">Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm"><div className="spinner spinner-dark mx-auto" /></div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
            {dateFilter ? 'Aucune session pour cette date' : 'Aucune session'}
          </div>
        ) : (
          sessions.map((s, index) => {
            const answered = Number(s.live_answered || 0);
            const correct = Number(s.live_correct || 0);
            const points = Number(s.live_points || s.total_points || 0);
            const isLive = !s.is_completed && answered > 0;
            const rank = (page - 1) * 20 + index + 1;

            return (
              <div key={s.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {dateFilter ? rank : s.id}
                    </span>
                    <div>
                      <span className="font-semibold text-dark text-sm block">{s.full_name}</span>
                      <span className="text-xs text-gray-400">{s.phone}</span>
                    </div>
                  </div>
                  <StatusBadge isCompleted={s.is_completed} isLive={isLive} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <span className="block text-primary font-bold text-base">{points}</span>
                    <span className="block text-[10px] text-gray-400 uppercase">Points</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <span className="block text-dark font-bold text-base">{correct}/{s.total_questions || answered}</span>
                    <span className="block text-[10px] text-gray-400 uppercase">Résultats</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <span className="block text-dark font-medium text-xs leading-tight">{formatDate(s.started_at)}</span>
                    <span className="block text-[10px] text-gray-400 uppercase mt-0.5">Date</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <Link href={`/admin/sessions/${s.id}`} className="text-primary hover:underline text-xs font-medium">Détails</Link>
                  <button onClick={() => handleDelete(s.id)} className="text-red hover:underline text-xs font-medium">Supprimer</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50">&larr;</button>
          <span className="text-sm text-gray-600">Page {page} / {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50">&rarr;</button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ isCompleted, isLive }: { isCompleted: boolean; isLive: boolean }) {
  if (isCompleted) return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Complète</span>;
  if (isLive) return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium animate-pulse">En cours</span>;
  return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Commencé</span>;
}
