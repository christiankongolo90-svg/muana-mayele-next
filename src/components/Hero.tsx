'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getQuizSettings, getSiteContent, type QuizSettings } from '@/lib/api';

function resolveImageUrl(value: string): string {
  if (!value) return '/person_hero.png';
  if (value.startsWith('http')) return value;
  if (value.startsWith('uploads/')) return `/${value}`;
  return `/${value}`;
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
        if (!s.is_open && s.schedule?.next_session?.datetime) {
          setHasCountdown(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));

    getSiteContent()
      .then(data => {
        const items = data?.content || [];
        const heroImg = items.find((c: any) => c.section === 'hero' && c.content_key === 'image');
        if (heroImg?.content_value) {
          setHeroImage(resolveImageUrl(heroImg.content_value));
        }
      })
      .catch(() => {});
  }, []);

  const updateCountdown = useCallback(() => {
    if (!settings?.schedule?.next_session?.datetime) return;
    const target = new Date(settings.schedule.next_session.datetime).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);
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
    if (!user) {
      document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    router.push('/quiz');
  }

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  function getNextSessionText() {
    const ns = settings?.schedule?.next_session;
    if (!ns) return '';
    return `${dayNames[ns.day_of_week] || ''} de ${ns.start?.slice(0, 5)} à ${ns.end?.slice(0, 5)}`;
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #002d75 0%, #003893 30%, #001f52 70%, #000d2b 100%)' }}>
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large orbiting ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03] animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-gold/[0.04] animate-[spin_90s_linear_infinite_reverse]" />

        {/* Floating geometric shapes */}
        <div className="absolute top-[15%] left-[10%] w-3 h-3 bg-gold/20 rounded-full animate-[float-slow_6s_ease-in-out_infinite]" />
        <div className="absolute top-[25%] right-[15%] w-2 h-2 bg-white/15 rounded-full animate-[float-slow_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-[30%] left-[20%] w-4 h-4 bg-gold/10 rotate-45 animate-[float-slow_7s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[60%] right-[10%] w-2.5 h-2.5 bg-white/10 rounded-full animate-[float-slow_5s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-[80%] left-[5%] w-2 h-2 bg-gold/15 rounded-full animate-[float-slow_9s_ease-in-out_infinite_3s]" />
        <div className="hidden lg:block absolute top-[10%] right-[30%] w-1.5 h-1.5 bg-white/20 rounded-full animate-[float-slow_4s_ease-in-out_infinite_1.5s]" />

        {/* Radial glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.08) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,56,147,0.3) 0%, transparent 60%)' }} />
      </div>

      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url(/part_of_back.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="text-white max-w-xl animate-[slideInLeft_0.8s_ease]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/25 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <span className="text-gold text-xs font-semibold uppercase tracking-wider">Quiz interactif en direct</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Participez au
              <span className="block mt-1" style={{
                background: 'linear-gradient(135deg, #FFB800 0%, #FFC933 50%, #E5A600 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
              }}>
                Quiz Live
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 mt-2">
                et remportez des points!
              </span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              Testez vos connaissances sur la RDC et mesurez-vous aux meilleurs joueurs congolais !
            </p>

            {/* Quiz closed: next session + countdown */}
            {!checking && settings && !settings.is_open && (
              <div className="mb-6 animate-[fadeIn_0.5s_ease_0.3s_backwards]">
                {settings.schedule?.next_session && (
                  <div className="flex items-center gap-3 glass-card rounded-xl px-5 py-3.5 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
                      <span className="text-xl">&#x1F4C5;</span>
                    </div>
                    <div>
                      <span className="text-gold text-xs font-semibold uppercase tracking-wider block">Prochaine session</span>
                      <span className="text-white text-sm font-medium">{getNextSessionText()}</span>
                    </div>
                  </div>
                )}
                {hasCountdown && (
                  <div className="flex gap-3 sm:gap-4 mb-4">
                    {[
                      { val: countdown.days, label: 'Jours' },
                      { val: countdown.hours, label: 'Heures' },
                      { val: countdown.minutes, label: 'Min' },
                      { val: countdown.seconds, label: 'Sec' },
                    ].map((item, i) => (
                      <div key={item.label} className="flex items-center gap-2">
                        {i > 0 && <span className="text-gold/60 font-bold text-xl">:</span>}
                        <div className="glass-card rounded-xl px-4 py-3 text-center min-w-[60px]">
                          <span className="block text-2xl sm:text-3xl font-bold text-white tabular-nums">{item.val.toString().padStart(2, '0')}</span>
                          <span className="block text-[10px] text-white/50 uppercase tracking-wider mt-0.5">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!hasCountdown && !settings.schedule?.next_session && (
                  <p className="text-white/60 text-sm mb-4">Le quiz est actuellement ferm&eacute;. Revenez bient&ocirc;t !</p>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 items-center">
              <button onClick={playQuiz} className="btn-cta inline-flex items-center gap-2.5 px-9 py-4 rounded-full font-bold text-base sm:text-lg text-primary-dark">
                &#x1F3AE; Jouer au Quiz
              </button>
              <a href="#inscription" className="group inline-flex items-center px-7 py-3.5 rounded-full font-semibold text-sm text-white border-2 border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/15 hover:border-white/40 transition-all hover:-translate-y-0.5">
                S&apos;inscrire
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>

            {/* Trust stats */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10">
              {[
                { value: '1000+', label: 'Questions' },
                { value: '140+', label: 'Joueurs' },
                { value: '50$', label: 'À gagner' },
              ].map((stat, i) => (
                <div key={stat.label} className="animate-[count-up_0.5s_ease_backwards]" style={{ animationDelay: `${0.8 + i * 0.15}s` }}>
                  <span className="block text-xl sm:text-2xl font-bold text-gold">{stat.value}</span>
                  <span className="block text-xs text-white/50">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative flex justify-center lg:justify-end animate-[slideInRight_0.8s_ease_0.2s_backwards]">
            <div className="relative w-[300px] sm:w-[380px] lg:w-[440px]">
              {/* Glow ring behind image */}
              <div className="absolute inset-0 rounded-full animate-[glow-pulse_3s_ease-in-out_infinite]" style={{ filter: 'blur(40px)', background: 'radial-gradient(circle, rgba(255,184,0,0.2) 0%, transparent 70%)' }} />

              {/* Decorative ring */}
              <div className="absolute -inset-6 rounded-full border-2 border-dashed border-gold/15 animate-[spin_30s_linear_infinite]" />

              {/* Main image */}
              <img src={heroImage} alt="Quiz participant" className="w-full h-auto relative z-10 drop-shadow-2xl" loading="eager" />

              {/* Floating elements around image */}
              <div className="absolute -top-2 -left-4 w-14 h-14 glass-card rounded-2xl flex items-center justify-center animate-[float_3s_ease-in-out_infinite] z-20">
                <span className="text-2xl">&#x1F9E0;</span>
              </div>
              <div className="absolute top-1/4 -right-6 w-12 h-12 glass-card rounded-2xl flex items-center justify-center animate-[float_4s_ease-in-out_infinite_0.5s] z-20">
                <span className="text-xl">&#x2B50;</span>
              </div>
              <div className="absolute bottom-[15%] -left-5 w-12 h-12 glass-card rounded-2xl flex items-center justify-center animate-[float_3.5s_ease-in-out_infinite_1s] z-20">
                <span className="text-xl">&#x1F3C6;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 leading-[0]">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none" className="block w-full h-16">
          <path d="M0 30C180 10 360 50 540 30C720 10 900 50 1080 30C1260 10 1350 40 1440 30V60H0V30Z" fill="#001f52" />
        </svg>
      </div>
    </section>
  );
}
