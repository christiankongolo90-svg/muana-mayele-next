import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function DELETE(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { id } = await req.json().catch(() => ({}));
    if (!id) return errorResponse('Category ID is required');
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return successResponse(null, 'Category deleted');
  } catch (err: any) { return errorResponse('Failed to delete category', 500); }
}
