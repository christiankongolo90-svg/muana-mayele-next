'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { sendPasscode, verifyPasscode } from '@/lib/api';
import { countries } from '@/lib/countries';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#classement', label: 'Classement' },
  { href: '#regles', label: 'Règles' },
];

export default function Header() {
  const { user, login, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginStep, setLoginStep] = useState<'phone' | 'passcode'>('phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginCountry, setLoginCountry] = useState('+243');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setUserDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const selectedCountry = countries.find(c => c.code === loginCountry);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!loginPhone.trim()) { setError('Le numéro de téléphone est obligatoire'); return; }
    setLoading(true); setError('');
    try {
      const res = await sendPasscode({ phone: loginPhone, country_code: loginCountry, type: 'login' });
      setCountdown(res.expires_in || 300);
      setLoginStep('passcode');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (passcode.length !== 6) return;
    setLoading(true); setError('');
    try {
      const res = await verifyPasscode({ phone: loginPhone, country_code: loginCountry, passcode });
      login(res.user);
      setShowLogin(false);
      resetLogin();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  function resetLogin() { setLoginStep('phone'); setPasscode(''); setError(''); setCountdown(0); }
  function openLogin() { setShowLogin(true); resetLogin(); }
  function closeLogin() { setShowLogin(false); resetLogin(); }

  function formatCountdown() {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-primary-darker/95 backdrop-blur-lg shadow-lg shadow-black/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 lg:h-[72px]" aria-label="Navigation principale">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 text-white font-bold text-lg shrink-0" onClick={() => setMenuOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gold">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="tracking-tight">Muana Mayele</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setUserDropdown(!userDropdown)} className="flex items-center gap-2 text-white hover:bg-white/5 rounded-xl px-3 py-2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-sm font-bold text-primary-dark">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block font-medium text-sm max-w-[120px] truncate">{user.full_name.split(' ')[0]}</span>
                    <svg className={`w-4 h-4 text-white/50 transition-transform ${userDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-[fadeIn_0.15s_ease]">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-dark text-sm">{user.full_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{user.country_code} {user.phone}</p>
                      </div>
                      <DropdownItem onClick={() => { router.push('/profile'); setUserDropdown(false); setMenuOpen(false); }} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />} label="Mon Profil" />
                      <DropdownItem onClick={() => { router.push('/quiz'); setUserDropdown(false); setMenuOpen(false); }} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />} label="Jouer au Quiz" />
                      {isAdmin && (
                        <DropdownItem onClick={() => { router.push('/admin'); setUserDropdown(false); setMenuOpen(false); }} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />} label="Administration" />
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setUserDropdown(false); setMenuOpen(false); router.push('/'); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg mx-0 flex items-center gap-3 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={() => { openLogin(); setMenuOpen(false); }} className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
                    Se connecter
                  </button>
                  <a href="#inscription" className="bg-gold hover:bg-gold-dark text-primary-dark rounded-full px-5 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md" onClick={() => setMenuOpen(false)}>
                    Jouer maintenant
                  </a>
                </div>
              )}

              {/* Mobile toggle */}
              <button className="lg:hidden flex flex-col justify-center gap-[5px] p-2 -mr-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
                <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden fixed inset-0 top-16 bg-primary-darker/98 backdrop-blur-xl transition-all duration-300 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className={`flex flex-col p-6 gap-1 transition-transform duration-300 ${menuOpen ? 'translate-y-0' : '-translate-y-4'}`}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3.5 text-base font-medium transition-colors">
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-4 pt-4 flex flex-col gap-2">
              {!user && (
                <>
                  <button onClick={() => { openLogin(); setMenuOpen(false); }} className="text-white border border-white/20 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors">
                    Se connecter
                  </button>
                  <a href="#inscription" onClick={() => setMenuOpen(false)} className="bg-gold text-primary-dark rounded-xl px-4 py-3 text-sm font-bold text-center hover:bg-gold-dark transition-colors">
                    Jouer maintenant
                  </a>
                </>
              )}
              {user && (
                <button onClick={() => { router.push('/quiz'); setMenuOpen(false); }} className="bg-gold text-primary-dark rounded-xl px-4 py-3 text-sm font-bold text-center hover:bg-gold-dark transition-colors">
                  Jouer au Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeLogin}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <button onClick={closeLogin} className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {loginStep === 'phone' ? (
              <>
                <h2 className="text-xl font-bold text-dark mb-1">Connexion</h2>
                <p className="text-gray-500 text-sm mb-6">Entrez votre numéro pour recevoir un code par WhatsApp</p>
                <form onSubmit={handleSendCode}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  <div className="flex gap-2 mb-4">
                    <select value={loginCountry} onChange={e => setLoginCountry(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2.5 text-sm bg-gray-50 w-28 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="Numéro de téléphone" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none" />
                  </div>
                  {error && <p className="text-red text-sm mb-3 bg-red-50 p-2.5 rounded-xl">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Envoi...</> : 'Recevoir le code'}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Pas encore inscrit ? <a href="#inscription" onClick={closeLogin} className="text-primary font-medium hover:underline">S&apos;inscrire</a>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-dark mb-1">Vérification</h2>
                <p className="text-gray-500 text-sm mb-6">Code envoyé au {selectedCountry?.flag} {loginCountry} {loginPhone}</p>
                <form onSubmit={handleVerify}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Code de vérification</label>
                  <input type="text" value={passcode} onChange={e => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} inputMode="numeric" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] bg-gray-50 mb-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none" />
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500 mb-3">Expire dans: <strong className="text-primary">{formatCountdown()}</strong></p>
                  ) : (
                    <p className="text-sm text-red mb-3">Code expiré</p>
                  )}
                  {error && <p className="text-red text-sm mb-3 bg-red-50 p-2.5 rounded-xl">{error}</p>}
                  <button type="submit" disabled={loading || passcode.length !== 6} className="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Vérification...</> : 'Vérifier et continuer'}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <button onClick={() => { setLoginStep('phone'); setPasscode(''); setError(''); }} className="text-primary text-sm hover:underline">&larr; Modifier le numéro</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function DropdownItem({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3 text-gray-700 transition-colors rounded-lg">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
      {label}
    </button>
  );
}
