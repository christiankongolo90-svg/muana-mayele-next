import { successResponse, errorResponse } from '../../_lib/helpers';
import { getPool } from '../../_lib/db';
import { sendOtp } from '../../_lib/muinda-otp';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { phone: rawPhone, country_code, type = 'login', full_name } = body;

  if (!rawPhone?.trim()) return errorResponse('Le numéro de téléphone est obligatoire');
  if (!country_code?.trim()) return errorResponse('Le code pays est obligatoire');

  const phone = rawPhone.replace(/[^0-9]/g, '');
  if (phone.length < 8 || phone.length > 15) return errorResponse('Numéro de téléphone invalide');

  try {
    const pool = getPool();
    const { rows } = await pool.query('SELECT id FROM users WHERE country_code = $1 AND phone = $2', [country_code.trim(), phone]);

    if (type === 'register') {
      if (rows.length > 0) return errorResponse('Ce numéro est déjà enregistré. Veuillez vous connecter.');
      if (!full_name?.trim()) return errorResponse("Le nom complet est obligatoire pour l'inscription");
    } else {
      if (rows.length === 0) return errorResponse('Aucun compte trouvé avec ce numéro. Veuillez vous inscrire.');
    }

    const result = await sendOtp(country_code.trim(), phone);
    if (!result.success) {
      if (result.status === 429) return errorResponse('Veuillez patienter avant de demander un nouveau code', 429);
      return errorResponse("Erreur lors de l'envoi du code", 500);
    }

    let expiresIn = 300;
    if (result.data?.expiresAt) {
      const ts = new Date(result.data.expiresAt).getTime();
      if (!isNaN(ts)) expiresIn = Math.max(60, Math.floor((ts - Date.now()) / 1000));
    }

    return successResponse({ message: 'Code envoyé par WhatsApp', phone, country_code: country_code.trim(), type, expires_in: expiresIn }, 'Code envoyé avec succès!');
  } catch (err: any) {
    return errorResponse("Erreur lors de l'envoi du code", 500);
  }
}
