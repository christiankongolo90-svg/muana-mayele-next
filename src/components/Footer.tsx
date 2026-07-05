'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-darker text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 text-xl font-bold mb-3">
              <span className="text-2xl">&#x1F33F;</span>
              <span>Muana Mayele</span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed">
              Le quiz qui met des étoiles dans vos têtes.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-semibold text-gold mb-3 text-sm uppercase tracking-wider">Menu</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-white/60 hover:text-white text-sm transition-colors">Accueil</a></li>
              <li><a href="#classement" className="text-white/60 hover:text-white text-sm transition-colors">Classement</a></li>
              <li><a href="#regles" className="text-white/60 hover:text-white text-sm transition-colors">Règles</a></li>
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="font-semibold text-gold mb-3 text-sm uppercase tracking-wider">Aide</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Conditions d&apos;utilisation</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-gold mb-3 text-sm uppercase tracking-wider">Suivez-nous</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/40 text-sm">&copy; {year} Muana Mayele. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
