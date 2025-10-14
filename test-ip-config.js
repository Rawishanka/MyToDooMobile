#!/usr/bin/env node

// Quick IP Configuration Test
// This script tests if all API endpoints are pointing to the correct IP address

const fs = require('fs');
const path = require('path');

console.log('🔍 MyToDoo IP Configuration Test');
console.log('=================================');
console.log('Current Expected IP: 192.168.8.168');
console.log('');

// Check .env file
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('📁 .env file:');
  envContent.split('\n').forEach(line => {
    if (line.includes('192.168')) {
      console.log(`  ${line}`);
    }
  });
} catch (error) {
  console.log('❌ Could not read .env file');
}

console.log('');

// Check API config
try {
  const configContent = fs.readFileSync('api/config.ts', 'utf8');
  const ipMatches = configContent.match(/192\.168\.\d+\.\d+/g);
  console.log('⚙️ api/config.ts IP addresses found:');
  if (ipMatches) {
    ipMatches.forEach(ip => console.log(`  ${ip}`));
  } else {
    console.log('  No hardcoded IPs found (good - using environment variables)');
  }
} catch (error) {
  console.log('❌ Could not read api/config.ts');
}

console.log('');

// Test if server is reachable
const testConnection = async () => {
  console.log('🌐 Testing API connectivity...');
  const testUrl = 'http://192.168.8.168:5001/api/tasks';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ API server is reachable');
      console.log(`   Status: ${response.status}`);
    } else {
      console.log('⚠️ API server responded but with error');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ Connection timeout (5 seconds)');
    } else {
      console.log('❌ Connection failed:', error.message);
    }
    console.log('💡 Make sure your backend server is running on http://192.168.8.168:5001');
  }
};

// Run the connection test
testConnection();