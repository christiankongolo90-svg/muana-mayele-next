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
        <div className="bg-primary-darker py-1" />
        <RegistrationForm />
        <HowItWorks />
        <Leaderboard />
      </main>
      <Footer />
    </>
  );
}
