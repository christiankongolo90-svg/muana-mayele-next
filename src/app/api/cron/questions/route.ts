import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../_lib/db';

export const maxDuration = 60;

const CATEGORIES = [
  'Culture', 'Économie', 'Éducation', 'Géographie', 'Histoire',
  'Nature', 'Politique', 'Sport', 'Sciences', 'Chimie',
  'Politique Mondiale', 'Mathématiques', 'Technologie', 'Santé',
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const pool = getPool();

    const prompt = `Génère exactement 56 questions de quiz éducatif pour la plateforme "Muana Mayele", réparties équitablement (4 par catégorie) parmi ces catégories : ${CATEGORIES.join(', ')}.

Règles strictes :
- Toutes les questions DOIVENT être en français
- 70% difficulté "hard", 20% "medium", 10% "easy"
- Chaque question a exactement 4 options
- correct_answer = index (0-3) de la bonne réponse
- Les questions doivent être factuellement exactes
- Sujets variés et intéressants, pas de questions trop basiques
- Ne répète JAMAIS des questions classiques évidentes

Retourne UNIQUEMENT un tableau JSON valide, sans texte avant ou après :
[{"category":"Culture","question":"Question ici ?","options":["A","B","C","D"],"correct_answer":0,"difficulty":"hard"}]`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse generated questions' }, { status: 500 });
    }

    const questions = JSON.parse(jsonMatch[0]);
    let added = 0, skipped = 0;

    for (const q of questions) {
      if (!q.category || !q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        skipped++;
        continue;
      }

      const catRes = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [q.category]
      );
      const categoryId = catRes.rows[0].id;

      const exists = await pool.query(
        'SELECT id FROM questions WHERE question = $1 AND category_id = $2',
        [q.question, categoryId]
      );
      if (exists.rows.length > 0) { skipped++; continue; }

      await pool.query(
        'INSERT INTO questions (category_id, question, options, correct_answer, difficulty, is_active) VALUES ($1, $2, $3, $4, $5, TRUE)',
        [categoryId, q.question, JSON.stringify(q.options), q.correct_answer, q.difficulty || 'medium']
      );
      added++;
    }

    const totalRes = await pool.query('SELECT COUNT(*) as c FROM questions');

    return NextResponse.json({
      success: true,
      added,
      skipped,
      total_questions: Number(totalRes.rows[0].c),
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Cron failed: ' + err.message }, { status: 500 });
  }
}
