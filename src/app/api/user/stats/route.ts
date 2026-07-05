import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get('user_id'));
  if (!userId) return errorResponse('User ID is required');

  try {
    const pool = getPool();
    const userRes = await pool.query('SELECT id, full_name, phone, country_code, email, neighborhood FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return errorResponse('User not found', 404);

    const firstRes = await pool.query('SELECT MIN(started_at) as first_quiz FROM quiz_sessions WHERE user_id = $1', [userId]);
    const statsRes = await pool.query(`SELECT COUNT(CASE WHEN is_completed THEN 1 END) as total_quizzes, COALESCE(MAX(total_points),0) as best_score, COALESCE(SUM(total_points),0) as total_points, COALESCE(AVG(CASE WHEN is_completed THEN total_points END),0) as average_score, COALESCE(SUM(correct_answers),0) as total_correct, COALESCE(SUM(wrong_answers),0) as total_wrong FROM quiz_sessions WHERE user_id = $1`, [userId]);
    const s = statsRes.rows[0];

    const rankRes = await pool.query(`SELECT COUNT(*)+1 as rank FROM (SELECT user_id, MAX(total_points) as best_score FROM quiz_sessions WHERE is_completed=TRUE GROUP BY user_id HAVING MAX(total_points)>(SELECT COALESCE(MAX(total_points),0) FROM quiz_sessions WHERE user_id=$1 AND is_completed=TRUE)) hs`, [userId]);
    const histRes = await pool.query('SELECT id as session_id, total_questions, correct_answers, wrong_answers, total_points as score, time_taken, ended_at FROM quiz_sessions WHERE user_id=$1 AND is_completed=TRUE ORDER BY ended_at DESC LIMIT 10', [userId]);

    const totalAnswers = Number(s.total_correct) + Number(s.total_wrong);

    return successResponse({
      user: { ...userRes.rows[0], id: Number(userRes.rows[0].id), member_since: firstRes.rows[0].first_quiz || new Date().toISOString() },
      stats: { total_quizzes: Number(s.total_quizzes), best_score: Number(s.best_score), total_points: Number(s.total_points), average_score: Math.round(Number(s.average_score)*10)/10, total_correct: Number(s.total_correct), total_wrong: Number(s.total_wrong), accuracy: totalAnswers > 0 ? Math.round((Number(s.total_correct)/totalAnswers)*1000)/10 : 0, rank: Number(s.total_quizzes) > 0 ? Number(rankRes.rows[0].rank) : null },
      history: histRes.rows.map((q: any) => ({ session_id: Number(q.session_id), total_questions: Number(q.total_questions), correct_answers: Number(q.correct_answers), wrong_answers: Number(q.wrong_answers), score: Number(q.score), time_taken: Number(q.time_taken), played_at: q.ended_at })),
    });
  } catch (err: any) {
    return errorResponse('Server error', 500);
  }
}
