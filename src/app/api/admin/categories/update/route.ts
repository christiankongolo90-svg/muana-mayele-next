import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { id, name, description } = await req.json().catch(() => ({}));
    if (!id) return errorResponse('Category ID is required');
    const { rows } = await pool.query('UPDATE categories SET name=COALESCE($1,name), description=COALESCE($2,description) WHERE id=$3 RETURNING *', [name?.trim()||null, description?.trim()||null, id]);
    if (rows.length === 0) return errorResponse('Category not found', 404);
    return successResponse({ category: rows[0] });
  } catch (err: any) { return errorResponse('Failed to update category', 500); }
}
