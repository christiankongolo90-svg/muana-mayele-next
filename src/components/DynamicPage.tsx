'use client';

import { useState, useEffect } from 'react';
import { getPageSections } from '@/lib/api';
import Hero from '@/components/Hero';
import RegistrationForm from '@/components/RegistrationForm';
import HowItWorks from '@/components/HowItWorks';
import Leaderboard from '@/components/Leaderboard';

function TextSection({ section }: { section: any }) {
  const bgColor = section.settings?.bgColor || 'transparent';
  const textColor = section.settings?.textColor || '#ffffff';

  return (
    <div style={{ backgroundColor: bgColor }} className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: textColor }}>
            {section.title}
          </h2>
        )}
        {section.content && (
          <div
            className="prose prose-lg max-w-none text-center leading-relaxed"
            style={{ color: textColor + 'cc' }}
            dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }}
          />
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
    <div style={{ backgroundColor: bgColor }} className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-white">
            {section.title}
          </h2>
        )}
        <div className="flex justify-center">
          <img
            src={section.image_url}
            alt={section.title || 'Image'}
            style={{ maxWidth: `${imageWidth}px`, width: '100%' }}
            className="rounded-2xl shadow-2xl h-auto"
          />
        </div>
        {section.content && (
          <p className="text-white/60 text-center mt-6 max-w-2xl mx-auto text-sm leading-relaxed">
            {section.content}
          </p>
        )}
      </div>
    </div>
  );
}

function RegistrationSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div className="animate-[fadeIn_0.5s_ease]">
        <RegistrationForm />
      </div>
      <div className="lg:sticky lg:top-24 animate-[fadeIn_0.5s_ease_0.2s_backwards]">
        <HowItWorks />
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

  if (error || sections === null) {
    return <FallbackPage />;
  }

  if (sections.length === 0) {
    return <FallbackPage />;
  }

  const heroSection = sections.find(s => s.section_type === 'hero');
  const otherSections = sections.filter(s => s.section_type !== 'hero');

  return (
    <>
      {heroSection && <Hero heroImageSize={heroSection.settings?.heroImageSize} />}
      {!heroSection && <Hero />}

      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #001f52 0%, #001440 50%, #000d2b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.04) 0%, transparent 60%)' }} />
          <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,56,147,0.15) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10">
          {otherSections.map(section => {
            switch (section.section_type) {
              case 'registration':
                return (
                  <div key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="text-center mb-12">
                      <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-2">Rejoignez la comp&eacute;tition</span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">Inscrivez-vous et jouez</h2>
                    </div>
                    <RegistrationSection section={section} />
                  </div>
                );
              case 'how_it_works':
                return null;
              case 'leaderboard':
                return (
                  <div key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Leaderboard />
                  </div>
                );
              case 'text':
                return <div key={section.id}><TextSection section={section} /></div>;
              case 'image':
                return <div key={section.id}><ImageSection section={section} /></div>;
              default:
                return null;
            }
          })}
        </div>
      </section>
    </>
  );
}

function FallbackPage() {
  return (
    <>
      <Hero />
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #001f52 0%, #001440 50%, #000d2b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.04) 0%, transparent 60%)' }} />
          <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,56,147,0.15) 0%, transparent 60%)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-2">Rejoignez la comp&eacute;tition</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Inscrivez-vous et jouez</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div><RegistrationForm /></div>
            <div className="lg:sticky lg:top-24"><HowItWorks /></div>
          </div>
          <div className="mt-20"><Leaderboard /></div>
        </div>
      </section>
    </>
  );
}
