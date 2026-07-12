import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

const BUILT_IN_TYPES = ['hero', 'registration', 'how_it_works', 'leaderboard'];

export async function DELETE(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    const body = await req.json();
    const { id } = body;

    if (!id) return errorResponse('Section ID is required');

    const { rows: existing } = await pool.query('SELECT * FROM page_sections WHERE id = $1', [id]);
    if (existing.length === 0) return errorResponse('Section not found', 404);

    if (BUILT_IN_TYPES.includes(existing[0].section_type)) {
      return errorResponse('Cannot delete built-in section types', 400);
    }

    await pool.query('DELETE FROM page_sections WHERE id = $1', [id]);

    return successResponse({ id }, 'Section deleted successfully');
  } catch (err: any) {
    return errorResponse('Failed to delete section', 500);
  }
}
