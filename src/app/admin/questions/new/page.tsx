'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { adminCreateQuestion, adminGetCategories } from '@/lib/api';

export default function AdminNewQuestionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    category_id: '', question: '', options: ['', '', '', ''], correct_answer: 0, difficulty: 'medium', is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    adminGetCategories(user.id).then(d => setCategories(d.categories)).catch(() => {});
  }, [user]);

  function setOption(i: number, value: string) {
    setForm(f => {
      const opts = [...f.options];
      opts[i] = value;
      return { ...f, options: opts };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.category_id || !form.question.trim() || form.options.some(o => !o.trim())) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    setSaving(true); setError('');
    try {
      await adminCreateQuestion(user.id, {
        category_id: Number(form.category_id),
        question: form.question,
        options: form.options,
        correct_answer: form.correct_answer,
        difficulty: form.difficulty,
        is_active: form.is_active,
      });
      router.push('/admin/questions');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push('/admin/questions')} className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Retour a la liste</button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-dark mb-6">Nouvelle question</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" required>
                <option value="">-- Choisir --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulte</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none" required />
          </div>
          {form.options.map((opt, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option {['A', 'B', 'C', 'D'][i]}
                {form.correct_answer === i && <span className="text-green-500 ml-2">(Bonne reponse)</span>}
              </label>
              <div className="flex gap-2">
                <input type="text" value={opt} onChange={e => setOption(i, e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
                <button type="button" onClick={() => setForm(f => ({ ...f, correct_answer: i }))} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${form.correct_answer === i ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}>
                  &#x2713;
                </button>
              </div>
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          {error && <p className="text-red text-sm bg-red-50 p-2.5 rounded">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-primary text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <><span className="spinner" /> Creation...</> : 'Creer la question'}
            </button>
            <button type="button" onClick={() => router.push('/admin/questions')} className="bg-gray-100 text-gray-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-200">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
