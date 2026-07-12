import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

export async function GET(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_sections (
        id SERIAL PRIMARY KEY,
        section_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) DEFAULT '',
        content TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        settings JSONB DEFAULT '{}',
        sort_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const { rows: existing } = await pool.query('SELECT COUNT(*) as count FROM page_sections');
    if (parseInt(existing[0].count) === 0) {
      const defaultSections = [
        { section_type: 'hero', sort_order: 0 },
        { section_type: 'registration', sort_order: 1 },
        { section_type: 'how_it_works', sort_order: 2 },
        { section_type: 'leaderboard', sort_order: 3 },
      ];

      for (const section of defaultSections) {
        await pool.query(
          `INSERT INTO page_sections (section_type, settings, is_visible, sort_order) VALUES ($1, $2, $3, $4)`,
          [section.section_type, '{}', true, section.sort_order]
        );
      }
    }

    const { rows } = await pool.query('SELECT * FROM page_sections ORDER BY sort_order');
    return successResponse({ sections: rows }, 'Migration completed successfully');
  } catch (err: any) {
    return errorResponse('Migration failed: ' + (err.message || 'Unknown error'), 500);
  }
}
