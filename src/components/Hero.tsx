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
    return `${dayNames[ns.day_of_week] || ''} de ${ns.start?.slice(0, 5)} a ${ns.end?.slice(0, 5)}`;
  }

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #002d75 0%, #003893 40%, #001f52 100%)' }}>
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'url(/part_of_back.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      {/* Radial glow */}
      <div className="absolute top-[10%] -right-[5%] w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.06) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="text-white max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
              Participez au Quiz Live
              <span className="block text-gold mt-2" style={{ textShadow: '0 2px 24px rgba(255,184,0,0.25)' }}>
                et remportez des points!
              </span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              Testez vos connaissances et mesurez-vous aux autres Congolais !
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Quiz closed banner */}
              {!checking && settings && !settings.is_open && (
                <div className="w-full mb-2">
                  {settings.schedule?.next_session && (
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 mb-3 backdrop-blur-sm">
                      <span className="text-2xl">&#x1F4C5;</span>
                      <div>
                        <span className="text-gold text-xs font-semibold uppercase tracking-wider block">Prochaine session</span>
                        <span className="text-white text-sm">{getNextSessionText()}</span>
                      </div>
                    </div>
                  )}
                  {hasCountdown && (
                    <div className="flex gap-2 sm:gap-3 mb-3">
                      {[
                        { val: countdown.days, label: 'Jours' },
                        { val: countdown.hours, label: 'Heures' },
                        { val: countdown.minutes, label: 'Minutes' },
                        { val: countdown.seconds, label: 'Sec' },
                      ].map((item, i) => (
                        <div key={item.label} className="flex items-center gap-1 sm:gap-2">
                          {i > 0 && <span className="text-gold font-bold text-lg">:</span>}
                          <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[52px]">
                            <span className="block text-xl sm:text-2xl font-bold text-white">{item.val.toString().padStart(2, '0')}</span>
                            <span className="block text-[10px] text-white/60 uppercase tracking-wider">{item.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!hasCountdown && !settings.schedule?.next_session && (
                    <p className="text-white/70 text-sm mb-3">Le quiz est actuellement fermé. Revenez bientôt !</p>
                  )}
                </div>
              )}

              <button onClick={playQuiz} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base sm:text-lg text-primary-dark transition-all hover:-translate-y-1 hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #FFB800, #E5A600)', boxShadow: '0 4px 24px rgba(255,184,0,0.35)' }}>
                &#x1F3AE; Jouer au Quiz
              </button>
              <a href="#inscription" className="inline-flex items-center px-6 py-3.5 rounded-full font-semibold text-sm text-white border-2 border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all hover:-translate-y-0.5">
                S&apos;inscrire
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[360px] lg:w-[420px]">
              <img src={heroImage} alt="Quiz participant" className="w-full h-auto relative z-10" loading="eager" />
              <span className="absolute top-4 left-0 text-6xl text-gold/30 font-bold animate-[float_3s_ease-in-out_infinite] z-0">?</span>
              <span className="absolute top-1/3 -right-4 text-5xl text-gold/20 font-bold animate-[float_4s_ease-in-out_infinite_0.5s] z-0">?</span>
              <span className="absolute bottom-1/4 -left-2 text-4xl text-gold/25 font-bold animate-[float_3.5s_ease-in-out_infinite_1s] z-0">?</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 w-full z-20 leading-[0]">
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" fill="none" className="block w-full h-14">
          <path d="M0 20C240 5 480 35 720 20C960 5 1200 35 1440 20V40H0V20Z" fill="#001f52" />
        </svg>
      </div>
    </section>
  );
}
