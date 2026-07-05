import { NextResponse } from 'next/server';
import { getPool } from '../_lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query('SELECT NOW() as time, current_database() as db');
    return NextResponse.json({ status: 'ok', db: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}
