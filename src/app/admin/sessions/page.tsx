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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Date :</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">{dateFilter ? '#' : 'ID'}</th>
                <th className="px-4 py-3 font-medium text-gray-600">Joueur</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Score</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Resultats</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Date</th>
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
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-primary font-bold">{points}</span>
                        <span className="text-gray-400 text-xs ml-1">pts</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                        {correct}/{s.total_questions || answered}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {s.is_completed ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Complete</span>
                        ) : isLive ? (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium animate-pulse">En cours</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Commence</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{formatDate(s.started_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/sessions/${s.id}`} className="text-primary hover:underline text-xs font-medium">Details</Link>
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
