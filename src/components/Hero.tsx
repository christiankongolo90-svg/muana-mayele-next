'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getQuizSettings, getSiteContent, type QuizSettings } from '@/lib/api';

function resolveImageUrl(value: string): string {
  if (!value) return '/person_hero.png';
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
}

export default function Hero() {
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [checking, setChecking] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasCountdown, setHasCountdown] = useState(false);
  const [heroImage, setHeroImage] = useState('/person_hero.png');

  useEffect(() => {
    getQuizSettings()
      .then(s => {
        setSettings(s);
        if (!s.is_open && s.schedule?.next_session?.datetime) setHasCountdown(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));

    getSiteContent()
      .then(data => {
        const items = data?.content || [];
        const heroImg = items.find((c: any) => c.section === 'hero' && c.content_key === 'image');
        if (heroImg?.content_value) setHeroImage(resolveImageUrl(heroImg.content_value));
      })
      .catch(() => {});
  }, []);

  const updateCountdown = useCallback(() => {
    if (!settings?.schedule?.next_session?.datetime) return;
    const target = new Date(settings.schedule.next_session.datetime).getTime();
    const diff = Math.max(0, target - Date.now());
    setCountdown({
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    });
  }, [settings]);

  useEffect(() => {
    if (!hasCountdown) return;
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [hasCountdown, updateCountdown]);

  function playQuiz() {
    if (!user) { document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth' }); return; }
    router.push('/quiz');
  }

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  function getNextSessionText() {
    const ns = settings?.schedule?.next_session;
    if (!ns) return '';
    return `${dayNames[ns.day_of_week] || ''} de ${ns.start?.slice(0, 5)} à ${ns.end?.slice(0, 5)}`;
  }

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden surface-hero">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Radial accents */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.06) 0%, transparent 55%)' }} />
        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,80,200,0.15) 0%, transparent 55%)' }} />

        {/* Floating dots */}
        <div className="absolute top-[18%] left-[8%] w-2 h-2 bg-gold/20 rounded-full animate-[float-slow_7s_ease-in-out_infinite]" />
        <div className="absolute top-[70%] right-[12%] w-1.5 h-1.5 bg-white/15 rounded-full animate-[float-slow_9s_ease-in-out_infinite_2s]" />
        <div className="hidden lg:block absolute top-[30%] right-[25%] w-2 h-2 bg-gold/15 rounded-full animate-[float-slow_6s_ease-in-out_infinite_1s]" />
      </div>

      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url(/part_of_back.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Text */}
          <div className="text-white animate-[slideInLeft_0.7s_ease]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.12] rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              <span className="text-gold/90 text-xs font-semibold uppercase tracking-widest">Quiz interactif en direct</span>
            </div>

            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] mb-4 tracking-tight">
              <span className="whitespace-nowrap">Testez vos connaissances.</span>{' '}
              <span className="text-gold whitespace-nowrap">Affrontez la communauté.</span>
            </h1>

            <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8">
              Participez au quiz en direct, répondez rapidement et grimpez au classement national. Des récompenses attendent les meilleurs.
            </p>

            {/* Countdown */}
            {!checking && settings && !settings.is_open && (
              <div className="mb-8 animate-[fadeIn_0.5s_ease_0.3s_backwards]">
                {settings.schedule?.next_session && (
                  <div className="flex items-center gap-4 glass-card rounded-2xl px-6 py-4 mb-5 max-w-fit">
                    <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gold/70 text-xs font-semibold uppercase tracking-wider block">Prochaine session</span>
                      <span className="text-white text-lg font-semibold">{getNextSessionText()}</span>
                    </div>
                  </div>
                )}
                {hasCountdown && (
                  <div className="flex gap-3 sm:gap-4 mb-3">
                    {[
                      { val: countdown.days, label: 'Jours' },
                      { val: countdown.hours, label: 'Heures' },
                      { val: countdown.minutes, label: 'Min' },
                      { val: countdown.seconds, label: 'Sec' },
                    ].map((item, i) => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        {i > 0 && <span className="text-white/20 font-light text-2xl">:</span>}
                        <div className="glass-card rounded-2xl px-5 py-4 text-center min-w-[72px] sm:min-w-[80px]">
                          <span className="block text-3xl sm:text-4xl font-bold text-white tabular-nums leading-none">{item.val.toString().padStart(2, '0')}</span>
                          <span className="block text-[11px] text-white/40 uppercase tracking-wider mt-1.5">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!hasCountdown && !settings.schedule?.next_session && (
                  <p className="text-white/50 text-sm mb-4">Le quiz est actuellement fermé. Revenez bientôt !</p>
                )}
              </div>
            )}

            {/* Live status */}
            {!checking && settings?.is_open && (
              <div className="flex items-center gap-2 mb-6 animate-[fadeIn_0.5s_ease_0.3s_backwards]">
                <span className="flex items-center gap-1.5 bg-green/15 border border-green/25 text-green rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 bg-green rounded-full animate-pulse" />
                  Quiz en cours
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 items-center">
              <button onClick={playQuiz} className="btn-cta inline-flex items-center gap-3 px-10 py-4.5 rounded-full font-bold text-lg text-primary-dark">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Jouer au Quiz
              </button>
              <a href="#comment-ca-marche" className="group inline-flex items-center px-8 py-4.5 rounded-full font-semibold text-base text-white/80 border border-white/15 hover:bg-white/5 hover:border-white/25 hover:text-white transition-all">
                Comment ça marche
                <svg className="w-5 h-5 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative flex justify-center lg:justify-center animate-[slideInRight_0.7s_ease_0.15s_backwards]">
            <div className="relative w-full max-w-[500px]">
              {/* Glow behind */}
              <div className="absolute inset-0 rounded-full animate-[glow-pulse_4s_ease-in-out_infinite]" style={{ filter: 'blur(50px)', background: 'radial-gradient(circle, rgba(255,184,0,0.15) 0%, transparent 65%)' }} />

              {/* Main image */}
              <img src={heroImage} alt="Participant au quiz Muana Mayele" className="w-full h-auto relative z-10 drop-shadow-2xl" loading="eager" />

              {/* Floating cards */}
              <div className="absolute -top-2 -left-2 sm:-left-6 glass-card rounded-xl px-3 py-2 flex items-center gap-2 animate-[float_4s_ease-in-out_infinite] z-20">
                <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <span className="text-white text-xs font-semibold block leading-tight">20 questions</span>
                  <span className="text-white/40 text-[10px]">par session</span>
                </div>
              </div>

              <div className="absolute top-1/3 -right-3 sm:-right-8 glass-card rounded-xl px-3 py-2 flex items-center gap-2 animate-[float_5s_ease-in-out_infinite_1s] z-20">
                <div className="w-8 h-8 rounded-lg bg-green/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-white text-xs font-semibold block leading-tight">50 $</span>
                  <span className="text-white/40 text-[10px]">à gagner</span>
                </div>
              </div>

              <div className="absolute bottom-[10%] -left-4 sm:-left-8 glass-card rounded-xl px-3 py-2 flex items-center gap-2 animate-[float_4.5s_ease-in-out_infinite_0.5s] z-20">
                <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-white text-xs font-semibold block leading-tight">50 pts</span>
                  <span className="text-white/40 text-[10px]">par bonne réponse</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
