import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function POST(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { category_id, question, options, correct_answer, difficulty = 'medium', is_active = true } = await req.json().catch(() => ({}));
    if (!category_id || !question || !options || correct_answer == null) return errorResponse('Missing required fields');
    const { rows } = await pool.query('INSERT INTO questions (category_id, question, options, correct_answer, difficulty, is_active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [category_id, question, JSON.stringify(options), correct_answer, difficulty, is_active]);
    return successResponse({ question: rows[0] }, 'Question created');
  } catch (err: any) { return errorResponse('Failed to create question', 500); }
}
