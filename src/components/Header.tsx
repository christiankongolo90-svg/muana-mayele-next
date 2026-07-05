'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { sendPasscode, verifyPasscode } from '@/lib/api';
import { countries } from '@/lib/countries';

export default function Header() {
  const { user, login, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
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
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedCountry = countries.find(c => c.code === loginCountry);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!loginPhone.trim()) { setError('Le numero de telephone est obligatoire'); return; }
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

  function resetLogin() {
    setLoginStep('phone'); setPasscode(''); setError(''); setCountdown(0);
  }

  function openLogin() { setShowLogin(true); resetLogin(); }
  function closeLogin() { setShowLogin(false); resetLogin(); }

  function formatCountdown() {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 sm:h-18">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg sm:text-xl" onClick={() => setMenuOpen(false)}>
              <span className="text-2xl">&#x1F33F;</span>
              <span>Muana Mayele</span>
            </Link>

            {/* Mobile toggle */}
            <button className="sm:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* Nav */}
            <div className={`${menuOpen ? 'flex' : 'hidden'} sm:flex absolute sm:relative top-16 sm:top-0 left-0 right-0 sm:left-auto sm:right-auto flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-6 bg-primary sm:bg-transparent p-4 sm:p-0 shadow-lg sm:shadow-none`}>
              <Link href="/" className="text-white/80 hover:text-white py-2 sm:py-0 transition-colors text-sm font-medium" onClick={() => setMenuOpen(false)}>Accueil</Link>
              <a href="#classement" className="text-white/80 hover:text-white py-2 sm:py-0 transition-colors text-sm font-medium" onClick={() => setMenuOpen(false)}>Classement</a>
              <a href="#regles" className="text-white/80 hover:text-white py-2 sm:py-0 transition-colors text-sm font-medium" onClick={() => setMenuOpen(false)}>Règles</a>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setUserDropdown(!userDropdown)} className="flex items-center gap-2 text-white py-2 sm:py-0">
                    <span className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-sm">&#x1F464;</span>
                    <span className="font-medium text-sm">{user.full_name.split(' ')[0]}</span>
                    <span className={`text-xs transition-transform ${userDropdown ? 'rotate-180' : ''}`}>&#x25BC;</span>
                  </button>
                  {userDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-[fadeIn_0.2s_ease]">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-dark text-sm">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.country_code} {user.phone}</p>
                      </div>
                      <button onClick={() => { router.push('/profile'); setUserDropdown(false); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3">
                        <span>&#x1F4CA;</span> Mon Profil
                      </button>
                      <button onClick={() => { router.push('/quiz'); setUserDropdown(false); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3">
                        <span>&#x1F3AE;</span> Jouer au Quiz
                      </button>
                      {isAdmin && (
                        <button onClick={() => { router.push('/admin'); setUserDropdown(false); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3">
                          <span>&#x2699;&#xFE0F;</span> Administration
                        </button>
                      )}
                      <div className="border-t border-gray-100 mt-1" />
                      <button onClick={() => { logout(); setUserDropdown(false); setMenuOpen(false); router.push('/'); }} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm flex items-center gap-3 text-red-600">
                        <span>&#x1F6AA;</span> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <button onClick={() => { openLogin(); setMenuOpen(false); }} className="text-white border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-white/10 transition-colors">
                    Se connecter
                  </button>
                  <a href="#inscription" className="bg-gold text-primary-dark rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-gold-dark transition-colors" onClick={() => setMenuOpen(false)}>
                    S&apos;inscrire
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeLogin}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <button onClick={closeLogin} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>

            {loginStep === 'phone' ? (
              <>
                <h2 className="text-xl font-bold text-dark mb-1">Connexion</h2>
                <p className="text-gray-500 text-sm mb-6">Entrez votre numéro pour recevoir un code par WhatsApp</p>
                <form onSubmit={handleSendCode}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  <div className="flex gap-2 mb-4">
                    <select value={loginCountry} onChange={e => setLoginCountry(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2.5 text-sm bg-white w-28">
                      {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="Numéro de téléphone" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                  </div>
                  {error && <p className="text-red text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><span className="spinner" /> Envoi...</> : 'Recevoir le code'}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Pas encore inscrit ? <a href="#inscription" onClick={closeLogin} className="text-primary font-medium hover:underline">S&apos;inscrire</a>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-dark mb-1">Vérification</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Code envoyé au {selectedCountry?.flag} {loginCountry} {loginPhone}
                </p>
                <form onSubmit={handleVerify}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Code de vérification</label>
                  <input type="text" value={passcode} onChange={e => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} inputMode="numeric" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] mb-3 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500 mb-3">Expire dans: <strong>{formatCountdown()}</strong></p>
                  ) : (
                    <p className="text-sm text-red mb-3">Code expiré</p>
                  )}
                  {error && <p className="text-red text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>}
                  <button type="submit" disabled={loading || passcode.length !== 6} className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><span className="spinner" /> Verification...</> : 'Vérifier et continuer'}
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
