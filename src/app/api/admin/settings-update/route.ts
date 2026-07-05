import { successResponse, errorResponse, authenticateAdmin } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { getSettings } from '../../_lib/settings';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const data = await req.json().catch(() => ({}));

    const sets: string[] = []; const params: any[] = []; let idx = 1;
    if (data.time_limit != null) { sets.push(`time_limit=$${idx++}`); params.push(Number(data.time_limit)); }
    if (data.is_open != null) { sets.push(`is_open=$${idx++}`); params.push(Boolean(data.is_open)); }
    if (data.schedule_enabled != null) { sets.push(`schedule_enabled=$${idx++}`); params.push(Boolean(data.schedule_enabled)); }
    if (data.schedule_days !== undefined) { if (Array.isArray(data.schedule_days)) { sets.push(`schedule_days=$${idx++}`); params.push(JSON.stringify(data.schedule_days.map(Number))); } else { sets.push('schedule_days=NULL'); } }
    if (data.schedule_start_time !== undefined) { if (data.schedule_start_time) { sets.push(`schedule_start_time=$${idx++}`); params.push(data.schedule_start_time); } else { sets.push('schedule_start_time=NULL'); } }
    if (data.schedule_end_time !== undefined) { if (data.schedule_end_time) { sets.push(`schedule_end_time=$${idx++}`); params.push(data.schedule_end_time); } else { sets.push('schedule_end_time=NULL'); } }
    if (data.schedule_timezone) { sets.push(`schedule_timezone=$${idx++}`); params.push(data.schedule_timezone); }
    if (sets.length === 0) return errorResponse('No valid fields to update');

    await pool.query(`UPDATE quiz_settings SET ${sets.join(',')} WHERE id=1`, params);
    return successResponse({ settings: await getSettings(pool) });
  } catch (err: any) {
    return errorResponse('Failed to update settings', 500);
  }
}
