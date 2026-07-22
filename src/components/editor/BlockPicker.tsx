'use client';

import { useState } from 'react';
import { useEditor } from '@/lib/editor/context';
import type { BlockType } from '@/lib/editor/types';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'heading', label: 'Titre', icon: 'H' },
  { type: 'paragraph', label: 'Paragraphe', icon: '¶' },
  { type: 'image', label: 'Image', icon: '🖼' },
  { type: 'button', label: 'Bouton', icon: '▶' },
  { type: 'divider', label: 'Séparateur', icon: '—' },
  { type: 'spacer', label: 'Espace', icon: '↕' },
];

export default function BlockPicker() {
  const { selectedId, content, addBlock, addSection, getSelected } = useEditor();
  const [open, setOpen] = useState(false);

  const sel = getSelected();
  const sectionId = sel ? (sel.kind === 'section' ? sel.section.id : sel.section.id) : null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
      {open && (
        <div className="mb-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-3 min-w-[280px] animate-[toastUp_0.2s_ease-out]">
          {sectionId && (
            <>
              <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-2 px-1">Ajouter un bloc</p>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {BLOCK_TYPES.map(bt => (
                  <button key={bt.type}
                    onClick={() => { addBlock(sectionId, bt.type); setOpen(false); }}
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  >
                    <span className="text-lg">{bt.icon}</span>
                    <span className="text-[11px]">{bt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-2 px-1">Section</p>
          <button
            onClick={() => { addSection(); setOpen(false); }}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm"
          >
            <span className="text-lg">+</span>
            Nouvelle section
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-light shadow-lg transition-all ${open ? 'bg-red-500 text-white rotate-45' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
      >
        +
      </button>
    </div>
  );
}
