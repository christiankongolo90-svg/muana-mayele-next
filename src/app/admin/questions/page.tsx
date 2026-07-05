'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { adminGetQuestions, adminGetCategories, adminDeleteQuestion } from '@/lib/api';

export default function AdminQuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [qData, cData] = await Promise.all([
        adminGetQuestions(user.id, { page, search, category_id: categoryFilter || undefined }),
        categories.length === 0 ? adminGetCategories(user.id) : Promise.resolve(null),
      ]);
      setQuestions(qData.questions);
      setPagination(qData.pagination);
      if (cData) setCategories(cData.categories);
    } catch {}
    finally { setLoading(false); }
  }, [user, page, search, categoryFilter, categories.length]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    if (!user || !confirm('Supprimer cette question ?')) return;
    try { await adminDeleteQuestion(user.id, id); load(); } catch (err: any) { alert(err.message); }
  }

  const difficultyLabel: Record<string, { text: string; cls: string }> = {
    easy: { text: 'Facile', cls: 'bg-green-100 text-green-700' },
    medium: { text: 'Moyen', cls: 'bg-yellow-100 text-yellow-700' },
    hard: { text: 'Difficile', cls: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher une question..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Toutes les categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Link href="/admin/questions/new" className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors text-center whitespace-nowrap">
          + Nouvelle question
        </Link>
      </div>

      <p className="text-xs text-gray-500">{pagination.total} question(s)</p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Question</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Categorie</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Difficulte</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Actif</th>
                <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center"><div className="spinner spinner-dark mx-auto" /></td></tr>
              ) : questions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucune question</td></tr>
              ) : (
                questions.map(q => (
                  <tr key={q.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{q.id}</td>
                    <td className="px-4 py-3 text-dark max-w-xs truncate">{q.question}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{q.category_name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyLabel[q.difficulty]?.cls || 'bg-gray-100'}`}>
                        {difficultyLabel[q.difficulty]?.text || q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {q.is_active ? <span className="text-green-500">&#x2713;</span> : <span className="text-gray-300">&#x2717;</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/questions/${q.id}`} className="text-primary hover:underline text-xs font-medium">Modifier</Link>
                        <button onClick={() => handleDelete(q.id)} className="text-red hover:underline text-xs font-medium">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))
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
