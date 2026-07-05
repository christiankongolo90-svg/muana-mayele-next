import { successResponse, errorResponse } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { verifyOtp } from '../../_lib/muinda-otp';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { phone: rawPhone, country_code, passcode, full_name, email, profession, neighborhood } = body;

  if (!rawPhone?.trim()) return errorResponse('Le numéro de téléphone est obligatoire');
  if (!country_code?.trim()) return errorResponse('Le code pays est obligatoire');
  if (!passcode?.trim()) return errorResponse('Le code de vérification est obligatoire');

  const phone = rawPhone.replace(/[^0-9]/g, '');
  const cc = country_code.trim();

  try {
    const result = await verifyOtp(cc, phone, passcode.trim());
    if (!result.success) return errorResponse('Code invalide ou expiré');

    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT id, full_name, email, phone, country_code, neighborhood, role FROM users WHERE country_code = $1 AND phone = $2', [cc, phone]
    );

    if (rows.length === 0) {
      if (!full_name?.trim()) return errorResponse("Le nom complet est obligatoire pour l'inscription");
      const insert = await pool.query(
        `INSERT INTO users (full_name, email, phone, country_code, profession, neighborhood) VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, full_name, email, phone, country_code, neighborhood, role`,
        [full_name.trim(), email?.trim() || null, phone, cc, profession?.trim() || null, neighborhood?.trim() || null]
      );
      return successResponse({ user: insert.rows[0], is_new: true }, 'Compte créé avec succès!');
    }

    return successResponse({ user: rows[0], is_new: false }, 'Connexion réussie!');
  } catch (err: any) {
    return errorResponse('Erreur lors de la vérification', 500);
  }
}
