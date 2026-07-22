'use client';

import { useReveal } from '@/lib/useReveal';

const socials = [
  { name: 'Facebook', href: 'https://facebook.com', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
  { name: 'Instagram', href: 'https://instagram.com', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></> },
  { name: 'TikTok', href: 'https://tiktok.com', icon: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /> },
];

export default function Community() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal surface-dark py-14 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Accent gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.08) 0%, transparent 60%)' }} />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,80,200,0.12) 0%, transparent 60%)' }} />
          </div>

          <div className="relative z-10">
            <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-3">Communauté</span>
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-3">Rejoignez la communauté Muana Mayele</h2>
            <p className="text-white/50 text-base max-w-lg mx-auto mb-8">
              Suivez les résultats, les annonces et les meilleurs moments du quiz sur nos réseaux.
            </p>

            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {socials.map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 glass-card glass-card-hover rounded-xl flex items-center justify-center transition-all hover:-translate-y-1 group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-gold transition-colors">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
