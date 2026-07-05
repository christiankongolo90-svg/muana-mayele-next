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
        <section className="bg-primary-darker py-12 sm:py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div>
                <RegistrationForm />
              </div>
              <div className="lg:sticky lg:top-24">
                <HowItWorks />
              </div>
            </div>
            <div className="mt-12">
              <Leaderboard />
            </div>
          </div>
          {/* Decorative coins */}
          <span className="hidden lg:block absolute top-[15%] left-[5%] text-4xl opacity-10 animate-[float_4s_ease-in-out_infinite]">🪙</span>
          <span className="hidden lg:block absolute top-[40%] right-[8%] text-3xl opacity-10 animate-[float_3s_ease-in-out_infinite_0.5s]">🪙</span>
          <span className="hidden lg:block absolute bottom-[20%] left-[10%] text-2xl opacity-10 animate-[float_5s_ease-in-out_infinite_1s]">🪙</span>
        </section>
      </main>
      <Footer />
    </>
  );
}
