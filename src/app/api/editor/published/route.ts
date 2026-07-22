import { successResponse, errorResponse } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';

export async function GET(req: Request) {
  try {
    const pool = getPool();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'home';

    const { rows } = await pool.query(
      `SELECT id, content, status, published_at FROM page_versions
       WHERE page_slug = $1 AND status = 'published'
       ORDER BY published_at DESC LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      return successResponse({ content: null });
    }

    return successResponse({ content: rows[0].content });
  } catch (err: any) {
    return errorResponse('Failed to load published content: ' + (err.message || 'Unknown error'), 500);
  }
}
