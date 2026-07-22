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
    const contentId = formData.get('id') as string;
    if (!file || !contentId) return errorResponse('Image and content ID required');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return errorResponse('Storage not configured', 500);

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'site-content')) {
      await supabase.storage.createBucket('site-content', { public: true });
    }

    const ext = file.name.split('.').pop() || 'png';
    const storagePath = `content_${contentId}_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from('site-content').upload(storagePath, buffer, { contentType: file.type, upsert: true });
    if (uploadError) return errorResponse('Failed to upload image', 500);

    const { data: urlData } = supabase.storage.from('site-content').getPublicUrl(storagePath);
    await pool.query('UPDATE site_content SET content_value=$1 WHERE id=$2', [urlData.publicUrl, contentId]);

    const { rows } = await pool.query('SELECT * FROM site_content WHERE id=$1', [contentId]);
    return successResponse({ item: rows[0], path: urlData.publicUrl });
  } catch (err: any) { return errorResponse('Failed to upload image', 500); }
}
