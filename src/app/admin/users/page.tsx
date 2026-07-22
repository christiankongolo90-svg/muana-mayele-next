'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { adminGetUsers, adminDeleteUser } from '@/lib/api';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await adminGetUsers(user.id, { page, search, limit: 20 });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [user, page, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function handleDelete(id: number) {
    if (!user || !confirm('Supprimer cet utilisateur ?')) return;
    try {
      await adminDeleteUser(user.id, id);
      loadUsers();
    } catch (err: any) { alert(err.message); }
  }

  const [exporting, setExporting] = useState(false);

  async function exportCSV() {
    if (!user) return;
    setExporting(true);
    try {
      // Fetch ALL users across all pages
      const allUsers: any[] = [];
      let p = 1, totalPages = 1;
      do {
        const data = await adminGetUsers(user.id, { page: p, limit: 100, search: '' });
        allUsers.push(...data.users);
        totalPages = data.pagination.pages;
        p++;
      } while (p <= totalPages);

      const BOM = '\uFEFF';
      const headers = ['ID', 'Nom', 'Code Pays', 'Téléphone', 'Email', 'Profession', 'Quartier/Ville', 'Rôle', "Date d'inscription"];
      const rows = allUsers.map((u, i) => [
        i + 1, `"${(u.full_name || '').replace(/"/g, '""')}"`, `"${u.country_code || ''}"`,
        `"${u.phone || ''}"`, `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.profession || '').replace(/"/g, '""')}"`, `"${(u.neighborhood || '').replace(/"/g, '""')}"`,
        u.role || 'user', `"${u.created_at || ''}"`
      ]);
      const csv = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `utilisateurs_muana_mayele_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { alert("Erreur lors de l'exportation"); }
    finally { setExporting(false); }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher par nom, email ou telephone..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
        </div>
        <button onClick={exportCSV} disabled={exporting} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap disabled:opacity-50">
          {exporting ? 'Exportation...' : '📥 Exporter Excel'}
        </button>
      </div>

      <p className="text-xs text-gray-500">{pagination.total} utilisateur(s) au total</p>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Nom</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Telephone</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Quartier</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Role</th>
                <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400"><div className="spinner spinner-dark mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun utilisateur trouve</td></tr>
              ) : (
                users.map((u, index) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{(page - 1) * 20 + index + 1}</td>
                    <td className="px-4 py-3 font-medium text-dark">
                      {u.full_name}
                      {u.email && <span className="block text-xs text-gray-400">{u.email}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.country_code} {u.phone}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u.neighborhood || '-'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/users/${u.id}`} className="text-primary hover:underline text-xs font-medium">Modifier</Link>
                        <button onClick={() => handleDelete(u.id)} className="text-red hover:underline text-xs font-medium">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
