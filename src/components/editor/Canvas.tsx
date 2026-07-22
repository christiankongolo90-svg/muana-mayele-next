'use client';

import { useRef, useCallback, useState } from 'react';
import { useEditor } from '@/lib/editor/context';
import type { Block, Section } from '@/lib/editor/types';
import { resolveStyles, stylesToCss } from '@/lib/editor/types';

export default function EditorCanvas() {
  const { content, viewport, selectedId, hoveredId, select, hover, moveSection } = useEditor();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const vpWidth = viewport === 'tablet' ? '768px' : viewport === 'mobile' ? '375px' : '100%';

  function handleDrop(toIdx: number) {
    if (dragIdx !== null && dragIdx !== toIdx) moveSection(dragIdx, toIdx);
    setDragIdx(null);
    setOverIdx(null);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1a2e]" onClick={() => select(null)}>
      <div
        className="mx-auto transition-all duration-300 min-h-full"
        style={{ maxWidth: vpWidth, boxShadow: viewport !== 'desktop' ? '0 0 40px rgba(0,0,0,0.5)' : 'none' }}
      >
        {content.sections.map((section, idx) => (
          <div key={section.id}>
            {overIdx === idx && dragIdx !== null && dragIdx !== idx && (
              <div className="h-1 bg-blue-500 mx-4 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
            )}
            <SectionBlock
              section={section}
              index={idx}
              total={content.sections.length}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={() => setOverIdx(idx)}
              onDragLeave={() => setOverIdx(null)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              isDragging={dragIdx === idx}
            />
          </div>
        ))}
        {/* Drop zone at end */}
        <div
          className="h-16"
          onDragOver={e => { e.preventDefault(); setOverIdx(content.sections.length); }}
          onDrop={e => { e.preventDefault(); handleDrop(content.sections.length); }}
          onDragLeave={() => setOverIdx(null)}
        >
          {overIdx === content.sections.length && dragIdx !== null && (
            <div className="h-1 bg-blue-500 mx-4 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ section, index, total, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isDragging }: {
  section: Section; index: number; total: number;
  onDragStart: () => void; onDragOver: () => void; onDragLeave: () => void;
  onDrop: () => void; onDragEnd: () => void; isDragging: boolean;
}) {
  const { selectedId, hoveredId, select, hover, viewport, moveSection, removeElement, duplicateSection, toggleSectionHidden, addBlock } = useEditor();
  const isSelected = selectedId === section.id;
  const isHovered = hoveredId === section.id;
  const resolved = resolveStyles(section.styles, section.responsive, viewport);

  return (
    <div
      className={`relative group/section transition-all ${isDragging ? 'opacity-30 scale-[0.98]' : ''} ${section.hidden ? 'opacity-40' : ''}`}
      style={stylesToCss(resolved)}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(); }}
      onClick={e => { e.stopPropagation(); select(section.id); }}
      onMouseEnter={() => hover(section.id)}
      onMouseLeave={() => hover(null)}
    >
      {/* Section content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.children.map((block) => (
          <BlockElement key={block.id} block={block} sectionId={section.id} />
        ))}
        {section.children.length === 0 && (
          <div className="py-12 text-center">
            <button
              onClick={e => { e.stopPropagation(); addBlock(section.id, 'heading'); }}
              className="text-white/20 hover:text-white/50 text-sm transition-colors border border-dashed border-white/20 hover:border-white/40 rounded-lg px-6 py-3"
            >
              + Ajouter un bloc
            </button>
          </div>
        )}
      </div>

      {/* Section overlay */}
      {(isSelected || isHovered) && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className={`absolute inset-0 ring-2 ring-inset ${isSelected ? 'ring-blue-500' : 'ring-blue-400/50'}`} />

          {/* Label + drag handle */}
          <div className="absolute -top-0.5 left-4 -translate-y-full pointer-events-auto flex items-center gap-1">
            <div
              draggable
              onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
              onDragEnd={onDragEnd}
              className="bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-t-lg flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none"
            >
              <svg className="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="7" cy="4" r="1.5"/><circle cx="13" cy="4" r="1.5"/>
                <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
              </svg>
              {section.label}
            </div>
          </div>

          {/* Section actions */}
          {isSelected && (
            <div className="absolute -top-0.5 right-4 -translate-y-full pointer-events-auto flex items-center gap-0.5 bg-white rounded-t-lg shadow-lg px-1 py-0.5">
              <MiniBtn title="Monter" disabled={index === 0} onClick={() => moveSection(index, index - 1)}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </MiniBtn>
              <MiniBtn title="Descendre" disabled={index === total - 1} onClick={() => moveSection(index, index + 1)}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </MiniBtn>
              <div className="w-px h-4 bg-gray-200" />
              <MiniBtn title={section.hidden ? 'Afficher' : 'Masquer'} onClick={() => toggleSectionHidden(section.id)}>
                {section.hidden ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" />
                ) : (
                  <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                )}
              </MiniBtn>
              <MiniBtn title="Dupliquer" onClick={() => duplicateSection(section.id)}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </MiniBtn>
              <div className="w-px h-4 bg-gray-200" />
              <MiniBtn title="Supprimer" danger onClick={() => removeElement(section.id)}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </MiniBtn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockElement({ block, sectionId }: { block: Block; sectionId: string }) {
  const { selectedId, hoveredId, select, hover, viewport, updateBlockContent, removeElement } = useEditor();
  const isSelected = selectedId === block.id;
  const isHovered = hoveredId === block.id && !isSelected;
  const resolved = resolveStyles(block.styles, block.responsive, viewport);
  const css = stylesToCss(resolved);
  const ref = useRef<HTMLDivElement>(null);

  const handleTextBlur = useCallback(() => {
    if (ref.current && (block.type === 'heading' || block.type === 'paragraph')) {
      const newText = ref.current.innerText;
      if (newText !== block.content.text) {
        updateBlockContent(block.id, { ...block.content, text: newText });
      }
    }
  }, [block, updateBlockContent]);

  const isText = block.type === 'heading' || block.type === 'paragraph';

  return (
    <div
      className={`relative group/block ${isSelected ? 'z-10' : ''}`}
      onClick={e => { e.stopPropagation(); select(block.id); }}
      onMouseEnter={e => { e.stopPropagation(); hover(block.id); }}
      onMouseLeave={e => { e.stopPropagation(); hover(null); }}
    >
      {/* Outline */}
      {(isSelected || isHovered) && (
        <div className={`absolute inset-0 pointer-events-none ${isSelected ? 'ring-2 ring-blue-500 rounded-sm' : 'ring-1 ring-blue-400/40 rounded-sm'}`} />
      )}

      {/* Block type badge */}
      {isSelected && (
        <div className="absolute -top-5 left-0 pointer-events-auto flex items-center gap-1 z-20">
          <span className="bg-blue-600 text-white text-[10px] font-medium px-2 py-0.5 rounded">
            {block.type === 'heading' ? `H${block.content.level || 1}` : block.type}
          </span>
          <button
            onClick={e => { e.stopPropagation(); removeElement(block.id); }}
            className="bg-red-500 hover:bg-red-600 text-white rounded p-0.5 transition-colors"
            title="Supprimer"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Render block */}
      {isText && (
        <div
          ref={ref}
          contentEditable={isSelected}
          suppressContentEditableWarning
          onBlur={handleTextBlur}
          onKeyDown={e => { if (e.key === 'Escape') { (e.target as HTMLElement).blur(); } }}
          style={css}
          className={`outline-none ${isSelected ? 'cursor-text' : 'cursor-pointer'}`}
        >
          {block.content.text}
        </div>
      )}

      {block.type === 'image' && (
        <div style={{ ...css, display: 'flex', justifyContent: css.marginLeft === 'auto' ? 'center' : 'flex-start' }}>
          {block.content.src ? (
            <img
              src={block.content.src}
              alt={block.content.alt || ''}
              style={{ width: css.width, maxWidth: css.maxWidth, borderRadius: css.borderRadius, objectFit: (css.objectFit as any) || 'contain' }}
              className="h-auto"
              draggable={false}
            />
          ) : (
            <div
              className="border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
              style={{ width: css.width || '300px', height: css.height || '200px', maxWidth: css.maxWidth }}
            >
              <span className="text-white/30 text-sm">Cliquez pour ajouter une image</span>
            </div>
          )}
        </div>
      )}

      {block.type === 'button' && (
        <div style={{ display: 'flex', justifyContent: css.marginLeft === 'auto' && css.marginRight === 'auto' ? 'center' : css.textAlign === 'center' ? 'center' : 'flex-start' }}>
          <div
            ref={ref}
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={handleTextBlur}
            style={{
              ...css,
              display: 'inline-block',
              cursor: isSelected ? 'text' : 'pointer',
              marginLeft: undefined,
              marginRight: undefined,
            }}
          >
            {block.content.text}
          </div>
        </div>
      )}

      {block.type === 'divider' && (
        <div style={css} />
      )}

      {block.type === 'spacer' && (
        <div style={{ height: css.height || '48px' }} className={isSelected || isHovered ? 'bg-blue-500/10 border border-dashed border-blue-500/30' : ''}>
          {isSelected && <span className="text-blue-400 text-[10px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{css.height || '48px'}</span>}
        </div>
      )}
    </div>
  );
}

function MiniBtn({ children, onClick, title, disabled, danger }: {
  children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} disabled={disabled} title={title}
      className={`p-1.5 rounded transition-colors disabled:opacity-25 ${danger ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{children}</svg>
    </button>
  );
}
