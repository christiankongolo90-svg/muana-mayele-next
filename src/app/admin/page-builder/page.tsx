'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import RegistrationForm from '@/components/RegistrationForm';
import HowItWorks from '@/components/HowItWorks';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';

interface PageSection {
  id: number;
  section_type: string;
  title: string;
  content: string;
  image_url: string;
  is_visible: boolean;
  sort_order: number;
  settings: Record<string, any>;
}

const LABELS: Record<string, string> = {
  hero: 'Hero / Bannière',
  text: 'Bloc de texte',
  image: 'Image',
  registration: 'Inscription',
  how_it_works: 'Comment ça marche',
  leaderboard: 'Classement',
};

const BUILT_IN = ['hero', 'registration', 'how_it_works', 'leaderboard'];

export default function PageEditorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageSection | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);

  const hdrs = useCallback((): Record<string, string> => ({
    'X-Admin-User-Id': String(user?.id || ''),
    'Content-Type': 'application/json',
  }), [user]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Data fetching ──
  const fetchSections = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/admin/page-sections', { headers: { 'X-Admin-User-Id': String(user.id) } });
      const data = await res.json();
      if (data.success) {
        const rows = (data.data.sections || []).map((s: any) => ({
          ...s, settings: typeof s.settings === 'string' ? JSON.parse(s.settings) : (s.settings || {}),
        }));
        setSections(rows.sort((a: PageSection, b: PageSection) => a.sort_order - b.sort_order));
      }
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  async function migrate() {
    if (!user) return;
    try {
      const res = await fetch('/api/admin/page-sections/migrate', { headers: { 'X-Admin-User-Id': String(user.id) } });
      const data = await res.json();
      if (data.success) { flash('Sections initialisées !'); fetchSections(); }
      else setError(data.error || 'Erreur');
    } catch { setError('Erreur de migration'); }
  }

  // ── CRUD ──
  async function saveSection(s: PageSection) {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/page-sections/update', {
        method: 'PUT', headers: hdrs(),
        body: JSON.stringify({ id: s.id, title: s.title, content: s.content, image_url: s.image_url, settings: s.settings, is_visible: s.is_visible }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(prev => prev.map(x => x.id === s.id ? s : x));
        setEditing(null);
        flash('Enregistré !');
      } else setError(data.error || 'Erreur');
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  }

  async function toggleVis(section: PageSection) {
    if (!user) return;
    const next = !section.is_visible;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_visible: next } : s));
    try {
      await fetch('/api/admin/page-sections/update', {
        method: 'PUT', headers: hdrs(),
        body: JSON.stringify({ id: section.id, is_visible: next }),
      });
    } catch { fetchSections(); }
  }

  async function deleteSec(id: number) {
    if (!user || !confirm('Supprimer cette section ?')) return;
    try {
      const res = await fetch('/api/admin/page-sections/delete', {
        method: 'DELETE', headers: hdrs(), body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) { setSections(prev => prev.filter(s => s.id !== id)); flash('Supprimé'); }
      else setError(data.error || 'Erreur');
    } catch (e: any) { setError(e.message); }
  }

  async function addSection(type: 'text' | 'image') {
    if (!user) return;
    setAddOpen(false);
    try {
      const res = await fetch('/api/admin/page-sections/create', {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({
          section_type: type,
          title: type === 'text' ? 'Nouveau texte' : 'Nouvelle image',
          content: '', settings: type === 'text' ? { bgColor: 'transparent' } : { imageWidth: 500 },
          sort_order: sections.length,
        }),
      });
      const data = await res.json();
      if (data.success) { fetchSections(); flash('Section ajoutée !'); }
      else setError(data.error || 'Erreur');
    } catch (e: any) { setError(e.message); }
  }

  // ── Reorder ──
  const heroSec = sections.find(s => s.section_type === 'hero');
  const others = sections.filter(s => s.section_type !== 'hero');

  async function reorder(newOthers: PageSection[]) {
    const all = heroSec ? [heroSec, ...newOthers] : newOthers;
    setSections(all.map((s, i) => ({ ...s, sort_order: i })));
    try {
      await fetch('/api/admin/page-sections/reorder', {
        method: 'PUT', headers: hdrs(),
        body: JSON.stringify({ order: all.map(s => s.id) }),
      });
    } catch { fetchSections(); }
  }

  function move(idx: number, dir: 'up' | 'down') {
    const ni = dir === 'up' ? idx - 1 : idx + 1;
    if (ni < 0 || ni >= others.length) return;
    const arr = [...others];
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    reorder(arr);
  }

  function handleDrop(dropIdx: number) {
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    const arr = [...others];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(dropIdx, 0, moved);
    setDragIdx(null); setOverIdx(null);
    reorder(arr);
  }

  // ── Upload ──
  function triggerUpload(id: number) { setUploadId(id); fileRef.current?.click(); }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !uploadId) return;
    const fd = new FormData();
    fd.append('image', file);
    fd.append('section_id', String(uploadId));
    try {
      const res = await fetch('/api/admin/page-sections/upload', {
        method: 'POST', headers: { 'X-Admin-User-Id': String(user.id) }, body: fd,
      });
      const data = await res.json();
      if (data.success) {
        const url = data.data?.url || data.data?.section?.image_url || '';
        setSections(prev => prev.map(s => s.id === uploadId ? { ...s, image_url: url } : s));
        if (editing?.id === uploadId) setEditing(prev => prev ? { ...prev, image_url: url } : null);
        flash('Image uploadée !');
      } else setError(data.error || 'Erreur');
    } catch (e: any) { setError(e.message); }
    setUploadId(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── Live preview: merge editing changes into display ──
  const display = sections.map(s => editing && s.id === editing.id ? editing : s);
  const displayHero = display.find(s => s.section_type === 'hero');
  const displayOthers = display.filter(s => s.section_type !== 'hero');

  // ── Render section content ──
  function renderContent(section: PageSection) {
    if (!section.is_visible) {
      return (
        <div className="py-20 flex items-center justify-center">
          <span className="text-white/20 text-sm italic">Section masquée</span>
        </div>
      );
    }
    switch (section.section_type) {
      case 'hero':
        return <Hero heroImageSize={section.settings?.heroImageSize} />;
      case 'registration':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center mb-12">
              <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-2">Rejoignez la comp&eacute;tition</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Inscrivez-vous et jouez</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <RegistrationForm />
              <div className="lg:sticky lg:top-24"><HowItWorks /></div>
            </div>
          </div>
        );
      case 'how_it_works':
        return (
          <div className="py-10 flex items-center justify-center">
            <span className="text-white/30 text-xs italic">Affich&eacute; avec la section Inscription</span>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Leaderboard />
          </div>
        );
      case 'text': {
        const bg = section.settings?.bgColor || 'transparent';
        const color = section.settings?.textColor || '#ffffff';
        return (
          <div style={{ backgroundColor: bg }} className="py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {section.title && <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color }}>{section.title}</h2>}
              {section.content ? (
                <div className="prose prose-lg max-w-none text-center leading-relaxed" style={{ color: color + 'cc' }}
                  dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-center text-white/25 italic text-sm">Cliquez sur &laquo; Modifier &raquo; pour ajouter du contenu</p>
              )}
            </div>
          </div>
        );
      }
      case 'image': {
        const w = section.settings?.imageWidth || 500;
        return (
          <div style={{ backgroundColor: section.settings?.bgColor || 'transparent' }} className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {section.title && <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-white">{section.title}</h2>}
              <div className="flex justify-center">
                {section.image_url ? (
                  <img src={section.image_url} alt={section.title || ''} style={{ maxWidth: `${w}px`, width: '100%' }} className="rounded-2xl shadow-2xl h-auto" />
                ) : (
                  <div className="border-2 border-dashed border-white/15 rounded-2xl flex items-center justify-center" style={{ width: `${w}px`, height: 200 }}>
                    <span className="text-white/25 text-sm">Aucune image</span>
                  </div>
                )}
              </div>
              {section.content && <p className="text-white/60 text-center mt-6 max-w-2xl mx-auto text-sm">{section.content}</p>}
            </div>
          </div>
        );
      }
      default: return null;
    }
  }

  // ── Section overlay ──
  function Overlay({ section, index, canDrag }: { section: PageSection; index: number; canDrag: boolean }) {
    const isEditable = !BUILT_IN.includes(section.section_type) || section.section_type === 'hero';
    const canDelete = !BUILT_IN.includes(section.section_type);

    return (
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
        <div className="absolute inset-x-2 sm:inset-x-4 inset-y-0 ring-2 ring-inset ring-blue-500/50 rounded-xl" />

        {/* Label / drag handle */}
        <div className="absolute top-3 left-4 sm:left-8 pointer-events-auto"
          draggable={canDrag}
          onDragStart={canDrag ? (e) => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(index); } : undefined}
          onDragEnd={canDrag ? () => { setDragIdx(null); setOverIdx(null); } : undefined}
        >
          <span className={`bg-blue-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xl inline-flex items-center gap-1.5 select-none ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            {canDrag && (
              <svg className="w-3 h-3 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="7" cy="4" r="1.5"/><circle cx="13" cy="4" r="1.5"/>
                <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
                <circle cx="7" cy="16" r="1.5"/><circle cx="13" cy="16" r="1.5"/>
              </svg>
            )}
            {LABELS[section.section_type] || section.section_type}
          </span>
        </div>

        {/* Buttons */}
        <div className="absolute top-3 right-4 sm:right-8 pointer-events-auto flex items-center gap-0.5 bg-white rounded-xl shadow-2xl p-1">
          {canDrag && (
            <>
              <Btn title="Monter" disabled={index === 0} onClick={() => move(index, 'up')}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </Btn>
              <Btn title="Descendre" disabled={index === others.length - 1} onClick={() => move(index, 'down')}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </Btn>
              <Sep />
            </>
          )}
          <Btn title={section.is_visible ? 'Masquer' : 'Afficher'} active={section.is_visible} onClick={() => toggleVis(section)}>
            {section.is_visible ? (
              <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"/>
            )}
          </Btn>
          {isEditable && (
            <Btn title="Modifier" onClick={() => setEditing({ ...section, settings: { ...section.settings } })}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </Btn>
          )}
          {canDelete && (
            <>
              <Sep />
              <Btn title="Supprimer" danger onClick={() => deleteSec(section.id)}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </Btn>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#000d2b] flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  // ── Empty / migration state ──
  if (sections.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#000d2b] flex items-center justify-center">
        <div className="text-center text-white max-w-sm">
          <div className="text-5xl mb-4">🏗️</div>
          <h2 className="text-xl font-bold mb-3">Initialiser les sections</h2>
          <p className="text-white/50 text-sm mb-6">Cr&eacute;ez les sections par d&eacute;faut pour commencer &agrave; construire votre page d&apos;accueil.</p>
          <button onClick={migrate} className="btn-cta px-8 py-3 rounded-full font-bold text-primary-dark">Initialiser</button>
          <div className="mt-6">
            <button onClick={() => router.push('/admin/dashboard')} className="text-white/30 text-sm hover:text-white/60 transition-colors">&larr; Retour</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main editor ──
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#000d2b]">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* ═══ TOOLBAR ═══ */}
      <div className="h-12 bg-[#0a1628]/95 backdrop-blur-xl border-b border-white/10 flex items-center px-3 sm:px-5 gap-3 shrink-0 z-30">
        <button onClick={() => router.push('/admin/dashboard')} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors" title="Retour">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div className="w-px h-5 bg-white/10 hidden sm:block" />
        <span className="text-white font-semibold text-sm hidden sm:block">&Eacute;diteur de page</span>
        <div className="flex-1" />

        <div className="relative">
          <button onClick={() => setAddOpen(!addOpen)} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6"/></svg>
            <span className="hidden sm:inline">Ajouter</span>
          </button>
          {addOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAddOpen(false)} />
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl p-1.5 min-w-[180px] z-50">
                <button onClick={() => addSection('text')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span>📝</span> Bloc de texte
                </button>
                <button onClick={() => addSection('image')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span>🖼️</span> Image
                </button>
              </div>
            </>
          )}
        </div>

        <a href="/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white text-xs sm:text-sm transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          <span className="hidden sm:inline">Aper&ccedil;u</span>
        </a>
      </div>

      {/* ═══ PREVIEW ═══ */}
      <div className="flex-1 overflow-y-auto">
        {/* Header (dimmed, non-interactive) */}
        <div className="pointer-events-none select-none opacity-50"><Header /></div>

        {/* Hero section (always first, not draggable) */}
        {displayHero && (
          <div className="relative group">
            <div className="pointer-events-none select-none">{renderContent(displayHero)}</div>
            <Overlay section={displayHero} index={-1} canDrag={false} />
          </div>
        )}

        {/* Other sections inside dark gradient */}
        <div className="relative" style={{ background: 'linear-gradient(180deg, #001f52 0%, #001440 50%, #000d2b 100%)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.04) 0%, transparent 60%)' }} />
            <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,56,147,0.15) 0%, transparent 60%)' }} />
          </div>

          <div className="relative z-10">
            {displayOthers.map((section, idx) => (
              <div key={section.id}>
                {/* Drop indicator */}
                {overIdx === idx && dragIdx !== null && dragIdx !== idx && (
                  <div className="h-1 bg-blue-500 mx-6 sm:mx-10 rounded-full shadow-[0_0_16px_rgba(59,130,246,0.6)]" />
                )}

                <div
                  className={`relative group transition-all duration-200 ${dragIdx === idx ? 'opacity-30 scale-[0.98]' : ''} ${!section.is_visible ? 'opacity-40' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverIdx(idx); }}
                  onDragLeave={() => setOverIdx(null)}
                  onDrop={(e) => { e.preventDefault(); handleDrop(idx); }}
                >
                  <div className="pointer-events-none select-none">{renderContent(section)}</div>
                  <Overlay section={section} index={idx} canDrag={true} />
                </div>
              </div>
            ))}

            {/* Drop zone at end */}
            <div
              className="py-8 flex justify-center"
              onDragOver={(e) => { e.preventDefault(); setOverIdx(others.length); }}
              onDragLeave={() => setOverIdx(null)}
              onDrop={(e) => { e.preventDefault(); handleDrop(others.length); }}
            >
              {overIdx === others.length && dragIdx !== null ? (
                <div className="h-1 bg-blue-500 w-full mx-10 rounded-full shadow-[0_0_16px_rgba(59,130,246,0.6)]" />
              ) : (
                <button onClick={() => setAddOpen(true)}
                  className="border-2 border-dashed border-white/10 rounded-xl px-8 py-4 text-white/20 hover:text-white/50 hover:border-white/25 transition-colors text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6"/></svg>
                  Ajouter une section
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer (dimmed, non-interactive) */}
        <div className="pointer-events-none select-none opacity-50"><Footer /></div>
      </div>

      {/* ═══ EDIT PANEL ═══ */}
      {editing && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="fixed top-0 right-0 bottom-0 w-[420px] max-w-[92vw] bg-white z-50 shadow-2xl overflow-y-auto"
            style={{ animation: 'panelSlideIn 0.25s ease' }}>
            <EditPanel
              section={editing}
              onChange={setEditing}
              onSave={saveSection}
              onClose={() => setEditing(null)}
              onUpload={triggerUpload}
              saving={saving}
            />
          </div>
        </>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl"
          style={{ animation: 'toastUp 0.3s ease' }}>
          {toast}
        </div>
      )}

      {/* ═══ ERROR ═══ */}
      {error && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm shadow-xl max-w-md flex items-center gap-3">
          {error}
          <button onClick={() => setError('')} className="font-bold text-lg leading-none">&times;</button>
        </div>
      )}
    </div>
  );
}

