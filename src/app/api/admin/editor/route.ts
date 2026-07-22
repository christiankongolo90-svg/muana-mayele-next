import { successResponse, errorResponse, authenticateAdmin } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';

export async function GET(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'home';

    // First try: latest draft
    const { rows: drafts } = await pool.query(
      `SELECT id, page_slug, content, status, created_at FROM page_versions
       WHERE page_slug = $1 AND status = 'draft'
       ORDER BY created_at DESC LIMIT 1`,
      [slug]
    );

    if (drafts.length > 0) {
      return successResponse({ content: drafts[0].content, status: drafts[0].status, id: drafts[0].id });
    }

    // Fallback: latest published version
    const { rows: published } = await pool.query(
      `SELECT id, page_slug, content, status, created_at FROM page_versions
       WHERE page_slug = $1 AND status = 'published'
       ORDER BY created_at DESC LIMIT 1`,
      [slug]
    );

    if (published.length > 0) {
      return successResponse({ content: published[0].content, status: published[0].status, id: published[0].id });
    }

    // Nothing found
    return successResponse({ content: null });
  } catch (err: any) {
    return errorResponse('Failed to load editor content: ' + (err.message || 'Unknown error'), 500);
  }
}

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    const admin = await authenticateAdmin(req);
    if (!admin) return errorResponse('Admin access required', 403);

    const body = await req.json();
    const { slug = 'home', content } = body;

    if (!content || !Array.isArray(content.sections)) {
      return errorResponse('Content must include a sections array');
    }

    // Delete existing drafts for this slug
    await pool.query(
      `DELETE FROM page_versions WHERE page_slug = $1 AND status = 'draft'`,
      [slug]
    );

    // Insert new draft
    const { rows } = await pool.query(
      `INSERT INTO page_versions (page_slug, content, status, created_by)
       VALUES ($1, $2, 'draft', $3)
       RETURNING id, page_slug, content, status, created_at`,
      [slug, JSON.stringify(content), admin.id]
    );

    return successResponse(rows[0]);
  } catch (err: any) {
    return errorResponse('Failed to save draft: ' + (err.message || 'Unknown error'), 500);
  }
}
