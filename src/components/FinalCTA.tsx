'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useReveal } from '@/lib/useReveal';

export default function FinalCTA() {
  const ref = useReveal<HTMLElement>();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <section ref={ref} className="reveal surface-accent py-20 sm:py-28 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.08) 0%, transparent 50%)' }} />
        <div className="absolute -bottom-40 left-0 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,80,200,0.15) 0%, transparent 50%)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
          Prêt à prouver ce que vous savez ?
        </h2>
        <p className="text-white/60 text-base sm:text-lg mb-8 max-w-lg mx-auto">
          Créez votre compte et participez au prochain quiz en direct. Des récompenses attendent les meilleurs joueurs.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              if (user) router.push('/quiz');
              else document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-cta inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-[15px] text-primary-dark"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {user ? 'Jouer maintenant' : 'Jouer maintenant'}
          </button>
          {!user && (
            <a href="#inscription" className="inline-flex items-center px-7 py-4 rounded-full font-semibold text-sm text-white border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all">
              Créer un compte
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
