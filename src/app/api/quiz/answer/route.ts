import { successResponse, errorResponse } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { POINTS_PER_CORRECT } from '../../_lib/config';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { session_id, question_id, selected_answer } = body;
  if (session_id == null || question_id == null || selected_answer == null) return errorResponse('Missing required fields');

  try {
    const pool = getPool();
    const sessRes = await pool.query('SELECT id, is_completed FROM quiz_sessions WHERE id = $1', [session_id]);
    if (sessRes.rows.length === 0) return errorResponse('Session not found', 404);
    if (sessRes.rows[0].is_completed) return errorResponse('Quiz already completed');

    const qRes = await pool.query('SELECT correct_answer FROM questions WHERE id = $1', [question_id]);
    if (qRes.rows.length === 0) return errorResponse('Question not found', 404);

    const isCorrect = Number(selected_answer) === Number(qRes.rows[0].correct_answer);
    await pool.query('INSERT INTO quiz_answers (session_id, question_id, selected_answer, is_correct) VALUES ($1,$2,$3,$4)', [session_id, question_id, selected_answer, isCorrect]);

    const response: any = { is_correct: isCorrect, points_earned: isCorrect ? POINTS_PER_CORRECT : 0 };
    if (isCorrect) response.correct_answer = Number(qRes.rows[0].correct_answer);
    return successResponse(response);
  } catch (err: any) {
    return errorResponse('Failed to submit answer', 500);
  }
}
