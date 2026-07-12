import { successResponse, errorResponse } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const pool = getPool();
    const adminId = req.headers.get('x-admin-user-id');
    if (!adminId) return errorResponse('Authentication required', 401);
    const { rows: adminRows } = await pool.query('SELECT id, role FROM users WHERE id = $1', [adminId]);
    if (adminRows.length === 0 || adminRows[0].role !== 'admin') return errorResponse('Admin access required', 403);

    const formData = await req.formData();
    const file = formData.get('image') as File;
    const sectionId = formData.get('section_id') as string;

    if (!file || !sectionId) return errorResponse('Image and section_id are required');

    const { rows: existing } = await pool.query('SELECT * FROM page_sections WHERE id = $1', [sectionId]);
    if (existing.length === 0) return errorResponse('Section not found', 404);

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return errorResponse('Storage not configured', 500);

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ext = file.name.split('.').pop() || 'png';
    const storagePath = `section_${sectionId}_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('site-content')
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return errorResponse('Failed to upload image', 500);

    const { data: urlData } = supabase.storage.from('site-content').getPublicUrl(storagePath);

    await pool.query(
      'UPDATE page_sections SET image_url = $1, updated_at = NOW() WHERE id = $2',
      [urlData.publicUrl, sectionId]
    );

    const { rows } = await pool.query('SELECT * FROM page_sections WHERE id = $1', [sectionId]);
    return successResponse({ section: rows[0], path: urlData.publicUrl });
  } catch (err: any) {
    return errorResponse('Failed to upload image', 500);
  }
}
