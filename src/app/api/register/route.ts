import { successResponse, errorResponse } from '../_lib/helpers';
import { getPool } from '../_lib/db';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { full_name, phone, country_code = '+243', email, profession, neighborhood } = body;
  if (!full_name?.trim()) return errorResponse('Le nom complet est obligatoire');
  if (!phone?.trim()) return errorResponse('Le numéro de téléphone est obligatoire');

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  try {
    const pool = getPool();
    const existing = await pool.query('SELECT id FROM users WHERE country_code = $1 AND phone = $2', [country_code, cleanPhone]);
    if (existing.rows.length > 0) return errorResponse('Ce numéro est déjà enregistré');

    const { rows } = await pool.query(
      'INSERT INTO users (full_name, email, phone, country_code, profession, neighborhood) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, full_name, email, phone, country_code, neighborhood, role',
      [full_name.trim(), email?.trim() || null, cleanPhone, country_code, profession?.trim() || null, neighborhood?.trim() || null]
    );
    return successResponse({ user: rows[0] }, 'Inscription réussie!');
  } catch (err: any) {
    return errorResponse("Erreur lors de l'inscription", 500);
  }
}
