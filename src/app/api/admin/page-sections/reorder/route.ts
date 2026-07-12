import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function PUT(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const body = await req.json();
    const { order } = body;

    if (!order || !Array.isArray(order)) return errorResponse('order must be an array of section IDs');

    for (let i = 0; i < order.length; i++) {
      await pool.query(
        'UPDATE page_sections SET sort_order = $1, updated_at = NOW() WHERE id = $2',
        [i, order[i]]
      );
    }

    const { rows } = await pool.query('SELECT * FROM page_sections ORDER BY sort_order');
    return successResponse({ sections: rows }, 'Sections reordered successfully');
  } catch (err: any) {
    return errorResponse('Failed to reorder sections', 500);
  }
}
