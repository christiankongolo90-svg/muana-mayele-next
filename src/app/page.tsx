import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import RegistrationForm from '@/components/RegistrationForm';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #001f52 0%, #001440 50%, #000d2b 100%)' }}>
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.04) 0%, transparent 60%)' }} />
            <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,56,147,0.15) 0%, transparent 60%)' }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            {/* Section header */}
            <div className="text-center mb-12">
              <span className="inline-block text-gold/70 text-xs font-semibold uppercase tracking-widest mb-2">Rejoignez la comp&eacute;tition</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Inscrivez-vous et jouez</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div className="animate-[fadeIn_0.5s_ease]">
                <RegistrationForm />
              </div>
              <div className="lg:sticky lg:top-24 animate-[fadeIn_0.5s_ease_0.2s_backwards]">
                <HowItWorks />
              </div>
            </div>

            {/* Leaderboard section */}
            <div className="mt-20">
              <Leaderboard />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
