import { NextRequest } from 'next/server';
import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return errorResponse('Session ID is required');
    const sessRes = await pool.query('SELECT qs.*, u.full_name FROM quiz_sessions qs JOIN users u ON qs.user_id=u.id WHERE qs.id=$1', [id]);
    if (sessRes.rows.length === 0) return errorResponse('Session not found', 404);
    const ansRes = await pool.query('SELECT qa.*, q.question, q.options, q.correct_answer, c.name as category FROM quiz_answers qa JOIN questions q ON qa.question_id=q.id JOIN categories c ON q.category_id=c.id WHERE qa.session_id=$1 ORDER BY qa.id', [id]);
    return successResponse({ session: sessRes.rows[0], answers: ansRes.rows.map((a: any) => ({ ...a, options: typeof a.options === 'string' ? JSON.parse(a.options) : a.options })) });
  } catch (err: any) { return errorResponse('Failed to fetch session', 500); }
}
