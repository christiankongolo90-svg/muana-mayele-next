import { successResponse, errorResponse } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { getAccessStatus } from '../../_lib/settings';

export async function GET() {
  try {
    const pool = getPool();
    const access = await getAccessStatus(pool);
    return successResponse({ is_open: access.is_open, time_limit: access.settings.time_limit, schedule: access.schedule });
  } catch (err: any) {
    return errorResponse('Failed to fetch quiz settings: ' + err.message, 500);
  }
}