// ── Small UI helpers ──
function Btn({ children, onClick, title, disabled, active, danger }: {
  children: React.ReactNode; onClick: () => void; title: string;
  disabled?: boolean; active?: boolean; danger?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`p-2 rounded-lg transition-colors disabled:opacity-25 ${
        danger ? 'text-gray-400 hover:bg-red-50 hover:text-red-500' :
        active ? 'text-blue-600 hover:bg-blue-50' :
        'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{children}</svg>
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

// ── Edit Panel ──
function EditPanel({ section, onChange, onSave, onClose, onUpload, saving }: {
  section: PageSection; onChange: (s: PageSection) => void;
  onSave: (s: PageSection) => void; onClose: () => void;
  onUpload: (id: number) => void; saving: boolean;
}) {
  const set = (k: Partial<PageSection>) => onChange({ ...section, ...k });
  const setOpt = (k: string, v: any) => onChange({ ...section, settings: { ...section.settings, [k]: v } });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
        <h3 className="font-bold text-gray-900">{LABELS[section.section_type] || section.section_type}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {section.section_type === 'hero' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Taille de l&apos;image hero
            </label>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-center text-2xl font-bold text-blue-700 mb-3">{section.settings.heroImageSize || 440}px</div>
              <input type="range" min={300} max={700} value={section.settings.heroImageSize || 440}
                onChange={(e) => setOpt('heroImageSize', Number(e.target.value))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-[11px] text-gray-400 mt-2"><span>300px</span><span>700px</span></div>
            </div>
          </div>
        )}

        {section.section_type === 'text' && (
          <>
            <Field label="Titre">
              <input type="text" value={section.title || ''} onChange={(e) => set({ title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </Field>
            <Field label="Contenu">
              <textarea value={section.content || ''} onChange={(e) => set({ content: e.target.value })} rows={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y" />
            </Field>
            <Field label="Couleur de fond">
              <div className="flex items-center gap-3">
                <input type="color" value={section.settings.bgColor === 'transparent' ? '#001f52' : (section.settings.bgColor || '#001f52')}
                  onChange={(e) => setOpt('bgColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <span className="text-sm text-gray-500 flex-1">{section.settings.bgColor || 'transparent'}</span>
                <button onClick={() => setOpt('bgColor', 'transparent')} className="text-xs text-blue-600 hover:underline">Transparent</button>
              </div>
            </Field>
          </>
        )}

        {section.section_type === 'image' && (
          <>
            <Field label="Titre (optionnel)">
              <input type="text" value={section.title || ''} onChange={(e) => set({ title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Titre au-dessus de l'image" />
            </Field>
            <Field label="L&eacute;gende (optionnel)">
              <input type="text" value={section.content || ''} onChange={(e) => set({ content: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Texte sous l'image" />
            </Field>
            <Field label="Image">
              <button onClick={() => onUpload(section.id)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl px-4 py-3 text-sm font-medium transition-colors border border-blue-200 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Uploader une image
              </button>
              {section.image_url && (
                <img src={section.image_url} alt="" className="mt-3 rounded-xl shadow-sm w-full h-32 object-cover" />
              )}
            </Field>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Largeur de l&apos;image</label>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-center text-xl font-bold text-gray-700 mb-3">{section.settings.imageWidth || 500}px</div>
                <input type="range" min={200} max={1000} value={section.settings.imageWidth || 500}
                  onChange={(e) => setOpt('imageWidth', Number(e.target.value))}
                  className="w-full accent-blue-600" />
                <div className="flex justify-between text-[11px] text-gray-400 mt-2"><span>200px</span><span>1000px</span></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-100 shrink-0 flex gap-3">
        <button onClick={() => onSave(section)} disabled={saving}
          className="flex-1 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          Annuler
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
