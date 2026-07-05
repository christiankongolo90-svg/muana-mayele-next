'use client';

import { useState, useEffect } from 'react';
import { getSiteContent } from '@/lib/api';

const defaultSteps = [
  { title: 'Inscrivez-vous', description: 'Créez gratuitement un compte participant de façon simple et sécurisée.' },
  { title: 'Participez au quiz en direct', description: 'Répondez aux questions dans le temps imparti.' },
  { title: 'Accumulez des points', description: 'Gagnez des points en répondant correctement et rapidement!' },
  { title: 'Gagnez 50 $', description: 'Le meilleur joueur remporte le prix!' },
];

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
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <span className="w-2 h-2 bg-gold rounded-full" />
          {title}
        </h2>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 group hover:translate-x-1 transition-transform">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark text-primary-dark flex items-center justify-center text-sm font-bold shrink-0 shadow-lg">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{step.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
