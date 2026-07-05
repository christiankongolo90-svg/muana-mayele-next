import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { id, ...data } = await req.json().catch(() => ({}));
    if (!id) return errorResponse('User ID is required');

    const allowed = ['full_name','email','phone','country_code','profession','neighborhood','role'];
    const sets: string[] = []; const params: any[] = []; let idx = 1;
    for (const f of allowed) { if (data[f] !== undefined) { sets.push(`${f}=$${idx++}`); params.push(data[f]); } }
    if (sets.length === 0) return errorResponse('No fields to update');

    params.push(id);
    const { rows } = await pool.query(`UPDATE users SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`, params);
    if (rows.length === 0) return errorResponse('User not found', 404);
    return successResponse({ user: rows[0] });
  } catch (err: any) { return errorResponse('Failed to update user', 500); }
}
