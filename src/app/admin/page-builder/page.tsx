'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';

interface SectionSettings {
  heroImageSize?: number;
  bgColor?: string;
  imageWidth?: number;
  [key: string]: any;
}

interface PageSection {
  id: number;
  section_type: string;
  title: string;
  content: string;
  image_url: string;
  is_visible: boolean;
  sort_order: number;
  settings: SectionSettings;
}

const SECTION_ICONS: Record<string, string> = {
  hero: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  text: 'M4 6h16M4 12h16M4 18h7',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  registration: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  how_it_works: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  leaderboard: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero / Banniere',
  text: 'Bloc de texte',
  image: 'Image',
  registration: 'Inscription',
  how_it_works: 'Comment ca marche',
  leaderboard: 'Classement',
};

const BUILT_IN_TYPES = ['hero', 'registration', 'how_it_works', 'leaderboard'];

export default function AdminPageBuilderPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);

  const getHeaders = useCallback((): Record<string, string> => {
    if (!user) return { 'Content-Type': 'application/json' };
    return { 'X-Admin-User-Id': String(user.id), 'Content-Type': 'application/json' };
  }, [user]);

  const fetchSections = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/admin/page-sections', {
        headers: { 'X-Admin-User-Id': String(user.id) },
      });
      const data = await res.json();
      if (data.success) {
        const rows = (data.data.sections || []).map((s: any) => ({
          ...s,
          settings: typeof s.settings === 'string' ? JSON.parse(s.settings) : (s.settings || {}),
        }));
        setSections(rows.sort((a: PageSection, b: PageSection) => a.sort_order - b.sort_order));
      } else {
        setError(data.error || 'Erreur de chargement');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  async function toggleVisibility(section: PageSection) {
    if (!user) return;
    try {
      const res = await fetch('/api/admin/page-sections/update', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id: section.id, is_visible: !section.is_visible }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_visible: !s.is_visible } : s));
      } else {
        setError(data.error || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function updateSection(section: PageSection) {
    if (!user) return;
    try {
      const res = await fetch('/api/admin/page-sections/update', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          id: section.id,
          title: section.title,
          content: section.content,
          image_url: section.image_url,
          settings: section.settings,
          is_visible: section.is_visible,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(prev => prev.map(s => s.id === section.id ? section : s));
        setEditingId(null);
        setSuccess('Section mise a jour!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteSection(id: number) {
    if (!user) return;
    if (!confirm('Supprimer cette section?')) return;
    try {
      const res = await fetch('/api/admin/page-sections/delete', {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(prev => prev.filter(s => s.id !== id));
        setSuccess('Section supprimee!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function addSection(type: 'text' | 'image') {
    if (!user) return;
    setShowAddMenu(false);
    try {
      const res = await fetch('/api/admin/page-sections/create', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          section_type: type,
          title: type === 'text' ? 'Nouveau bloc de texte' : 'Nouvelle image',
          content: '',
          settings: type === 'text' ? { bgColor: '#ffffff' } : { imageWidth: 400 },
          sort_order: sections.length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newSection = data.data.section;
        newSection.settings = typeof newSection.settings === 'string' ? JSON.parse(newSection.settings) : (newSection.settings || {});
        setSections(prev => [...prev, newSection]);
        setSuccess('Section ajoutee!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function reorderSections(newOrder: PageSection[]) {
    if (!user) return;
    setSections(newOrder.map((s, i) => ({ ...s, sort_order: i })));
    try {
      const res = await fetch('/api/admin/page-sections/reorder', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ order: newOrder.map(s => s.id) }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Erreur de reordonnancement');
        fetchSections();
      }
    } catch (err: any) {
      setError(err.message);
      fetchSections();
    }
  }

  function triggerUpload(sectionId: number) {
    setUploadTargetId(sectionId);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !uploadTargetId) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section_id', String(uploadTargetId));
    try {
      const res = await fetch('/api/admin/page-sections/upload', {
        method: 'POST',
        headers: { 'X-Admin-User-Id': String(user.id) },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const url = data.data?.url || data.data?.section?.image_url || '';
        setSections(prev =>
          prev.map(s => s.id === uploadTargetId ? { ...s, image_url: url } : s)
        );
        setSuccess('Image uploadee!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur upload');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    const newSections = [...sections];
    const [moved] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, moved);
    setDraggedIndex(null);
    reorderSections(newSections);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function SectionEditor({ section }: { section: PageSection }) {
    const [localSection, setLocalSection] = useState<PageSection>({ ...section, settings: { ...section.settings } });

    function updateLocal(updates: Partial<PageSection>) {
      setLocalSection(prev => ({ ...prev, ...updates }));
    }

    function updateSettings(updates: Partial<SectionSettings>) {
      setLocalSection(prev => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
      }));
    }

    return (
      <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
        {section.section_type === 'hero' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Taille de l&apos;image: {localSection.settings.heroImageSize || 440}px
            </label>
            <input
              type="range"
              min={300}
              max={700}
              value={localSection.settings.heroImageSize || 440}
              onChange={(e) => updateSettings({ heroImageSize: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>300px</span>
              <span>700px</span>
            </div>
          </div>
        )}

        {section.section_type === 'text' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Titre</label>
              <input
                type="text"
                value={localSection.title}
                onChange={(e) => updateLocal({ title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contenu</label>
              <textarea
                value={localSection.content || ''}
                onChange={(e) => updateLocal({ content: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Couleur de fond</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={localSection.settings.bgColor || '#ffffff'}
                  onChange={(e) => updateSettings({ bgColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-500">{localSection.settings.bgColor || '#ffffff'}</span>
              </div>
            </div>
          </>
        )}

        {section.section_type === 'image' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Titre</label>
              <input
                type="text"
                value={localSection.title}
                onChange={(e) => updateLocal({ title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Image</label>
              <button
                onClick={() => triggerUpload(section.id)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Uploader une image
              </button>
              {localSection.image_url && (
                <p className="mt-2 text-xs text-gray-400 break-all">{localSection.image_url}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Largeur: {localSection.settings.imageWidth || 400}px
              </label>
              <input
                type="range"
                min={200}
                max={800}
                value={localSection.settings.imageWidth || 400}
                onChange={(e) => updateSettings({ imageWidth: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>200px</span>
                <span>800px</span>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => updateSection(localSection)}
            className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Enregistrer
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">Constructeur de page</h1>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Voir le site
        </a>
      </div>

      {/* Messages */}
      {error && (
        <div className="text-red bg-red-50 p-3 rounded-xl text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">x</button>
        </div>
      )}
      {success && (
        <div className="text-green-600 bg-green-50 p-3 rounded-xl text-sm">{success}</div>
      )}

      {/* Sections list */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-xl shadow-sm p-4 transition-all ${
              draggedIndex === index ? 'opacity-50 scale-95' : ''
            } ${
              dragOverIndex === index && draggedIndex !== index
                ? 'ring-2 ring-primary ring-offset-2'
                : ''
            } ${!section.is_visible ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-3">
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="7" cy="4" r="1.5" />
                  <circle cx="13" cy="4" r="1.5" />
                  <circle cx="7" cy="10" r="1.5" />
                  <circle cx="13" cy="10" r="1.5" />
                  <circle cx="7" cy="16" r="1.5" />
                  <circle cx="13" cy="16" r="1.5" />
                </svg>
              </div>

              {/* Section icon */}
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={SECTION_ICONS[section.section_type] || SECTION_ICONS.text} />
                </svg>
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-dark truncate">
                  {section.title || SECTION_LABELS[section.section_type] || section.section_type}
                </h3>
                <p className="text-xs text-gray-400">{SECTION_LABELS[section.section_type] || section.section_type}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggleVisibility(section)}
                  className={`p-2 rounded-lg transition-colors ${
                    section.is_visible
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-gray-300 hover:bg-gray-100'
                  }`}
                  title={section.is_visible ? 'Masquer' : 'Afficher'}
                >
                  {section.is_visible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>

                {(!BUILT_IN_TYPES.includes(section.section_type) || section.section_type === 'hero') && (
                  <button
                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      editingId === section.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}

                {!BUILT_IN_TYPES.includes(section.section_type) && (
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Section preview */}
            <div className="mt-3 ml-11">
              {section.section_type === 'hero' && (
                <div className="text-xs text-gray-400">
                  Banniere principale - Taille image: {section.settings?.heroImageSize || 440}px
                </div>
              )}
              {section.section_type === 'text' && section.content && (
                <p className="text-xs text-gray-500 line-clamp-2">{section.content}</p>
              )}
              {section.section_type === 'image' && section.image_url && (
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{section.image_url}</span>
                  <span>- {section.settings?.imageWidth || 400}px</span>
                </div>
              )}
              {section.section_type === 'registration' && (
                <div className="text-xs text-gray-400">Formulaire d&apos;inscription</div>
              )}
              {section.section_type === 'how_it_works' && (
                <div className="text-xs text-gray-400">Explication du fonctionnement</div>
              )}
              {section.section_type === 'leaderboard' && (
                <div className="text-xs text-gray-400">Tableau des meilleurs scores</div>
              )}
            </div>

            {/* Inline editor */}
            {editingId === section.id && <SectionEditor section={section} />}
          </div>
        ))}
      </div>

      {/* Add section button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter une section
        </button>

        {showAddMenu && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[200px] z-10">
            <button
              onClick={() => addSection('text')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              Bloc de texte
            </button>
            <button
              onClick={() => addSection('image')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
