import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function GET(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'home';

    const { rows } = await pool.query(
      `SELECT id, page_slug, content, status, created_by, created_at, published_at
       FROM page_versions
       WHERE page_slug = $1 AND status = 'published'
       ORDER BY created_at DESC
       LIMIT 20`,
      [slug]
    );

    return successResponse({ versions: rows });
  } catch (err: any) {
    return errorResponse('Failed to load versions: ' + (err.message || 'Unknown error'), 500);
  }
}
