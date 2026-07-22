'use client';

import { useState, useRef } from 'react';
import { useEditor } from '@/lib/editor/context';
import type { ElementStyles } from '@/lib/editor/types';

export default function EditorPanel() {
  const { getSelected, updateBlockStyles, updateBlockContent, updateSectionStyles, updateSectionLabel, selectedId, adminUserId } = useEditor();
  const sel = getSelected();

  if (!sel) {
    return (
      <div className="w-72 bg-[#0f0f23] border-l border-white/10 p-4 shrink-0 overflow-y-auto">
        <p className="text-white/30 text-sm text-center mt-8">Sélectionnez un élément pour modifier ses propriétés</p>
      </div>
    );
  }

  const isSection = sel.kind === 'section';
  const styles = isSection ? sel.section.styles : sel.block.styles;
  const isText = !isSection && (sel.block.type === 'heading' || sel.block.type === 'paragraph' || sel.block.type === 'button');
  const isImage = !isSection && sel.block.type === 'image';

  const updateStyles = (patch: Partial<ElementStyles>) => {
    if (isSection) updateSectionStyles(sel.section.id, patch);
    else updateBlockStyles(sel.block.id, patch);
  };

  return (
    <div className="w-72 bg-[#0f0f23] border-l border-white/10 shrink-0 overflow-y-auto" key={selectedId}>
      <div className="p-4 space-y-5">
        <div className="text-white font-semibold text-sm border-b border-white/10 pb-2">
          {isSection ? `Section: ${sel.section.label}` : `Bloc: ${sel.block.type}`}
        </div>

        {/* Section label */}
        {isSection && (
          <Field label="Nom de la section">
            <TextInput value={sel.section.label} onChange={v => updateSectionLabel(sel.section.id, v)} />
          </Field>
        )}

        {/* Image source */}
        {isImage && (
          <Field label="Image">
            <ImageUpload
              src={sel.block.content.src}
              onChange={src => updateBlockContent(sel.block.id, { ...sel.block.content, src })}
              adminUserId={adminUserId}
            />
            <TextInput value={sel.block.content.alt || ''} onChange={v => updateBlockContent(sel.block.id, { ...sel.block.content, alt: v })} placeholder="Texte alternatif" />
          </Field>
        )}

        {/* Button href */}
        {!isSection && sel.block.type === 'button' && (
          <Field label="Lien du bouton">
            <TextInput value={sel.block.content.href || ''} onChange={v => updateBlockContent(sel.block.id, { ...sel.block.content, href: v })} placeholder="/page ou https://..." />
          </Field>
        )}

        {/* Typography */}
        {(isText || isSection) && (
          <Group label="Typographie">
            <Field label="Taille">
              <TextInput value={styles.fontSize || ''} onChange={v => updateStyles({ fontSize: v })} placeholder="16px" />
            </Field>
            <Field label="Poids">
              <Select value={styles.fontWeight || ''} onChange={v => updateStyles({ fontWeight: v })}
                options={[['', 'Normal'], ['400', '400'], ['500', '500'], ['600', '600'], ['700', '700'], ['800', '800']]} />
            </Field>
            <Field label="Alignement">
              <Select value={styles.textAlign || ''} onChange={v => updateStyles({ textAlign: v })}
                options={[['', 'Auto'], ['left', 'Gauche'], ['center', 'Centre'], ['right', 'Droite']]} />
            </Field>
            <Field label="Couleur du texte">
              <ColorInput value={styles.color || '#ffffff'} onChange={v => updateStyles({ color: v })} />
            </Field>
            <Field label="Interligne">
              <TextInput value={styles.lineHeight || ''} onChange={v => updateStyles({ lineHeight: v })} placeholder="1.6" />
            </Field>
          </Group>
        )}

        {/* Background */}
        <Group label="Arrière-plan">
          <Field label="Couleur">
            <ColorInput value={styles.backgroundColor || 'transparent'} onChange={v => updateStyles({ backgroundColor: v })} />
          </Field>
          {isSection && (
            <Field label="Dégradé / Image">
              <TextInput value={styles.backgroundImage || ''} onChange={v => updateStyles({ backgroundImage: v })} placeholder="linear-gradient(...) ou URL" />
            </Field>
          )}
        </Group>

        {/* Spacing */}
        <Group label="Espacement">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Marge haut"><TextInput value={styles.marginTop || ''} onChange={v => updateStyles({ marginTop: v })} placeholder="0px" /></Field>
            <Field label="Marge bas"><TextInput value={styles.marginBottom || ''} onChange={v => updateStyles({ marginBottom: v })} placeholder="0px" /></Field>
            <Field label="Padding haut"><TextInput value={styles.paddingTop || ''} onChange={v => updateStyles({ paddingTop: v })} placeholder="0px" /></Field>
            <Field label="Padding bas"><TextInput value={styles.paddingBottom || ''} onChange={v => updateStyles({ paddingBottom: v })} placeholder="0px" /></Field>
            <Field label="Padding gauche"><TextInput value={styles.paddingLeft || ''} onChange={v => updateStyles({ paddingLeft: v })} placeholder="0px" /></Field>
            <Field label="Padding droite"><TextInput value={styles.paddingRight || ''} onChange={v => updateStyles({ paddingRight: v })} placeholder="0px" /></Field>
          </div>
        </Group>

        {/* Dimensions */}
        <Group label="Dimensions">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Largeur"><TextInput value={styles.width || ''} onChange={v => updateStyles({ width: v })} placeholder="auto" /></Field>
            <Field label="Max largeur"><TextInput value={styles.maxWidth || ''} onChange={v => updateStyles({ maxWidth: v })} placeholder="auto" /></Field>
            <Field label="Hauteur min"><TextInput value={styles.minHeight || ''} onChange={v => updateStyles({ minHeight: v })} placeholder="auto" /></Field>
            <Field label="Hauteur"><TextInput value={styles.height || ''} onChange={v => updateStyles({ height: v })} placeholder="auto" /></Field>
          </div>
        </Group>

        {/* Border */}
        <Group label="Bordure">
          <Field label="Rayon"><TextInput value={styles.borderRadius || ''} onChange={v => updateStyles({ borderRadius: v })} placeholder="0px" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Épaisseur"><TextInput value={styles.borderWidth || ''} onChange={v => updateStyles({ borderWidth: v })} placeholder="0px" /></Field>
            <Field label="Couleur"><ColorInput value={styles.borderColor || '#ffffff'} onChange={v => updateStyles({ borderColor: v })} /></Field>
          </div>
        </Group>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 hover:text-white/80 transition-colors">
        {label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/40 text-[11px] mb-1">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-white/20"
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [textVal, setTextVal] = useState(value);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={toHex(value)}
        onChange={e => { onChange(e.target.value); setTextVal(e.target.value); }}
        className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
      />
      <input
        type="text"
        value={textVal}
        onChange={e => setTextVal(e.target.value)}
        onBlur={() => onChange(textVal)}
        onKeyDown={e => { if (e.key === 'Enter') onChange(textVal); }}
        className="flex-1 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {options.map(([v, l]) => <option key={v} value={v} className="bg-[#0f0f23]">{l}</option>)}
    </select>
  );
}

function ImageUpload({ src, onChange, adminUserId }: { src: string; onChange: (url: string) => void; adminUserId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { alert('Fichier non valide. Veuillez sélectionner une image.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image trop volumineuse (max 5 Mo)'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/admin/editor/upload', {
        method: 'POST',
        headers: { 'X-Admin-User-Id': adminUserId },
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        onChange(data.data.url);
      } else {
        alert('Erreur: ' + (data.error || 'Impossible de téléverser l\'image'));
      }
    } catch (e: any) {
      alert('Erreur réseau: ' + (e.message || 'Impossible de téléverser l\'image'));
    }
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      {src && (
        <img src={src} alt="" className="w-full h-24 object-cover rounded-lg border border-white/10" />
      )}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full text-sm py-1.5 rounded-lg border border-dashed border-white/20 text-white/50 hover:text-white/80 hover:border-white/40 transition-colors"
      >
        {uploading ? 'Envoi...' : src ? 'Remplacer l\'image' : 'Téléverser une image'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      <TextInput value={src} onChange={onChange} placeholder="URL de l'image" />
    </div>
  );
}

function toHex(color: string): string {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) return color;
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const m = color.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      const r = parseInt(m[0]).toString(16).padStart(2, '0');
      const g = parseInt(m[1]).toString(16).padStart(2, '0');
      const b = parseInt(m[2]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return '#ffffff';
}
