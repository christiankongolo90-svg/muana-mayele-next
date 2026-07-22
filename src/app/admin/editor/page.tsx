'use client';

import { useEffect, useState } from 'react';
import { EditorProvider, useEditor } from '@/lib/editor/context';
import EditorCanvas from '@/components/editor/Canvas';
import EditorToolbar from '@/components/editor/Toolbar';
import EditorPanel from '@/components/editor/Panel';
import BlockPicker from '@/components/editor/BlockPicker';

export default function EditorPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('quiz_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.id) setUserId(String(u.id));
      }
    } catch {}
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="h-screen bg-[#0f0f23] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="h-screen bg-[#0f0f23] flex items-center justify-center">
        <p className="text-white/50">Accès non autorisé. Connectez-vous en tant qu&apos;administrateur.</p>
      </div>
    );
  }

  return (
    <EditorProvider slug="home">
      <EditorShell userId={userId} />
    </EditorProvider>
  );
}

function EditorShell({ userId }: { userId: string }) {
  const { loadContent, undo, redo, save } = useEditor();

  useEffect(() => {
    loadContent(userId);
  }, [userId, loadContent]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); save();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo, save]);

  return (
    <div className="h-screen flex flex-col bg-[#0f0f23] overflow-hidden">
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden relative">
        <EditorCanvas />
        <EditorPanel />
        <BlockPicker />
      </div>
    </div>
  );
}
