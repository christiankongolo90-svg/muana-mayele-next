import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const body = await req.json();
    const { id, title, content, image_url, settings, is_visible } = body;

    if (!id) return errorResponse('Section ID is required');

    const { rows: existing } = await pool.query('SELECT * FROM page_sections WHERE id = $1', [id]);
    if (existing.length === 0) return errorResponse('Section not found', 404);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(image_url);
    }
    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(settings));
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramIndex++}`);
      values.push(is_visible);
    }

    if (updates.length === 0) return errorResponse('No fields to update');

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE page_sections SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return successResponse({ section: rows[0] }, 'Section updated successfully');
  } catch (err: any) {
    return errorResponse('Failed to update section', 500);
  }
}
