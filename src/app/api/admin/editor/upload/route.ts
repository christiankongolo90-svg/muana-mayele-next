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

    if (!file) return errorResponse('Image is required');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return errorResponse('Storage non configuré. Vérifiez les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.', 500);

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ext = file.name.split('.').pop() || 'png';
    const storagePath = `editor_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('site-content')
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return errorResponse('Échec du téléversement: ' + uploadError.message, 500);

    const { data: urlData } = supabase.storage.from('site-content').getPublicUrl(storagePath);

    return successResponse({ url: urlData.publicUrl });
  } catch (err: any) {
    return errorResponse('Failed to upload image', 500);
  }
}
