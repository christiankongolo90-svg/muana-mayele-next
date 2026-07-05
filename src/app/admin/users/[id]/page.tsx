'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { adminGetUser, adminUpdateUser } from '@/lib/api';

export default function AdminUserEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', country_code: '', profession: '', neighborhood: '', role: 'user' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    adminGetUser(user.id, userId)
      .then(data => {
        const u = data.user;
        setForm({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '', country_code: u.country_code || '', profession: u.profession || '', neighborhood: u.neighborhood || '', role: u.role || 'user' });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await adminUpdateUser(user.id, { id: userId, ...form });
      setSuccess('Utilisateur mis a jour!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push('/admin/users')} className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Retour a la liste</button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-dark mb-6">Modifier l&apos;utilisateur #{userId}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code pays</label>
              <input type="text" value={form.country_code} onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
              <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              <input type="text" value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
              <input type="text" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          {error && <p className="text-red text-sm bg-red-50 p-2.5 rounded">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 p-2.5 rounded">{success}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-primary text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder'}
            </button>
            <button type="button" onClick={() => router.push('/admin/users')} className="bg-gray-100 text-gray-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-200">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
