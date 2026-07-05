import { NextRequest } from 'next/server';
import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return errorResponse('User ID is required');
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length === 0) return errorResponse('User not found', 404);
    return successResponse({ user: rows[0] });
  } catch (err: any) { return errorResponse('Failed to fetch user', 500); }
}
