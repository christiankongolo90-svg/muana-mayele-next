import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function POST(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const body = await req.json();
    const { section_type, title, content, image_url, settings, sort_order } = body;

    if (!section_type) return errorResponse('section_type is required');

    const { rows } = await pool.query(
      `INSERT INTO page_sections (section_type, title, content, image_url, settings, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        section_type,
        title || '',
        content || '',
        image_url || '',
        JSON.stringify(settings || {}),
        sort_order ?? 0,
      ]
    );

    return successResponse({ section: rows[0] }, 'Section created successfully');
  } catch (err: any) {
    return errorResponse('Failed to create section', 500);
  }
}
