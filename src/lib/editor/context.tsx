'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PageContent, Section, Block, ElementStyles, ViewportMode, BlockType } from './types';
import { createBlock, createSection, generateId } from './types';
import { defaultPageContent } from './defaults';

interface EditorCtx {
  content: PageContent;
  selectedId: string | null;
  hoveredId: string | null;
  viewport: ViewportMode;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isLoaded: boolean;
  lastSaved: string | null;
  pageSlug: string;

  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setViewport: (v: ViewportMode) => void;

  updateBlockContent: (blockId: string, content: Record<string, any>) => void;
  updateBlockStyles: (blockId: string, styles: Partial<ElementStyles>) => void;
  updateSectionStyles: (sectionId: string, styles: Partial<ElementStyles>) => void;
  updateSectionLabel: (sectionId: string, label: string) => void;
  addBlock: (sectionId: string, type: BlockType, index?: number) => void;
  addSection: (label?: string, index?: number) => void;
  removeElement: (id: string) => void;
  duplicateSection: (sectionId: string) => void;
  moveSection: (fromIdx: number, toIdx: number) => void;
  toggleSectionHidden: (sectionId: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  save: () => Promise<void>;
  publish: () => Promise<void>;
  loadContent: (userId: string) => Promise<void>;

  getSelected: () => { kind: 'section'; section: Section } | { kind: 'block'; section: Section; block: Block } | null;
}

const Ctx = createContext<EditorCtx | null>(null);
export function useEditor() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useEditor outside EditorProvider');
  return c;
}

const MAX_HISTORY = 50;

