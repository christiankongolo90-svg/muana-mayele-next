'use client';

import { useState, useEffect } from 'react';
import { getSiteContent } from '@/lib/api';
import { useReveal } from '@/lib/useReveal';

const defaultSteps = [
  { title: 'Créez votre compte', description: 'Inscrivez-vous gratuitement en quelques secondes avec votre numéro de téléphone.' },
  { title: 'Rejoignez le quiz en direct', description: 'Connectez-vous au moment de la session et préparez-vous à jouer.' },
  { title: 'Répondez rapidement', description: 'Chaque bonne réponse rapporte des points. La rapidité compte !' },
  { title: 'Gagnez des récompenses', description: 'Les meilleurs joueurs remportent des prix à chaque session.' },
];

const stepIcons = [
  <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
  <path key="2" strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
  <path key="3" strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
  <path key="4" strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
];

export default function HowItWorks() {
  const ref = useReveal<HTMLElement>();
  const [title, setTitle] = useState('Comment ça marche');
  const [steps, setSteps] = useState(defaultSteps);

  useEffect(() => {
    getSiteContent()
      .then(data => {
        const items = data?.content || [];
        const get = (section: string, key: string, fallback: string) => {
          const item = items.find((c: any) => c.section === section && c.content_key === key);
          return item?.content_value || fallback;
        };
        setTitle(get('how_it_works', 'section_title', 'Comment ça marche'));
        const loaded: { title: string; description: string }[] = [];
        for (let i = 1; i <= 20; i++) {
          const t = get('how_it_works', `step_${i}_title`, '');
          const d = get('how_it_works', `step_${i}_description`, '');
          if (t) loaded.push({ title: t, description: d });
        }
        if (loaded.length > 0) setSteps(loaded);
      })
      .catch(() => {});
  }, []);

  return (
    <section ref={ref} id="comment-ca-marche" className="reveal surface-light py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-3">Étapes simples</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">Quatre étapes simples pour participer au quiz et gagner des points.</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+28px)] right-0 h-px bg-gradient-to-r from-white/10 to-transparent -mr-4 lg:-mr-8 z-0" />
              )}

              <div className="relative glass-card glass-card-hover rounded-2xl p-6 text-center transition-all duration-300 group-hover:-translate-y-1">
                {/* Step number */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary-dark text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                  {i + 1}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4 mt-2 group-hover:bg-gold/15 transition-colors">
                  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {stepIcons[i] || <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />}
                  </svg>
                </div>

                <h3 className="text-white font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
