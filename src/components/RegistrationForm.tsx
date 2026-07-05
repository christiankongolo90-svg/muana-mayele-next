'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { sendPasscode, verifyPasscode } from '@/lib/api';
import { countries } from '@/lib/countries';
import { drcLocations } from '@/lib/locations';

export default function RegistrationForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'login' | 'passcode'>('form');
  const [formData, setFormData] = useState({
    fullName: '', profession: '', neighborhood: '', phone: '', countryCode: '+243', email: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocations, setShowLocations] = useState(false);
  const [passcodeType, setPasscodeType] = useState<'register' | 'login'>('register');

  const selectedCountry = countries.find(c => c.code === formData.countryCode);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const filteredLocations = useMemo(() => {
    if (!locationQuery || locationQuery.length < 2) return [];
    const q = locationQuery.toLowerCase();
    return drcLocations.filter(l => l.toLowerCase().includes(q)).slice(0, 10);
  }, [locationQuery]);

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function formatCountdown() {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.fullName.trim()) { setError('Le nom complet est obligatoire'); return; }
    if (!formData.neighborhood.trim()) { setError('Le quartier/ville est obligatoire'); return; }
    if (!formData.phone.trim()) { setError('Le numero de telephone est obligatoire'); return; }
    if (!acceptTerms) { setError('Veuillez accepter les conditions'); return; }
    setLoading(true); setError('');
    try {
      const res = await sendPasscode({
        phone: formData.phone, country_code: formData.countryCode, type: 'register', full_name: formData.fullName,
      });
      setCountdown(res.expires_in || 300);
      setPasscodeType('register');
      setStep('passcode');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.phone.trim()) { setError('Le numero de telephone est obligatoire'); return; }
    setLoading(true); setError('');
    try {
      const res = await sendPasscode({ phone: formData.phone, country_code: formData.countryCode, type: 'login' });
      setCountdown(res.expires_in || 300);
      setPasscodeType('login');
      setStep('passcode');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (passcode.length !== 6) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await verifyPasscode({
        phone: formData.phone,
        country_code: formData.countryCode,
        passcode,
        full_name: formData.fullName || undefined,
        email: formData.email || undefined,
        profession: formData.profession || undefined,
        neighborhood: formData.neighborhood || undefined,
      });
      login(res.user);
      setSuccess(res.is_new ? 'Compte cree avec succes!' : 'Connexion reussie!');
      setTimeout(() => router.push('/quiz'), 1500);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function resendCode() {
    setLoading(true); setError('');
    try {
      const res = await sendPasscode({
        phone: formData.phone, country_code: formData.countryCode, type: passcodeType,
        ...(passcodeType === 'register' ? { full_name: formData.fullName } : {}),
      });
      setCountdown(res.expires_in || 300);
      setSuccess('Code renvoye!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (user) {
    return (
      <section id="inscription" className="py-16 bg-primary-darker">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <span className="text-4xl block mb-3">&#x2705;</span>
            <h2 className="text-xl font-bold text-dark mb-2">Vous etes connecte</h2>
            <p className="text-gray-500 mb-6">Bienvenue, {user.full_name}!</p>
            <button onClick={() => router.push('/quiz')} className="bg-primary text-white rounded-full px-8 py-3 font-semibold hover:bg-primary-dark transition-colors">
              &#x1F3AE; Jouer au Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inscription" className="py-16 bg-primary-darker">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-[fadeIn_0.3s_ease]">

          {step === 'form' && (
            <>
              <h2 className="text-xl font-bold text-dark mb-6 text-center">Inscription</h2>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet <span className="text-red">*</span></label>
                  <input type="text" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Entrez votre nom complet" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input type="text" value={formData.profession} onChange={e => updateField('profession', e.target.value)} placeholder="Votre profession" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quartier / Ville <span className="text-red">*</span></label>
                  <input type="text" value={formData.neighborhood} onChange={e => { updateField('neighborhood', e.target.value); setLocationQuery(e.target.value); setShowLocations(true); }} onBlur={() => setTimeout(() => setShowLocations(false), 200)} placeholder="Tapez votre quartier ou ville (ex: Gombe, Lemba...)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required autoComplete="off" />
                  {showLocations && filteredLocations.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                      {filteredLocations.map(loc => (
                        <button key={loc} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors" onMouseDown={() => { updateField('neighborhood', loc); setShowLocations(false); }}>
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telephone <span className="text-red">*</span></label>
                  <div className="flex gap-2">
                    <select value={formData.countryCode} onChange={e => updateField('countryCode', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2.5 text-sm bg-white w-28">
                      {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Numero de telephone" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">Le code sera envoye par WhatsApp</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
                  <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="votre@email.com (optionnel)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-1 accent-primary" />
                  <span className="text-xs text-gray-600">Je confirme avoir plus de 18 ans et j&apos;accepte les conditions d&apos;utilisation.</span>
                </label>
                {error && <p className="text-red text-sm bg-red-50 p-2.5 rounded-lg">{error}</p>}
                <button type="submit" disabled={!acceptTerms || loading} className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><span className="spinner" /> Envoi du code...</> : "S'inscrire"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Deja inscrit ? <button type="button" onClick={() => { setStep('login'); setError(''); }} className="text-primary font-medium hover:underline">Se connecter</button>
                </p>
              </form>
            </>
          )}

          {step === 'login' && (
            <>
              <h2 className="text-xl font-bold text-dark mb-6 text-center">Connexion</h2>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telephone <span className="text-red">*</span></label>
                  <div className="flex gap-2">
                    <select value={formData.countryCode} onChange={e => updateField('countryCode', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2.5 text-sm bg-white w-28">
                      {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Numero de telephone" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">Un code sera envoye par WhatsApp</span>
                </div>
                {error && <p className="text-red text-sm bg-red-50 p-2.5 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><span className="spinner" /> Envoi du code...</> : 'Recevoir le code'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Pas encore inscrit ? <button type="button" onClick={() => { setStep('form'); setError(''); }} className="text-primary font-medium hover:underline">S&apos;inscrire</button>
                </p>
              </form>
            </>
          )}

          {step === 'passcode' && (
            <>
              <h2 className="text-xl font-bold text-dark mb-2 text-center">Verification</h2>
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm">Un code a 6 chiffres a ete envoye par WhatsApp au:</p>
                <p className="font-semibold text-dark mt-1">{selectedCountry?.flag} {formData.countryCode} {formData.phone}</p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code de verification</label>
                  <input type="tel" value={passcode} onChange={e => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} inputMode="numeric" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" autoComplete="one-time-code" />
                </div>
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">Code valide pendant: <strong>{formatCountdown()}</strong></p>
                ) : (
                  <p className="text-sm text-red">Code expire</p>
                )}
                {success && <p className="text-green-600 text-sm bg-green-50 p-2.5 rounded-lg">{success}</p>}
                {error && <p className="text-red text-sm bg-red-50 p-2.5 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading || passcode.length !== 6} className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><span className="spinner" /> Verification...</> : 'Verifier et continuer'}
                </button>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <button type="button" onClick={resendCode} disabled={loading} className="text-primary hover:underline">Renvoyer le code</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={() => { setStep(passcodeType === 'register' ? 'form' : 'login'); setPasscode(''); setError(''); }} className="text-primary hover:underline">Modifier le numero</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
