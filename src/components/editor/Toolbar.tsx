'use client';

import { useEditor } from '@/lib/editor/context';
import Link from 'next/link';

export default function EditorToolbar() {
  const {
    viewport, setViewport, isDirty, isSaving, isPublishing, lastSaved,
    undo, redo, canUndo, canRedo, save, publish,
  } = useEditor();

  return (
    <div className="h-12 bg-[#0f0f23] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
      {/* Left: back + page name */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-white/50 hover:text-white transition-colors" title="Retour">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-white font-semibold text-sm">Éditeur de page</span>
        {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400" title="Modifications non enregistrées" />}
      </div>

      {/* Center: viewport toggle */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
        <VpBtn active={viewport === 'desktop'} onClick={() => setViewport('desktop')} label="Desktop">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </VpBtn>
        <VpBtn active={viewport === 'tablet'} onClick={() => setViewport('tablet')} label="Tablette">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </VpBtn>
        <VpBtn active={viewport === 'mobile'} onClick={() => setViewport('mobile')} label="Mobile">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </VpBtn>
      </div>

      {/* Right: undo/redo + save + publish */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 mr-2">
          <button onClick={undo} disabled={!canUndo} title="Annuler (Ctrl+Z)"
            className="text-white/50 hover:text-white p-1.5 rounded disabled:opacity-20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button onClick={redo} disabled={!canRedo} title="Rétablir (Ctrl+Y)"
            className="text-white/50 hover:text-white p-1.5 rounded disabled:opacity-20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        {lastSaved && <span className="text-white/30 text-xs mr-1">{lastSaved}</span>}

        <button onClick={save} disabled={isSaving || !isDirty}
          className="text-sm px-3.5 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40 bg-white/10 text-white hover:bg-white/20">
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button onClick={publish} disabled={isPublishing}
          className="text-sm px-3.5 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40 bg-blue-600 text-white hover:bg-blue-500">
          {isPublishing ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </div>
  );
}

function VpBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{children}</svg>
    </button>
  );
}
