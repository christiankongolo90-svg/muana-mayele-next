import { successResponse, errorResponse, authenticateAdmin } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';

export async function GET(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { rows } = await pool.query('SELECT c.*, COUNT(q.id) as question_count FROM categories c LEFT JOIN questions q ON c.id = q.category_id GROUP BY c.id ORDER BY c.name');
    return successResponse({ categories: rows });
  } catch (err: any) { return errorResponse('Failed to fetch categories', 500); }
}
