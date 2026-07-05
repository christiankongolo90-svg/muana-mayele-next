import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { QuizProvider } from '@/lib/quiz';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Muana Mayele - Quiz RDC',
  description: 'Testez vos connaissances sur la RDC et mesurez-vous aux autres Congolais !',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full`}>
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
