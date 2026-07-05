import { successResponse, errorResponse, authenticateAdmin } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { getSettings } from '../../_lib/settings';

export async function GET(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);
    return successResponse({ settings: await getSettings(pool) });
  } catch (err: any) {
    return errorResponse('Failed to fetch settings', 500);
  }
}
