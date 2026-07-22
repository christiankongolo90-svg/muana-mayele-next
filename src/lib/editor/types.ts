export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export type BlockType = 'heading' | 'paragraph' | 'image' | 'button' | 'divider' | 'spacer';

export interface ElementStyles {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  color?: string;

  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;

  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;

  width?: string;
  maxWidth?: string;
  minHeight?: string;
  height?: string;

  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;

  boxShadow?: string;
  opacity?: string;
  objectFit?: string;
}

export interface ResponsiveOverrides {
  tablet?: Partial<ElementStyles>;
  mobile?: Partial<ElementStyles>;
}

export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  styles: ElementStyles;
  responsive?: ResponsiveOverrides;
}

export interface Section {
  id: string;
  label: string;
  styles: ElementStyles;
  responsive?: ResponsiveOverrides;
  children: Block[];
  hidden?: boolean;
}

export interface PageContent {
  sections: Section[];
}

export interface PageVersion {
  id: number;
  page_slug: string;
  content: PageContent;
  status: 'draft' | 'published';
  created_by: number;
  created_at: string;
  published_at: string | null;
}

export function generateId(): string {
  return 'b' + Math.random().toString(36).slice(2, 10);
}

export function resolveStyles(
  styles: ElementStyles,
  responsive: ResponsiveOverrides | undefined,
  viewport: ViewportMode,
): ElementStyles {
  let s = { ...styles };
  if (viewport === 'tablet' || viewport === 'mobile') {
    if (responsive?.tablet) s = { ...s, ...responsive.tablet };
  }
  if (viewport === 'mobile') {
    if (responsive?.mobile) s = { ...s, ...responsive.mobile };
  }
  return s;
}

export function stylesToCss(styles: ElementStyles): React.CSSProperties {
  const css: Record<string, any> = {};
  for (const [k, v] of Object.entries(styles)) {
    if (v === undefined || v === '') continue;
    if (k === 'backgroundImage' && !v.startsWith('url(') && !v.startsWith('linear-gradient')) {
      css.backgroundImage = `url(${v})`;
    } else {
      css[k] = v;
    }
  }
  return css;
}

export function createBlock(type: BlockType, overrides?: Partial<Block>): Block {
  const base: Record<BlockType, () => Block> = {
    heading: () => ({
      id: generateId(), type: 'heading',
      content: { text: 'Nouveau titre', level: 2 },
      styles: { fontSize: '30px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' },
    }),
    paragraph: () => ({
      id: generateId(), type: 'paragraph',
      content: { text: 'Nouveau paragraphe. Cliquez pour modifier ce texte.' },
      styles: { fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '16px' },
    }),
    image: () => ({
      id: generateId(), type: 'image',
      content: { src: '', alt: '' },
      styles: { width: '100%', maxWidth: '600px', borderRadius: '12px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px' },
    }),
    button: () => ({
      id: generateId(), type: 'button',
      content: { text: 'Cliquez ici', href: '#' },
      styles: { backgroundColor: '#FFB800', color: '#002d75', fontSize: '16px', fontWeight: '700', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '9999px', textAlign: 'center' },
    }),
    divider: () => ({
      id: generateId(), type: 'divider',
      content: {},
      styles: { height: '1px', backgroundColor: 'rgba(255,255,255,0.15)', marginTop: '24px', marginBottom: '24px' },
    }),
    spacer: () => ({
      id: generateId(), type: 'spacer',
      content: {},
      styles: { height: '48px' },
    }),
  };
  const block = base[type]();
  if (overrides) return { ...block, ...overrides, styles: { ...block.styles, ...overrides.styles } };
  return block;
}

export function createSection(label?: string): Section {
  return {
    id: generateId(),
    label: label || 'Nouvelle section',
    styles: { backgroundColor: '#001f52', paddingTop: '64px', paddingBottom: '64px' },
    children: [],
  };
}
