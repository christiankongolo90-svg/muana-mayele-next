import { successResponse, errorResponse, authenticateAdmin } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';

export async function GET(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const { rows } = await pool.query('SELECT * FROM page_sections ORDER BY sort_order');
    return successResponse({ sections: rows });
  } catch (err: any) {
    return errorResponse('Failed to fetch page sections', 500);
  }
}
