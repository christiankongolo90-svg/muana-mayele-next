'use client';

import { useReveal } from '@/lib/useReveal';

const benefits = [
  { title: 'Testez votre culture générale', desc: 'Des centaines de questions sur la RDC, la culture et bien plus.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
  { title: 'Représentez votre ville', desc: 'Jouez pour votre quartier, votre ville ou votre province.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /> },
  { title: 'Affrontez toute la RDC', desc: 'Mesurez-vous à des joueurs de toutes les provinces du pays.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { title: 'Gagnez des récompenses', desc: 'Des prix distribués aux meilleurs joueurs à chaque session.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { title: 'Apprenez en jouant', desc: 'Découvrez des faits sur la RDC tout en vous amusant.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
  { title: 'Grimpez au classement', desc: 'Suivez votre progression et visez la première place.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> },
];

export default function Benefits() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal surface-light py-14 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-3">Pourquoi nous rejoindre</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Plus qu&apos;un quiz, une expérience</h2>
          <p className="text-white/50 text-sm sm:text-lg max-w-xl mx-auto">Rejoignez une communauté de joueurs passionnés et vivez le quiz autrement.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{b.icon}</svg>
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-1.5">{b.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
