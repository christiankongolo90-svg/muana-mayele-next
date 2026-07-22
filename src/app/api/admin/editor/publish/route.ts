import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function POST(req: Request) {
  try {
    const pool = getPool();
    const admin = await authenticateAdmin(req);
    if (!admin) return errorResponse('Admin access required', 403);

    const body = await req.json();
    const { slug = 'home', content } = body;

    if (!content || !Array.isArray(content.sections)) {
      return errorResponse('Content must include a sections array');
    }

    // Insert published version
    const { rows } = await pool.query(
      `INSERT INTO page_versions (page_slug, content, status, created_by, published_at)
       VALUES ($1, $2, 'published', $3, NOW())
       RETURNING id, page_slug, content, status, created_at, published_at`,
      [slug, JSON.stringify(content), admin.id]
    );

    // Cleanup: delete any drafts for this slug
    await pool.query(
      `DELETE FROM page_versions WHERE page_slug = $1 AND status = 'draft'`,
      [slug]
    );

    return successResponse(rows[0]);
  } catch (err: any) {
    return errorResponse('Failed to publish: ' + (err.message || 'Unknown error'), 500);
  }
}
