'use client';

import { useReveal } from '@/lib/useReveal';

const prizes = [
  { rank: '1re place', amount: '20 $', color: 'from-gold to-gold-dark', textColor: 'text-primary-dark', size: 'text-3xl', ringColor: 'ring-gold/30' },
  { rank: '2e place', amount: '15 $', color: 'from-white/20 to-white/10', textColor: 'text-white', size: 'text-2xl', ringColor: 'ring-white/15' },
  { rank: '3e place', amount: '10 $', color: 'from-white/15 to-white/5', textColor: 'text-white', size: 'text-2xl', ringColor: 'ring-white/10' },
  { rank: '4e et 5e places', amount: '5 $', color: 'from-white/10 to-white/5', textColor: 'text-white/80', size: 'text-xl', ringColor: 'ring-white/5' },
];

export default function Prizes() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal surface-mid py-14 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-3">Récompenses</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Des prix à chaque session</h2>
          <p className="text-white/50 text-sm sm:text-lg max-w-xl mx-auto">Les meilleurs joueurs sont récompensés. Plus vous êtes rapide et précis, plus vous gagnez.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto lg:max-w-none">
          {prizes.map((prize, i) => (
            <div key={prize.rank} className={`glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 ${i === 0 ? 'ring-2 ring-gold/25 bg-gold/[0.06]' : ''}`}>
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${prize.color} flex items-center justify-center mx-auto mb-3 ring-4 ${prize.ringColor}`}>
                <span className={`font-bold ${prize.textColor} text-sm`}>{i + 1}</span>
              </div>
              <span className={`block font-bold text-white ${prize.size} mb-1`}>{prize.amount}</span>
              <span className="block text-white/40 text-sm">{prize.rank}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-8 max-w-md mx-auto">
          Les récompenses peuvent varier selon la session. Consultez les règles avant de participer.
        </p>
      </div>
    </section>
  );
}
