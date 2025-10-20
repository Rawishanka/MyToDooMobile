// Simple test to check if categories API endpoint works
const axios = require('axios');

const BASE_URL = 'http://192.168.8.168:5001/api';

async function testCategoriesEndpoint() {
  console.log('🧪 Testing Categories API Endpoint...');
  console.log('📍 Base URL:', BASE_URL);
  
  try {
    // Test 1: GET /api/categories
    console.log('\n📁 Testing GET /api/categories...');
    const response = await axios.get(`${BASE_URL}/categories`);
    // console.log('✅ Categories Response:', response.data);
    
    if (response.data && Array.isArray(response.data)) {
      // console.log(`✅ Found ${response.data.length} categories:`, response.data);
    } else if (response.data.success && response.data.data) {
      // console.log(`✅ Found ${response.data.data.length} categories:`, response.data.data);
    } else {
      // console.log('⚠️ Unexpected response format:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Categories API Error:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
    
    // Test if general /api endpoint is available
    try {
      console.log('\n🔍 Testing if API server is running...');
      const pingResponse = await axios.get(`${BASE_URL.replace('/api', '')}`);
      console.log('✅ Server is running');
    } catch (pingError) {
      console.error('❌ Server not responding:', pingError.message);
    }
  }
}

testCategoriesEndpoint();