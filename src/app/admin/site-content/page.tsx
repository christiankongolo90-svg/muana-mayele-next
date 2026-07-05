'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { adminGetSiteContent, adminUpdateSiteContent, adminUploadImage } from '@/lib/api';

export default function AdminSiteContentPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    adminGetSiteContent(user.id)
      .then(data => setContent(data.content))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  function updateValue(id: number, value: string) {
    setEditedValues(prev => ({ ...prev, [id]: value }));
  }

  function getDisplayValue(item: any) {
    return editedValues[item.id] !== undefined ? editedValues[item.id] : item.content_value || '';
  }

  async function handleSave() {
    if (!user) return;
    const items = Object.entries(editedValues).map(([id, value]) => ({ id: Number(id), value }));
    if (items.length === 0) { setError('Aucune modification'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = await adminUpdateSiteContent(user.id, items);
      setContent(data.content);
      setEditedValues({});
      setSuccess(`${data.updated} element(s) mis a jour!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  function triggerUpload(id: number) {
    setUploadTargetId(id);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !uploadTargetId) return;
    setUploading(uploadTargetId); setError('');
    try {
      const data = await adminUploadImage(user.id, uploadTargetId, file);
      setContent(prev => prev.map(c => c.id === uploadTargetId ? { ...c, content_value: data.path } : c));
      setSuccess('Image uploadee!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setUploading(null); setUploadTargetId(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  }

  // Group by section
  const sections = content.reduce<Record<string, any[]>>((acc, item) => {
    const key = item.section || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const hasChanges = Object.keys(editedValues).length > 0;

  if (loading) return <div className="flex justify-center py-20"><div className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {Object.entries(sections).map(([section, items]) => (
        <div key={section} className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-dark mb-4 capitalize flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {section.replace(/_/g, ' ')}
          </h3>
          <div className="space-y-4">
            {items.map(item => {
              const isImage = item.content_key?.includes('image') || item.content_type === 'image';

              return (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {item.content_key?.replace(/_/g, ' ')}
                    {item.content_type && <span className="text-gray-300 ml-2">({item.content_type})</span>}
                  </label>
                  {isImage ? (
                    <div className="flex items-center gap-3">
                      {item.content_value && (
                        <img src={item.content_value} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                      )}
                      <button onClick={() => triggerUpload(item.id)} disabled={uploading === item.id} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                        {uploading === item.id ? <><span className="spinner spinner-dark" style={{ width: 12, height: 12 }} /> Upload...</> : '\u{1F4F7} Changer l\'image'}
                      </button>
                    </div>
                  ) : item.content_type === 'textarea' || (item.content_value && item.content_value.length > 100) ? (
                    <textarea value={getDisplayValue(item)} onChange={e => updateValue(item.id, e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none" />
                  ) : (
                    <input type="text" value={getDisplayValue(item)} onChange={e => updateValue(item.id, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {error && <p className="text-red text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
      {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">{success}</p>}

      {hasChanges && (
        <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">{Object.keys(editedValues).length} modification(s) non sauvegardee(s)</span>
          <div className="flex gap-2">
            <button onClick={() => setEditedValues({})} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2">
              {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
