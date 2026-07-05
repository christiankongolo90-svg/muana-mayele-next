import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { id, ...data } = await req.json().catch(() => ({}));
    if (!id) return errorResponse('Session ID is required');
    const allowed = ['total_questions','correct_answers','wrong_answers','score','total_points','percentage','time_taken'];
    const sets: string[] = []; const params: any[] = []; let idx = 1;
    for (const f of allowed) { if (data[f] !== undefined) { sets.push(`${f}=$${idx++}`); params.push(data[f]); } }
    if (sets.length === 0) return errorResponse('No fields to update');
    params.push(id);
    const { rows } = await pool.query(`UPDATE quiz_sessions SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`, params);
    if (rows.length === 0) return errorResponse('Session not found', 404);
    return successResponse({ session: rows[0] });
  } catch (err: any) { return errorResponse('Failed to update session', 500); }
}
