import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function POST(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { name, description } = await req.json().catch(() => ({}));
    if (!name?.trim()) return errorResponse('Category name is required');
    const { rows } = await pool.query('INSERT INTO categories (name, description) VALUES ($1,$2) RETURNING *', [name.trim(), description?.trim() || null]);
    return successResponse({ category: rows[0] }, 'Category created');
  } catch (err: any) {
    if ((err as any).code === '23505') return errorResponse('Category already exists');
    return errorResponse('Failed to create category', 500);
  }
}
