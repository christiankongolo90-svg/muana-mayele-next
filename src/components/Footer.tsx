'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-deepest relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-white font-bold text-lg mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gold">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="tracking-tight">Muana Mayele</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-[260px]">
              Le quiz interactif qui réunit, challenge et récompense les Congolais.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white/70 mb-4 text-xs uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/">Accueil</FooterLink>
              <FooterLink href="#comment-ca-marche">Comment ça marche</FooterLink>
              <FooterLink href="#classement">Classement</FooterLink>
              <FooterLink href="#inscription">S&apos;inscrire</FooterLink>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-semibold text-white/70 mb-4 text-xs uppercase tracking-widest">Informations</h4>
            <ul className="space-y-2.5">
              <FooterLink href="#regles">Règles du quiz</FooterLink>
              <FooterLink href="#">Conditions d&apos;utilisation</FooterLink>
              <FooterLink href="#">Politique de confidentialité</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white/70 mb-4 text-xs uppercase tracking-widest">Suivez-nous</h4>
            <div className="flex gap-2.5">
              <SocialIcon href="https://facebook.com" label="Facebook">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </SocialIcon>
              <SocialIcon href="https://tiktok.com" label="TikTok">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </SocialIcon>
            </div>
            <p className="text-white/25 text-xs mt-4 leading-relaxed">
              Résultats, annonces et meilleurs moments du quiz.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-sm">&copy; {year} Muana Mayele. Tous droits réservés.</p>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-3.5 rounded-[2px] overflow-hidden flex flex-col">
              <div className="flex-1 bg-[#007FFF]" />
              <div className="flex-1 bg-[#CE1126]" />
              <div className="h-[2px] bg-[#F7D618]" />
            </div>
            <span className="text-white/25 text-xs">RD Congo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-white/35 hover:text-white/70 text-sm transition-colors inline-flex items-center gap-1 group">
        <svg className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-50 group-hover:ml-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.12] transition-all hover:-translate-y-0.5 group">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5 text-white/40 group-hover:text-white/70 transition-colors">
        {children}
      </svg>
    </a>
  );
}
