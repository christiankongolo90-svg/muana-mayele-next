import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    const { items } = await req.json().catch(() => ({}));
    if (!Array.isArray(items) || items.length === 0) return errorResponse('Items array is required');

    let updated = 0;
    for (const item of items) {
      if (!item.id || item.value === undefined) continue;
      await pool.query('UPDATE site_content SET content_value=$1 WHERE id=$2', [item.value, item.id]);
      updated++;
    }
    const { rows } = await pool.query('SELECT * FROM site_content ORDER BY section, sort_order');
    return successResponse({ content: rows, updated });
  } catch (err: any) { return errorResponse('Failed to update site content', 500); }
}
