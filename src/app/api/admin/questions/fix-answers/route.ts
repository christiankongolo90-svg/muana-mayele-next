import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

const FIXES = [
  {
    question: 'En quelle année la RDC a-t-elle remporté sa première CAN ?',
    wrong: 3,
    correct: 0,
    reason: 'First CAN win was 1968 (index 0), not 1974 (index 3)',
  },
  {
    question: 'En quelle année la RDC a-t-elle remporté sa deuxième CAN ?',
    wrong: 0,
    correct: 1,
    reason: 'Second CAN win was 1974 (index 1), not 1972 (index 0)',
  },
  {
    question: 'En quelle année la RDC a-t-elle participé pour la première fois aux JO ?',
    wrong: 2,
    correct: 1,
    reason: 'First Olympic participation was 1968 (index 1), not 1984 (index 2)',
  },
  {
    question: 'Quelle est la ville la plus haute en altitude en RDC ?',
    wrong: 0,
    correct: 2,
    reason: 'Butembo (~1800m, index 2) is higher than Bukavu (~1500m, index 0)',
  },
];

export async function POST(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const results: any[] = [];

    for (const fix of FIXES) {
      const { rows } = await pool.query(
        'SELECT id, question, correct_answer FROM questions WHERE question = $1',
        [fix.question]
      );

      if (rows.length === 0) {
        results.push({ question: fix.question, status: 'not_found' });
        continue;
      }

      const q = rows[0];
      const current = Number(q.correct_answer);

      if (current === fix.correct) {
        results.push({ id: q.id, question: fix.question, status: 'already_correct' });
        continue;
      }

      await pool.query('UPDATE questions SET correct_answer = $1 WHERE id = $2', [fix.correct, q.id]);
      results.push({
        id: q.id,
        question: fix.question,
        status: 'fixed',
        was: fix.wrong,
        now: fix.correct,
        reason: fix.reason,
      });
    }

    return successResponse({ fixes: results, total_fixed: results.filter(r => r.status === 'fixed').length });
  } catch (err: any) {
    return errorResponse('Failed to fix answers: ' + err.message, 500);
  }
}
