import { NextResponse } from 'next/server';

export function successResponse(data: any, message?: string) {
  const body: any = { success: true, data };
  if (message) body.message = message;
  return NextResponse.json(body);
}

export function errorResponse(message: string, statusCode = 400) {
  return NextResponse.json({ success: false, error: message }, { status: statusCode });
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Admin-User-Id',
  };
}

export async function authenticateAdmin(req: Request) {
  const { getPool } = await import('./db');
  const adminId = req.headers.get('x-admin-user-id');
  if (!adminId) return null;

  const pool = getPool();
  const { rows } = await pool.query('SELECT id, full_name, role FROM users WHERE id = $1', [adminId]);
  if (rows.length === 0 || rows[0].role !== 'admin') return null;
  return rows[0];
}
