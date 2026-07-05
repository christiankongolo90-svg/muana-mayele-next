'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/api';

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await adminGetCategories(user.id);
      setCategories(data.categories);
    } catch {}
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditId(null); setFormName(''); setFormDesc(''); setError(''); setShowForm(true);
  }

  function openEdit(cat: any) {
    setEditId(cat.id); setFormName(cat.name); setFormDesc(cat.description || ''); setError(''); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !formName.trim()) { setError('Le nom est obligatoire'); return; }
    setSaving(true); setError('');
    try {
      if (editId) {
        await adminUpdateCategory(user.id, { id: editId, name: formName, description: formDesc });
      } else {
        await adminCreateCategory(user.id, { name: formName, description: formDesc });
      }
      setShowForm(false);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number, questionCount: number) {
    if (questionCount > 0) {
      alert(`Impossible de supprimer cette catégorie car elle contient ${questionCount} question(s). Supprimez d'abord les questions.`);
      return;
    }
    if (!user || !confirm('Supprimer cette catégorie ?')) return;
    try { await adminDeleteCategory(user.id, id); load(); } catch (err: any) { alert(err.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{categories.length} categorie(s)</p>
        <button onClick={openCreate} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors">
          + Nouvelle categorie
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark mb-4">{editId ? 'Modifier la categorie' : 'Nouvelle categorie'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none" />
              </div>
              {error && <p className="text-red text-sm bg-red-50 p-2 rounded">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 rounded-lg px-5 py-2 text-sm">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg">&#x1F4C1;</div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="text-xs text-primary hover:underline">Modifier</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleDelete(cat.id, Number(cat.question_count || 0))} className={`text-xs hover:underline ${Number(cat.question_count || 0) > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red'}`}>Supprimer</button>
                </div>
              </div>
              <h4 className="font-semibold text-dark mb-1">{cat.name}</h4>
              {cat.description && <p className="text-xs text-gray-500 mb-2">{cat.description}</p>}
              <p className="text-xs text-gray-400">{Number(cat.question_count || 0)} question(s)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
