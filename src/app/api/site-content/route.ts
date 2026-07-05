import { successResponse, errorResponse } from '../_lib/helpers';
import { getPool } from '../_lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM site_content ORDER BY section, sort_order');
    return successResponse({ content: rows });
  } catch (err: any) {
    return errorResponse('Failed to fetch site content', 500);
  }
}
