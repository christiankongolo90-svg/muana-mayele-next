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
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDesc, setHeroDesc] = useState('');

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
        const title = items.find((c: any) => c.section === 'hero' && c.content_key === 'title');
        if (title?.content_value) setHeroTitle(title.content_value);
        const desc = items.find((c: any) => c.section === 'hero' && c.content_key === 'description');
        if (desc?.content_value) setHeroDesc(desc.content_value);
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
    <section className="relative min-h-screen lg:min-h-[92vh] flex items-center overflow-hidden surface-hero">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-12 sm:pt-36 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-center">
          {/* Text */}
          <div className="text-white animate-[slideInLeft_0.7s_ease]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.12] rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              <span className="text-gold/90 text-xs font-semibold uppercase tracking-widest">Quiz interactif en direct</span>
            </div>

            <h1 className="text-[1.75rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] mb-4 tracking-tight">
              <span className="sm:whitespace-nowrap">Testez vos connaissances.</span>{' '}
              <span className="text-gold sm:whitespace-nowrap">Affrontez la communauté.</span>
            </h1>

            <p className="text-white/60 text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8">
              {heroDesc || 'Participez au quiz en direct, répondez rapidement et grimpez au classement national. Des récompenses attendent les meilleurs.'}
            </p>

            {/* Countdown */}
            {!checking && settings && !settings.is_open && (
              <div className="mb-8 animate-[fadeIn_0.5s_ease_0.3s_backwards]">
                {settings.schedule?.next_session && (
                  <div className="flex items-center gap-3 sm:gap-4 glass-card rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-5 max-w-fit">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gold/70 text-[10px] sm:text-xs font-semibold uppercase tracking-wider block">Prochaine session</span>
                      <span className="text-white text-sm sm:text-lg font-semibold">{getNextSessionText()}</span>
                    </div>
                  </div>
                )}
                {hasCountdown && (
                  <div className="flex gap-2 sm:gap-4 mb-3">
                    {[
                      { val: countdown.days, label: 'Jours' },
                      { val: countdown.hours, label: 'Heures' },
                      { val: countdown.minutes, label: 'Min' },
                      { val: countdown.seconds, label: 'Sec' },
                    ].map((item, i) => (
                      <div key={item.label} className="flex items-center gap-1.5 sm:gap-2.5">
                        {i > 0 && <span className="text-white/20 font-light text-lg sm:text-2xl">:</span>}
                        <div className="glass-card rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-4 text-center min-w-[52px] sm:min-w-[80px]">
                          <span className="block text-xl sm:text-4xl font-bold text-white tabular-nums leading-none">{item.val.toString().padStart(2, '0')}</span>
                          <span className="block text-[9px] sm:text-[11px] text-white/40 uppercase tracking-wider mt-1 sm:mt-1.5">{item.label}</span>
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
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
              <button onClick={playQuiz} className="btn-cta inline-flex items-center justify-center gap-2.5 sm:gap-3 px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-full font-bold text-base sm:text-lg text-primary-dark">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Jouer au Quiz
              </button>
              <a href="#comment-ca-marche" className="group inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4.5 rounded-full font-semibold text-sm sm:text-base text-white/80 border border-white/15 hover:bg-white/5 hover:border-white/25 hover:text-white transition-all">
                Comment ça marche
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative flex justify-center lg:justify-center animate-[slideInRight_0.7s_ease_0.15s_backwards]">
            <div className="relative w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[500px]">
              {/* Glow behind */}
              <div className="absolute inset-0 rounded-full animate-[glow-pulse_4s_ease-in-out_infinite]" style={{ filter: 'blur(50px)', background: 'radial-gradient(circle, rgba(255,184,0,0.15) 0%, transparent 65%)' }} />

              {/* Main image */}
              <img src={heroImage} alt="Participant au quiz Muana Mayele" className="w-full h-auto relative z-10 drop-shadow-2xl" loading="eager" />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
