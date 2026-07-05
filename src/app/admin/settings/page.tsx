'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { adminGetSettings, adminUpdateSettings } from '@/lib/api';

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [timeLimit, setTimeLimit] = useState(1200);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timezone, setTimezone] = useState('Africa/Kinshasa');

  useEffect(() => {
    if (!user) return;
    adminGetSettings(user.id)
      .then(data => {
        const s = data.settings;
        setSettings(s);
        setIsOpen(s.is_open || false);
        setTimeLimit(s.time_limit || 1200);
        setScheduleEnabled(s.schedule_enabled || false);
        setScheduleDays(Array.isArray(s.schedule_days) ? s.schedule_days : (typeof s.schedule_days === 'string' ? JSON.parse(s.schedule_days || '[]') : []));
        setStartTime(s.schedule_start_time || '');
        setEndTime(s.schedule_end_time || '');
        setTimezone(s.schedule_timezone || 'Africa/Kinshasa');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  function toggleDay(day: number) {
    setScheduleDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort());
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = await adminUpdateSettings(user.id, {
        is_open: isOpen,
        time_limit: timeLimit,
        schedule_enabled: scheduleEnabled,
        schedule_days: scheduleDays,
        schedule_start_time: startTime || null,
        schedule_end_time: endTime || null,
        schedule_timezone: timezone,
      });
      setSettings(data.settings);
      setSuccess('Parametres mis a jour!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggleQuiz() {
    if (!user) return;
    const newState = !isOpen;
    setIsOpen(newState);
    setSaving(true);
    try {
      await adminUpdateSettings(user.id, { is_open: newState });
      setSuccess(newState ? 'Quiz ouvert!' : 'Quiz ferme!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); setIsOpen(!newState); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Quick toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-dark">Statut du Quiz</h3>
            <p className="text-sm text-gray-500">Ouvrir ou fermer l&apos;acces au quiz</p>
          </div>
          <button onClick={toggleQuiz} disabled={saving} className={`relative w-14 h-7 rounded-full transition-colors ${isOpen ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isOpen ? 'left-7' : 'left-0.5'}`} />
          </button>
        </div>
        <p className={`text-sm mt-2 font-medium ${isOpen ? 'text-green-600' : 'text-red'}`}>
          {isOpen ? '\u2713 Quiz ouvert' : '\u2717 Quiz ferme'}
        </p>
      </div>

      {/* Time limit */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-dark mb-3">Duree du quiz</h3>
        <div className="flex items-center gap-3">
          <input type="number" value={Math.floor(timeLimit / 60)} onChange={e => setTimeLimit(Number(e.target.value) * 60)} min={1} max={60} className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center" />
          <span className="text-sm text-gray-500">minutes</span>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-dark">Horaires programmes</h3>
            <p className="text-xs text-gray-500">Ouvrir automatiquement le quiz a des horaires precis</p>
          </div>
          <button onClick={() => setScheduleEnabled(!scheduleEnabled)} className={`relative w-14 h-7 rounded-full transition-colors ${scheduleEnabled ? 'bg-primary' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${scheduleEnabled ? 'left-7' : 'left-0.5'}`} />
          </button>
        </div>

        {scheduleEnabled && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jours</label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((name, i) => (
                  <button key={i} type="button" onClick={() => toggleDay(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${scheduleDays.includes(i) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {name.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure de debut</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="Africa/Kinshasa">Africa/Kinshasa (UTC+1)</option>
                <option value="Africa/Lubumbashi">Africa/Lubumbashi (UTC+2)</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Europe/Brussels">Europe/Brussels</option>
                <option value="Europe/Oslo">Europe/Oslo</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
      {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">{success}</p>}

      <button onClick={handleSave} disabled={saving} className="bg-primary text-white rounded-lg px-6 py-3 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
        {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder les parametres'}
      </button>
    </div>
  );
}
