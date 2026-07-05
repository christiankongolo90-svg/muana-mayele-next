function toE164(countryCode: string, phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '').replace(/^0+/, '');
  return '+' + countryCode.replace(/^\+/, '') + digits;
}

async function request(method: string, path: string, payload: any): Promise<any> {
  const apiKey = process.env.MUINDA_API_KEY || '';
  const baseUrl = process.env.MUINDA_API_BASE_URL || 'https://api.muindatech.com';

  if (!apiKey) return { success: false, status: 0, error: 'OTP service not configured' };

  try {
    const resp = await fetch(baseUrl + path, {
      method,
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) return { success: true, status: resp.status, data };
    return { success: false, status: resp.status, error: data.error || `HTTP ${resp.status}`, data };
  } catch (err: any) {
    return { success: false, status: 0, error: err.message };
  }
}

export async function sendOtp(countryCode: string, phone: string) {
  return request('POST', '/api/v1/otp/send', {
    to: toE164(countryCode, phone),
    templateName: process.env.MUINDA_OTP_TEMPLATE || 'muinda_login_fr',
    language: process.env.MUINDA_OTP_LANGUAGE || 'fr',
  });
}

export async function verifyOtp(countryCode: string, phone: string, code: string) {
  return request('POST', '/api/v1/otp/verify', { to: toE164(countryCode, phone), code });
}
