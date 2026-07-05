import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { id, ...data } = await req.json().catch(() => ({}));
    if (!id) return errorResponse('Question ID is required');

    const allowed = ['category_id','question','correct_answer','difficulty','is_active'];
    const sets: string[] = []; const params: any[] = []; let idx = 1;
    for (const f of allowed) { if (data[f] !== undefined) { sets.push(`${f}=$${idx++}`); params.push(f === 'is_active' ? Boolean(data[f]) : data[f]); } }
    if (data.options !== undefined) { sets.push(`options=$${idx++}`); params.push(JSON.stringify(data.options)); }
    if (sets.length === 0) return errorResponse('No fields to update');

    params.push(id);
    const { rows } = await pool.query(`UPDATE questions SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`, params);
    if (rows.length === 0) return errorResponse('Question not found', 404);
    return successResponse({ question: rows[0] });
  } catch (err: any) { return errorResponse('Failed to update question', 500); }
}
