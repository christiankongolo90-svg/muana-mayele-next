import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { QuizProvider } from '@/lib/quiz';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Muana Mayele — Le quiz interactif qui challenge les Congolais',
  description: 'Participez au quiz en direct, répondez rapidement et grimpez au classement national. Testez vos connaissances sur la RDC et gagnez des récompenses.',
  keywords: ['quiz', 'RDC', 'Congo', 'quiz en direct', 'culture générale', 'Muana Mayele', 'quiz congolais'],
  openGraph: {
    title: 'Muana Mayele — Quiz interactif en direct',
    description: 'Testez vos connaissances, affrontez la communauté et gagnez des récompenses. Le quiz qui challenge tous les Congolais.',
    type: 'website',
    locale: 'fr_CD',
    siteName: 'Muana Mayele',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muana Mayele — Quiz interactif en direct',
    description: 'Participez au quiz en direct et grimpez au classement national.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <QuizProvider>
            {children}
          </QuizProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
