import Header from '@/components/Header';
import DynamicPage from '@/components/DynamicPage';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <DynamicPage />
      </main>
      <Footer />
    </>
  );
}
