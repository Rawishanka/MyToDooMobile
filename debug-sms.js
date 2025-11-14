// Quick SMS Debug Test
const API_CONFIG = {
  BASE_URL: "http://134.199.172.167:5001/api",
  USE_MOCK_ONLY: false
};

const FORCE_SIMULATE_SMS = process.env.FORCE_SIMULATE_SMS === 'true' || API_CONFIG.USE_MOCK_ONLY;

console.log('🔧 SMS Debug Configuration:');
console.log('- API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
console.log('- API_CONFIG.USE_MOCK_ONLY:', API_CONFIG.USE_MOCK_ONLY);
console.log('- process.env.FORCE_SIMULATE_SMS:', process.env.FORCE_SIMULATE_SMS);
console.log('- FORCE_SIMULATE_SMS (computed):', FORCE_SIMULATE_SMS);

async function testSMSSend() {
  const testData = {
    phone: "+1234567890",
    email: "test@example.com"
  };
  
  console.log('\n📱 Testing SMS API call...');
  console.log('Endpoint:', `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`);
  console.log('Payload:', JSON.stringify(testData, null, 2));
  
  if (FORCE_SIMULATE_SMS) {
    console.log('❌ SMS is in SIMULATION mode - no real SMS will be sent');
    return;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('SMS test failed:', error.message);
  }
}

testSMSSend();