export function EditorProvider({ children, slug = 'home' }: { children: ReactNode; slug?: string }) {
  const [content, setContentRaw] = useState<PageContent>(defaultPageContent);
  const [history, setHistory] = useState<PageContent[]>([]);
  const [future, setFuture] = useState<PageContent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isDirty, setDirty] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isPublishing, setPublishing] = useState(false);
  const [isLoaded, setLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const pushHistory = useCallback((prev: PageContent) => {
    setHistory(h => [...h.slice(-(MAX_HISTORY - 1)), prev]);
    setFuture([]);
  }, []);

  const setContent = useCallback((next: PageContent | ((prev: PageContent) => PageContent)) => {
    setContentRaw(prev => {
      const n = typeof next === 'function' ? next(prev) : next;
      pushHistory(prev);
      setDirty(true);
      return n;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    setContentRaw(prev => {
      setFuture(f => [...f, prev]);
      const restored = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setDirty(true);
      return restored;
    });
  }, [history]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    setContentRaw(prev => {
      setHistory(h => [...h, prev]);
      const restored = future[future.length - 1];
      setFuture(f => f.slice(0, -1));
      setDirty(true);
      return restored;
    });
  }, [future]);

  // ── Selection ──
  const select = useCallback((id: string | null) => setSelectedId(id), []);
  const hover = useCallback((id: string | null) => setHoveredId(id), []);

  // ── Content mutation helpers ──
  const mapBlocks = useCallback((fn: (b: Block) => Block) => {
    setContent(c => ({
      ...c,
      sections: c.sections.map(s => ({ ...s, children: s.children.map(fn) })),
    }));
  }, [setContent]);

  const updateBlockContent = useCallback((blockId: string, newContent: Record<string, any>) => {
    mapBlocks(b => b.id === blockId ? { ...b, content: newContent } : b);
  }, [mapBlocks]);

  const updateBlockStyles = useCallback((blockId: string, styles: Partial<ElementStyles>) => {
    mapBlocks(b => b.id === blockId ? { ...b, styles: { ...b.styles, ...styles } } : b);
  }, [mapBlocks]);

  const updateSectionStyles = useCallback((sectionId: string, styles: Partial<ElementStyles>) => {
    setContent(c => ({
      ...c,
      sections: c.sections.map(s => s.id === sectionId ? { ...s, styles: { ...s.styles, ...styles } } : s),
    }));
  }, [setContent]);

  const updateSectionLabel = useCallback((sectionId: string, label: string) => {
    setContent(c => ({
      ...c,
      sections: c.sections.map(s => s.id === sectionId ? { ...s, label } : s),
    }));
  }, [setContent]);

  const addBlock = useCallback((sectionId: string, type: BlockType, index?: number) => {
    const block = createBlock(type);
    setContent(c => ({
      ...c,
      sections: c.sections.map(s => {
        if (s.id !== sectionId) return s;
        const kids = [...s.children];
        kids.splice(index ?? kids.length, 0, block);
        return { ...s, children: kids };
      }),
    }));
    setSelectedId(block.id);
  }, [setContent]);

  const addSection = useCallback((label?: string, index?: number) => {
    const sec = createSection(label);
    setContent(c => {
      const secs = [...c.sections];
      secs.splice(index ?? secs.length, 0, sec);
      return { ...c, sections: secs };
    });
    setSelectedId(sec.id);
  }, [setContent]);

  const removeElement = useCallback((id: string) => {
    setContent(c => {
      const secIdx = c.sections.findIndex(s => s.id === id);
      if (secIdx !== -1) {
        return { ...c, sections: c.sections.filter(s => s.id !== id) };
      }
      return {
        ...c,
        sections: c.sections.map(s => ({
          ...s,
          children: s.children.filter(b => b.id !== id),
        })),
      };
    });
    if (selectedId === id) setSelectedId(null);
  }, [setContent, selectedId]);

  const duplicateSection = useCallback((sectionId: string) => {
    setContent(c => {
      const idx = c.sections.findIndex(s => s.id === sectionId);
      if (idx === -1) return c;
      const orig = c.sections[idx];
      const dup: Section = {
        ...orig,
        id: generateId(),
        label: orig.label + ' (copie)',
        children: orig.children.map(b => ({ ...b, id: generateId() })),
      };
      const secs = [...c.sections];
      secs.splice(idx + 1, 0, dup);
      return { ...c, sections: secs };
    });
  }, [setContent]);

  const moveSection = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setContent(c => {
      const secs = [...c.sections];
      const [moved] = secs.splice(fromIdx, 1);
      secs.splice(toIdx, 0, moved);
      return { ...c, sections: secs };
    });
  }, [setContent]);

  const toggleSectionHidden = useCallback((sectionId: string) => {
    setContent(c => ({
      ...c,
      sections: c.sections.map(s => s.id === sectionId ? { ...s, hidden: !s.hidden } : s),
    }));
  }, [setContent]);

  // ── Get selected element ──
  const getSelected = useCallback((): EditorCtx['getSelected'] extends (...args: any) => infer R ? R : never => {
    if (!selectedId) return null;
    for (const section of content.sections) {
      if (section.id === selectedId) return { kind: 'section', section };
      const block = section.children.find(b => b.id === selectedId);
      if (block) return { kind: 'block', section, block };
    }
    return null;
  }, [selectedId, content]);

  // ── Persistence ──
  const loadContent = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/editor?slug=${slug}`, {
        headers: { 'X-Admin-User-Id': userId },
      });
      const data = await res.json();
      if (data.success && data.data?.content) {
        setContentRaw(data.data.content);
        setDirty(false);
      }
    } catch {}
    setLoaded(true);
  }, [slug]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/editor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-User-Id': '1' },
        body: JSON.stringify({ slug, content }),
      });
      const data = await res.json();
      if (data.success) {
        setDirty(false);
        setLastSaved(new Date().toLocaleTimeString('fr-FR'));
      }
    } catch {}
    setSaving(false);
  }, [slug, content]);

  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      const res = await fetch('/api/admin/editor/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-User-Id': '1' },
        body: JSON.stringify({ slug, content }),
      });
      const data = await res.json();
      if (data.success) {
        setDirty(false);
        setLastSaved(new Date().toLocaleTimeString('fr-FR'));
      }
    } catch {}
    setPublishing(false);
  }, [slug, content]);

  return (
    <Ctx.Provider value={{
      content, selectedId, hoveredId, viewport, isDirty, isSaving, isPublishing, isLoaded, lastSaved, pageSlug: slug,
      select, hover, setViewport,
      updateBlockContent, updateBlockStyles, updateSectionStyles, updateSectionLabel,
      addBlock, addSection, removeElement, duplicateSection, moveSection, toggleSectionHidden,
      undo, redo, canUndo: history.length > 0, canRedo: future.length > 0,
      save, publish, loadContent,
      getSelected,
    }}>
      {children}
    </Ctx.Provider>
  );
}
