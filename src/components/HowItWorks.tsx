'use client';

import { useState, useEffect } from 'react';
import { getSiteContent } from '@/lib/api';

const defaultSteps = [
  { title: 'Inscrivez-vous', description: 'Créez gratuitement un compte participant de façon simple et sécurisée.' },
  { title: 'Participez au quiz en direct', description: 'Répondez aux questions dans le temps imparti.' },
  { title: 'Accumulez des points', description: 'Gagnez des points en répondant correctement et rapidement!' },
  { title: 'Gagnez 50 $', description: 'Le meilleur joueur remporte le prix!' },
];

const stepIcons = ['&#x270D;&#xFE0F;', '&#x1F3AE;', '&#x2B50;', '&#x1F3C6;'];

export default function HowItWorks() {
  const [title, setTitle] = useState('Comment ça marche ?');
  const [steps, setSteps] = useState(defaultSteps);

  useEffect(() => {
    getSiteContent()
      .then(data => {
        const items = data?.content || [];
        const get = (section: string, key: string, fallback: string) => {
          const item = items.find((c: any) => c.section === section && c.content_key === key);
          return item?.content_value || fallback;
        };

        setTitle(get('how_it_works', 'section_title', 'Comment ça marche ?'));

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
    <div id="regles">
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
            <span className="w-2 h-2 bg-gold rounded-full" />
          </div>
          {title}
        </h2>
        <div className="space-y-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 group p-3 rounded-xl hover:bg-white/5 transition-all">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/25 to-gold/10 border border-gold/20 text-white flex items-center justify-center text-lg shadow-lg">
                  <span dangerouslySetInnerHTML={{ __html: stepIcons[i] || `${i + 1}` }} />
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-gold/30 to-transparent" />
                )}
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-gold transition-colors">{step.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
