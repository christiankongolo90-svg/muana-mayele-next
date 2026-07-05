import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../_lib/helpers';
import { getPool } from '../_lib/db';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 20, 100);
    const { rows } = await pool.query('SELECT q.id, q.question, q.options, q.difficulty, c.name as category FROM questions q JOIN categories c ON q.category_id = c.id WHERE q.is_active = TRUE ORDER BY RANDOM() LIMIT $1', [limit]);
    return successResponse(rows.map((q: any) => ({ ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options })));
  } catch (err: any) {
    return errorResponse('Failed to fetch questions', 500);
  }
}
