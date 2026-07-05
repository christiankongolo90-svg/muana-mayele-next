import { NextRequest } from 'next/server';
import { successResponse, errorResponse, authenticateAdmin } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 20));
    const categoryId = req.nextUrl.searchParams.get('category_id');
    const search = req.nextUrl.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const conds: string[] = []; const params: any[] = []; let idx = 1;
    if (categoryId) { conds.push(`q.category_id=$${idx++}`); params.push(categoryId); }
    if (search) { conds.push(`q.question ILIKE $${idx++}`); params.push(`%${search}%`); }
    const where = conds.length > 0 ? 'WHERE ' + conds.join(' AND ') : '';

    const countRes = await pool.query(`SELECT COUNT(*) as total FROM questions q ${where}`, params);
    const qRes = await pool.query(`SELECT q.*, c.name as category_name FROM questions q JOIN categories c ON q.category_id = c.id ${where} ORDER BY q.id DESC LIMIT $${idx++} OFFSET $${idx++}`, [...params, limit, offset]);

    return successResponse({
      questions: qRes.rows.map((q: any) => ({ ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options })),
      pagination: { page, limit, total: Number(countRes.rows[0].total), pages: Math.ceil(Number(countRes.rows[0].total) / limit) },
    });
  } catch (err: any) { return errorResponse('Failed to fetch questions', 500); }
}
