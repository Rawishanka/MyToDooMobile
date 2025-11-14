import API_CONFIG from './config';
import { ApiResponse, SendSmsRequest, SmsVerificationRequest } from './types/two-factor-auth';
const API_URL = API_CONFIG.BASE_URL;

// Optionally force simulate SMS sends even if backend exists (useful for local QA)
const FORCE_SIMULATE_SMS = process.env.FORCE_SIMULATE_SMS === 'true' || API_CONFIG.USE_MOCK_ONLY;

export async function sendSmsCode(data: SendSmsRequest): Promise<ApiResponse> {
  // Always log attempt so Metro/terminal shows activity
  console.log(`📨 Attempting to send SMS to ${data.phone} (email: ${data.email}) via ${API_URL}/two-factor-auth/send-sms`);
  console.log(`🔧 SMS Configuration: FORCE_SIMULATE=${FORCE_SIMULATE_SMS}, USE_MOCK_ONLY=${API_CONFIG.USE_MOCK_ONLY}`);

  // Development-mode simulation: log and return success without calling external SMS provider
  if (FORCE_SIMULATE_SMS) {
    console.log(`🎯 [SIMULATION] SMS send simulated to ${data.phone} (email: ${data.email}) - NOT SENDING REAL SMS`);
    console.log(`⚠️ To send real SMS: Set FORCE_SIMULATE_SMS=false and USE_MOCK_ONLY=false`);
    return {
      success: true,
      message: 'SMS send simulated (development mode)'
    } as ApiResponse;
  }

  try {
    console.log(`🌐 Making SMS API request to: ${API_URL}/two-factor-auth/send-sms`);
    console.log(`📤 SMS Request payload:`, JSON.stringify(data, null, 2));
    
    const res = await fetch(`${API_URL}/two-factor-auth/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log(`📨 SMS API Response Status: ${res.status} (${res.ok ? 'OK' : 'ERROR'})`);
    
    const json = await res.json() as any;
    console.log(`📨 SMS API Response Data:`, JSON.stringify(json, null, 2));
    
    if (json?.success) {
      console.log(`✅ SMS send success to ${data.phone}:`, json.message || json);
    } else {
      console.warn(`⚠️ SMS send response for ${data.phone}:`, json);
    }
    return json;
  } catch (err: any) {
    console.error(`❌ SMS send failed for ${data.phone}:`, {
      error: err?.message || err,
      name: err?.name,
      stack: err?.stack,
      endpoint: `${API_URL}/two-factor-auth/send-sms`
    });
    // Return a structured error response
    return { success: false, message: err?.message || 'SMS send failed' } as ApiResponse;
  }
}

export async function verifySmsCode(data: SmsVerificationRequest): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/two-factor-auth/sms-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json() as Promise<ApiResponse>;
}
