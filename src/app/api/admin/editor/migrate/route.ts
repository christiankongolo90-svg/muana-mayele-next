import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function GET(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_versions (
        id SERIAL PRIMARY KEY,
        page_slug VARCHAR(100) NOT NULL DEFAULT 'home',
        content JSONB NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        published_at TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_page_versions_slug_status ON page_versions(page_slug, status);
    `);

    return successResponse(null, 'Editor migration completed successfully');
  } catch (err: any) {
    return errorResponse('Migration failed: ' + (err.message || 'Unknown error'), 500);
  }
}
