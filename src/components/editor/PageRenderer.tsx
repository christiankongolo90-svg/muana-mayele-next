'use client';

import type { PageContent, Block, Section } from '@/lib/editor/types';
import { resolveStyles, stylesToCss } from '@/lib/editor/types';
import { useEffect, useState } from 'react';

export default function PageRenderer({ slug = 'home' }: { slug?: string }) {
  const [content, setContent] = useState<PageContent | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/editor/published?slug=${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.content) setContent(d.data.content); else setError(true); })
      .catch(() => setError(true));
  }, [slug]);

  if (error || !content) return null;

  return (
    <>
      {content.sections.filter(s => !s.hidden).map(section => (
        <RenderSection key={section.id} section={section} />
      ))}
    </>
  );
}

function RenderSection({ section }: { section: Section }) {
  const css = stylesToCss(section.styles);
  return (
    <section style={css}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.children.map(block => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
}

function RenderBlock({ block }: { block: Block }) {
  const css = stylesToCss(block.styles);

  if (block.type === 'heading') {
    const level = block.content.level || 1;
    if (level === 1) return <h1 style={css}>{block.content.text}</h1>;
    if (level === 2) return <h2 style={css}>{block.content.text}</h2>;
    if (level === 3) return <h3 style={css}>{block.content.text}</h3>;
    return <h4 style={css}>{block.content.text}</h4>;
  }

  if (block.type === 'paragraph') {
    return <p style={css}>{block.content.text}</p>;
  }

  if (block.type === 'image' && block.content.src) {
    return (
      <div style={{ display: 'flex', justifyContent: css.marginLeft === 'auto' ? 'center' : 'flex-start' }}>
        <img
          src={block.content.src}
          alt={block.content.alt || ''}
          style={{ width: css.width, maxWidth: css.maxWidth, borderRadius: css.borderRadius, objectFit: (css.objectFit as any) || 'contain' }}
          className="h-auto"
          loading="lazy"
        />
      </div>
    );
  }

  if (block.type === 'button') {
    return (
      <div style={{ display: 'flex', justifyContent: css.marginLeft === 'auto' && css.marginRight === 'auto' ? 'center' : css.textAlign === 'center' ? 'center' : 'flex-start' }}>
        <a href={block.content.href || '#'} style={{ ...css, display: 'inline-block', textDecoration: 'none', marginLeft: undefined, marginRight: undefined }}>
          {block.content.text}
        </a>
      </div>
    );
  }

  if (block.type === 'divider') {
    return <div style={css} />;
  }

  if (block.type === 'spacer') {
    return <div style={{ height: css.height || '48px' }} />;
  }

  return null;
}
