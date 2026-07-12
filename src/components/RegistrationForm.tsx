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
    if (!formData.phone.trim()) { setError('Le numéro de téléphone est obligatoire'); return; }
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
    if (!formData.phone.trim()) { setError('Le numéro de téléphone est obligatoire'); return; }
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
      setSuccess(res.is_new ? 'Compte créé avec succès!' : 'Connexion réussie!');
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
      setSuccess('Code renvoyé!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputClasses = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all";

  if (user) {
    return (
      <div id="inscription">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">&#x2705;</span>
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">Vous êtes connecté</h2>
          <p className="text-gray-500 mb-6">Bienvenue, {user.full_name}!</p>
          <button onClick={() => router.push('/quiz')} className="btn-cta inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-primary-dark">
            &#x1F3AE; Jouer au Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="inscription">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-[fadeIn_0.3s_ease] border border-gray-100">

        {step === 'form' && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">&#x270D;&#xFE0F;</span>
              </div>
              <h2 className="text-xl font-bold text-dark">Inscription</h2>
              <p className="text-gray-400 text-sm mt-1">Créez votre compte en quelques secondes</p>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet <span className="text-red">*</span></label>
                <input type="text" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Entrez votre nom complet" className={inputClasses} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession</label>
                <input type="text" value={formData.profession} onChange={e => updateField('profession', e.target.value)} placeholder="Votre profession" className={inputClasses} />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quartier / Ville <span className="text-red">*</span></label>
                <input type="text" value={formData.neighborhood} onChange={e => { updateField('neighborhood', e.target.value); setLocationQuery(e.target.value); setShowLocations(true); }} onBlur={() => setTimeout(() => setShowLocations(false), 200)} placeholder="Tapez votre quartier ou ville (ex: Gombe, Lemba...)" className={inputClasses} required autoComplete="off" />
                {showLocations && filteredLocations.length > 0 && (
                  <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto">
                    {filteredLocations.map(loc => (
                      <button key={loc} type="button" className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors" onMouseDown={() => { updateField('neighborhood', loc); setShowLocations(false); }}>
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone <span className="text-red">*</span></label>
                <div className="flex gap-2">
                  <select value={formData.countryCode} onChange={e => updateField('countryCode', e.target.value)} className="border border-gray-200 rounded-xl px-2 py-3 text-sm bg-gray-50/50 w-28 focus:ring-2 focus:ring-primary/20 outline-none">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                  <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Numéro de téléphone" className={`flex-1 ${inputClasses.replace('w-full ', '')}`} required />
                </div>
                <span className="text-xs text-gray-400 mt-1.5 block flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.612l4.458-1.495A11.96 11.96 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.327 0-4.542-.677-6.444-1.937l-.448-.296-3.096 1.038 1.038-3.096-.296-.448A9.96 9.96 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                  Le code sera envoyé par WhatsApp
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
                <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="votre@email.com (optionnel)" className={inputClasses} />
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-0.5 accent-primary w-4 h-4" />
                <span className="text-xs text-gray-600 leading-relaxed">Je confirme avoir plus de 18 ans et j&apos;accepte les conditions d&apos;utilisation.</span>
              </label>
              {error && <p className="text-red text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
              <button type="submit" disabled={!acceptTerms || loading} className="w-full bg-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                {loading ? <><span className="spinner" /> Envoi du code...</> : "S'inscrire"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Déjà inscrit ? <button type="button" onClick={() => { setStep('login'); setError(''); }} className="text-primary font-medium hover:underline">Se connecter</button>
              </p>
            </form>
          </>
        )}

        {step === 'login' && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">&#x1F511;</span>
              </div>
              <h2 className="text-xl font-bold text-dark">Connexion</h2>
              <p className="text-gray-400 text-sm mt-1">Entrez votre numéro pour recevoir un code</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone <span className="text-red">*</span></label>
                <div className="flex gap-2">
                  <select value={formData.countryCode} onChange={e => updateField('countryCode', e.target.value)} className="border border-gray-200 rounded-xl px-2 py-3 text-sm bg-gray-50/50 w-28 focus:ring-2 focus:ring-primary/20 outline-none">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                  <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Numéro de téléphone" className={`flex-1 ${inputClasses.replace('w-full ', '')}`} required />
                </div>
                <span className="text-xs text-gray-400 mt-1.5 block">Un code sera envoyé par WhatsApp</span>
              </div>
              {error && <p className="text-red text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
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
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">&#x1F4AC;</span>
              </div>
              <h2 className="text-xl font-bold text-dark">Vérification</h2>
              <p className="text-gray-500 text-sm mt-2">Un code à 6 chiffres a été envoyé par WhatsApp au:</p>
              <p className="font-semibold text-dark mt-1">{selectedCountry?.flag} {formData.countryCode} {formData.phone}</p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Code de vérification</label>
                <input type="tel" value={passcode} onChange={e => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} inputMode="numeric" className="w-full border border-gray-200 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] bg-gray-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all" autoComplete="one-time-code" />
              </div>
              {countdown > 0 ? (
                <p className="text-sm text-gray-500 text-center">Code valide pendant: <strong className="text-primary">{formatCountdown()}</strong></p>
              ) : (
                <p className="text-sm text-red text-center">Code expiré</p>
              )}
              {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl border border-green-100 text-center">{success}</p>}
              {error && <p className="text-red text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
              <button type="submit" disabled={loading || passcode.length !== 6} className="w-full bg-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                {loading ? <><span className="spinner" /> Vérification...</> : 'Vérifier et continuer'}
              </button>
              <div className="flex items-center justify-center gap-3 text-sm">
                <button type="button" onClick={resendCode} disabled={loading} className="text-primary hover:underline font-medium">Renvoyer le code</button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={() => { setStep(passcodeType === 'register' ? 'form' : 'login'); setPasscode(''); setError(''); }} className="text-primary hover:underline font-medium">Modifier le numéro</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
