import { successResponse, errorResponse } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { getAccessStatus } from '../../_lib/settings';
import { POINTS_PER_CORRECT, QUIZ_TOTAL_QUESTIONS } from '../../_lib/config';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = Number(body.user_id);
  if (!userId) return errorResponse('User ID is required');

  try {
    const pool = getPool();
    const access = await getAccessStatus(pool);

    if (!access.is_open) {
      let message = 'Le quiz est actuellement fermé. Revenez plus tard.';
      if (access.schedule?.next_session) {
        const ns = access.schedule.next_session;
        const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
        message = `Le quiz n'est pas encore ouvert. Prochaine session : ${dayNames[ns.day_of_week] || ''} de ${ns.start?.slice(0,5)} à ${ns.end?.slice(0,5)}.`;
      }
      return errorResponse(message, 403);
    }

    const userRes = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return errorResponse('User not found', 404);

    // Compute the start of the current session window
    const tz = access.schedule?.timezone || 'Africa/Kinshasa';
    const windowStartRes = await pool.query(
      `SELECT (NOW() AT TIME ZONE $1)::date + $2::time AS window_start`,
      [tz, access.schedule?.enabled && access.schedule.start_time ? access.schedule.start_time : '00:00']
    );
    const windowStart = windowStartRes.rows[0].window_start;

    // Check if already played this session window
    const existing = await pool.query(
      `SELECT id FROM quiz_sessions WHERE user_id = $1 AND started_at >= ($2::timestamp AT TIME ZONE $3) LIMIT 1`,
      [userId, windowStart, tz]
    );
    if (existing.rows.length > 0) return errorResponse('Vous avez déjà participé au quiz durant cette session. Revenez à la prochaine session !', 429);

    // Exclude questions answered within last 5 months
    const prevRes = await pool.query(
      `SELECT DISTINCT qa.question_id FROM quiz_answers qa
       JOIN quiz_sessions qs ON qa.session_id = qs.id
       WHERE qs.user_id = $1 AND qs.started_at >= NOW() - INTERVAL '5 months'`,
      [userId]
    );
    let excludeIds = prevRes.rows.map((r: any) => r.question_id);

    // Check if enough unseen within the 5-month window
    if (excludeIds.length > 0) {
      const countRes = await pool.query('SELECT COUNT(*) as c FROM questions WHERE is_active = TRUE AND id != ALL($1::int[])', [excludeIds]);
      if (Number(countRes.rows[0].c) < QUIZ_TOTAL_QUESTIONS) excludeIds = [];
    }

    // Select weighted: 10% easy, 30% medium, 60% hard
    const allQuestions: any[] = [];
    for (const [diff, count] of [['easy', 2], ['medium', 6], ['hard', 12]] as const) {
      const params: any[] = [diff, count];
      let q = 'SELECT q.id, q.question, q.options, q.correct_answer, q.difficulty, c.name as category FROM questions q JOIN categories c ON q.category_id = c.id WHERE q.is_active = TRUE AND q.difficulty = $1';
      if (excludeIds.length > 0) { q += ' AND q.id != ALL($3::int[])'; params.push(excludeIds); }
      q += ' ORDER BY RANDOM() LIMIT $2';
      const { rows } = await pool.query(q, params);
      allQuestions.push(...rows);
    }

    // Fill if needed
    if (allQuestions.length < QUIZ_TOTAL_QUESTIONS) {
      const gotIds = allQuestions.map(q => q.id);
      const allExclude = [...excludeIds, ...gotIds];
      const params: any[] = [QUIZ_TOTAL_QUESTIONS - allQuestions.length];
      let q = 'SELECT q.id, q.question, q.options, q.correct_answer, q.difficulty, c.name as category FROM questions q JOIN categories c ON q.category_id = c.id WHERE q.is_active = TRUE';
      if (allExclude.length > 0) { q += ' AND q.id != ALL($2::int[])'; params.push(allExclude); }
      q += ' ORDER BY RANDOM() LIMIT $1';
      const { rows } = await pool.query(q, params);
      allQuestions.push(...rows);
    }

    // Shuffle
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    if (allQuestions.length === 0) return errorResponse('No questions available', 500);

    // Use advisory lock to prevent race condition (two concurrent starts for the same user)
    await pool.query('SELECT pg_advisory_xact_lock($1)', [userId]);

    // Re-check after acquiring lock
    const recheck = await pool.query(
      `SELECT id FROM quiz_sessions WHERE user_id = $1 AND started_at >= ($2::timestamp AT TIME ZONE $3) LIMIT 1`,
      [userId, windowStart, tz]
    );
    if (recheck.rows.length > 0) return errorResponse('Vous avez déjà participé au quiz durant cette session. Revenez à la prochaine session !', 429);

    const sessionRes = await pool.query('INSERT INTO quiz_sessions (user_id, total_questions) VALUES ($1, $2) RETURNING id', [userId, allQuestions.length]);

    return successResponse({
      session_id: sessionRes.rows[0].id,
      questions: allQuestions.map(q => ({ id: q.id, question: q.question, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options, category: q.category, difficulty: q.difficulty })),
      total_questions: allQuestions.length,
      time_limit: access.settings.time_limit,
      points_per_correct: POINTS_PER_CORRECT,
    });
  } catch (err: any) {
    return errorResponse('Failed to start quiz: ' + err.message, 500);
  }
}
