import { Pool } from 'pg';

export async function getSettings(pool: Pool) {
  const { rows } = await pool.query('SELECT * FROM quiz_settings WHERE id = 1');
  if (rows.length === 0) {
    return { time_limit: 1200, is_open: true, schedule_enabled: false, schedule_days: null, schedule_start_time: null, schedule_end_time: null, schedule_timezone: 'Africa/Kinshasa', updated_at: new Date().toISOString() };
  }
  const s = rows[0];
  return { ...s, time_limit: Number(s.time_limit), is_open: Boolean(s.is_open), schedule_enabled: Boolean(s.schedule_enabled), schedule_days: s.schedule_days || null };
}

export async function getAccessStatus(pool: Pool) {
  const settings = await getSettings(pool);
  if (!settings.is_open) return { is_open: false, reason: 'manual', schedule: null, settings };
  if (!settings.schedule_enabled) return { is_open: true, reason: 'manual', schedule: null, settings };

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: settings.schedule_timezone }));
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 8);
  const { schedule_days: days, schedule_start_time: startTime, schedule_end_time: endTime } = settings;

  if (!days?.length || !startTime || !endTime) return { is_open: true, reason: 'schedule_incomplete', schedule: null, settings };

  const isOpen = days.includes(currentDay) && currentTime >= startTime && currentTime <= endTime;
  let nextSession: any = null;

  if (!isOpen) {
    if (days.includes(currentDay) && currentTime < startTime) {
      const [h, m] = startTime.split(':').map(Number);
      const next = new Date(now); next.setHours(h, m, 0, 0);
      nextSession = { date: next.toISOString().slice(0, 10), start: startTime, end: endTime, datetime: next.toISOString(), day_of_week: currentDay };
    } else {
      const sorted = [...days].sort((a: number, b: number) => a - b);
      let nextDay = sorted.find((d: number) => d > currentDay) ?? sorted[0];
      let daysUntil = nextDay - currentDay; if (daysUntil <= 0) daysUntil += 7;
      const next = new Date(now); next.setDate(next.getDate() + daysUntil);
      const [h, m] = startTime.split(':').map(Number); next.setHours(h, m, 0, 0);
      nextSession = { date: next.toISOString().slice(0, 10), start: startTime, end: endTime, datetime: next.toISOString(), day_of_week: next.getDay() };
    }
  }

  return { is_open: isOpen, reason: 'schedule', schedule: { enabled: true, days, start_time: startTime, end_time: endTime, timezone: settings.schedule_timezone, next_session: nextSession }, settings };
}
