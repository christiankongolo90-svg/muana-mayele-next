import { successResponse, errorResponse } from '../_lib/helpers';
import { getPool } from '../_lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT * FROM page_sections WHERE is_visible = true ORDER BY sort_order'
    );
    return successResponse({ sections: rows });
  } catch (err: any) {
    return errorResponse('Failed to fetch page sections', 500);
  }
}
