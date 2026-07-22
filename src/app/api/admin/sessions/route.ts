import { NextRequest } from 'next/server';
import { successResponse, errorResponse, authenticateAdmin } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { POINTS_PER_CORRECT } from '../../_lib/config';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 20));
    const userId = req.nextUrl.searchParams.get('user_id');
    const date = req.nextUrl.searchParams.get('date');
    const sortBy = req.nextUrl.searchParams.get('sort') || 'date';
    const offset = (page - 1) * limit;

    const conditions: string[] = []; const params: any[] = []; let idx = 1;
    if (userId) { conditions.push(`qs.user_id=$${idx++}`); params.push(userId); }
    if (date) {
      conditions.push(`qs.started_at >= $${idx++}::date AND qs.started_at < $${idx++}::date + interval '1 day'`);
      params.push(date, date);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderClause = sortBy === 'points'
      ? `ORDER BY live_points DESC, qs.started_at DESC`
      : `ORDER BY qs.started_at DESC`;

    const countRes = await pool.query(`SELECT COUNT(*) as total FROM quiz_sessions qs ${where}`, params);
    const { rows } = await pool.query(`SELECT qs.*, u.full_name, u.phone,
      (SELECT COUNT(*) FROM quiz_answers qa WHERE qa.session_id=qs.id AND qa.is_correct) as live_correct,
      (SELECT COUNT(*) FROM quiz_answers qa WHERE qa.session_id=qs.id) as live_answered,
      (SELECT COUNT(*) FROM quiz_answers qa WHERE qa.session_id=qs.id AND qa.is_correct)*${POINTS_PER_CORRECT} as live_points,
      CASE WHEN qs.is_completed THEN qs.time_taken WHEN (SELECT MAX(qa.answered_at) FROM quiz_answers qa WHERE qa.session_id=qs.id) IS NOT NULL THEN EXTRACT(EPOCH FROM ((SELECT MAX(qa.answered_at) FROM quiz_answers qa WHERE qa.session_id=qs.id)-qs.started_at))::int ELSE NULL END as live_duration
      FROM quiz_sessions qs JOIN users u ON qs.user_id=u.id ${where} ${orderClause} LIMIT $${idx++} OFFSET $${idx++}`, [...params, limit, offset]);

    return successResponse({ sessions: rows, pagination: { page, limit, total: Number(countRes.rows[0].total), pages: Math.ceil(Number(countRes.rows[0].total)/limit) } });
  } catch (err: any) { return errorResponse('Failed to fetch sessions', 500); }
}
