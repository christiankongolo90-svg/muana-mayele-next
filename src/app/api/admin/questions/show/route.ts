import { NextRequest } from 'next/server';
import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { rows } = await pool.query('SELECT q.*, c.name as category_name FROM questions q JOIN categories c ON q.category_id = c.id WHERE q.id = $1', [req.nextUrl.searchParams.get('id')]);
    if (rows.length === 0) return errorResponse('Question not found', 404);
    const q = rows[0]; q.options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    return successResponse({ question: q });
  } catch (err: any) { return errorResponse('Failed to fetch question', 500); }
}
