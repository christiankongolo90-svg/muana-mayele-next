'use client';

import { useState, useEffect } from 'react';
import { getPageSections } from '@/lib/api';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import RegistrationForm from '@/components/RegistrationForm';
import HowItWorks from '@/components/HowItWorks';
import Leaderboard from '@/components/Leaderboard';
import Prizes from '@/components/Prizes';
import Benefits from '@/components/Benefits';
import Community from '@/components/Community';
import FinalCTA from '@/components/FinalCTA';

function TextSection({ section }: { section: any }) {
  const bgColor = section.settings?.bgColor || 'transparent';
  const textColor = section.settings?.textColor || '#ffffff';
  return (
    <div style={{ backgroundColor: bgColor }} className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: textColor }}>{section.title}</h2>
        )}
        {section.content && (
          <div className="prose prose-lg max-w-none text-center leading-relaxed" style={{ color: textColor + 'cc' }}
            dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />
        )}
      </div>
    </div>
  );
}

function ImageSection({ section }: { section: any }) {
  const imageWidth = section.settings?.imageWidth || 500;
  const bgColor = section.settings?.bgColor || 'transparent';
  if (!section.image_url) return null;
  return (
    <div style={{ backgroundColor: bgColor }} className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-white">{section.title}</h2>}
        <div className="flex justify-center">
          <img src={section.image_url} alt={section.title || 'Image'} style={{ maxWidth: `${imageWidth}px`, width: '100%' }} className="rounded-2xl shadow-2xl h-auto" loading="lazy" />
        </div>
        {section.content && <p className="text-white/50 text-center mt-6 max-w-2xl mx-auto text-sm leading-relaxed">{section.content}</p>}
      </div>
    </div>
  );
}

export default function DynamicPage() {
  const [sections, setSections] = useState<any[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPageSections()
      .then(data => setSections(data.sections))
      .catch(() => setError(true));
  }, []);

  if (error || sections === null || sections.length === 0) {
    return <FallbackPage />;
  }

  const otherSections = sections.filter(s => s.section_type !== 'hero');

  return (
    <>
      <Hero />
      <StatsBar />

      {/* Dynamic sections from DB */}
      {otherSections.map(section => {
        switch (section.section_type) {
          case 'registration':
            return (
              <section key={section.id} className="surface-light py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-3">Rejoignez la compétition</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Inscrivez-vous et jouez</h2>
                    <p className="text-white/50 text-base max-w-lg mx-auto">Créez votre compte en quelques secondes et commencez à jouer au quiz en direct.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    <div><RegistrationForm /></div>
                    <div className="lg:sticky lg:top-24"><HowItWorks /></div>
                  </div>
                </div>
              </section>
            );
          case 'how_it_works':
            return null;
          case 'leaderboard':
            return <Leaderboard key={section.id} />;
          case 'text':
            return <div key={section.id}><TextSection section={section} /></div>;
          case 'image':
            return <div key={section.id}><ImageSection section={section} /></div>;
          default:
            return null;
        }
      })}

      {/* Static sections that are always present */}
      <Prizes />
      <Benefits />
      <Community />
      <FinalCTA />
    </>
  );
}

function FallbackPage() {
  return (
    <>
      <Hero />
      <StatsBar />

      {/* Registration + How it works */}
      <section className="surface-light py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-3">Rejoignez la compétition</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Inscrivez-vous et jouez</h2>
            <p className="text-white/50 text-base max-w-lg mx-auto">Créez votre compte en quelques secondes et commencez à jouer au quiz en direct.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div><RegistrationForm /></div>
            <div className="lg:sticky lg:top-24"><HowItWorks /></div>
          </div>
        </div>
      </section>

      <Leaderboard />
      <Prizes />
      <Benefits />
      <Community />
      <FinalCTA />
    </>
  );
}
