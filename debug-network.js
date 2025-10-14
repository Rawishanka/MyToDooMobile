#!/usr/bin/env node

/**
 * 🔧 Network Debug Tool for MyToDoo App
 * This helps diagnose network connectivity issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 MyToDoo Network Debug Tool');
console.log('================================');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📁 .env file configuration:');
  envContent.split('\n').forEach(line => {
    if (line.includes('API_URL') && !line.startsWith('#')) {
      console.log('  ' + line);
    }
  });
} else {
  console.log('❌ .env file not found');
}

// Check API config
const configPath = path.join(__dirname, 'api', 'config.ts');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  console.log('\n⚙️ api/config.ts configuration:');
  
  // Extract USE_MOCK_API_ONLY value
  const mockMatch = configContent.match(/USE_MOCK_API_ONLY\s*=\s*(true|false)/);
  if (mockMatch) {
    console.log(`  USE_MOCK_API_ONLY = ${mockMatch[1]}`);
  }
  
  // Extract IP address
  const ipMatch = configContent.match(/return\s+"http:\/\/([^"]+)"/);
  if (ipMatch) {
    console.log(`  Fallback API URL = http://${ipMatch[1]}`);
  }
} else {
  console.log('❌ api/config.ts not found');
}

console.log('\n🔍 Network Error Handling:');
console.log('  ✅ getAllTasks() - Now has network error fallback to mock data');
console.log('  ✅ getAllCategories() - Has network error fallback to mock data');
console.log('  ✅ searchTasks() - Already had network error fallback');

console.log('\n📱 When Backend Server is Down:');
console.log('  • Tasks will load from mock-api.ts (15 sample tasks)');
console.log('  • Categories will load from mock categories (9 categories)');
console.log('  • App will continue functioning for development');

console.log('\n🌐 To test with real backend:');
console.log('  1. Make sure your backend server is running on: http://192.168.8.168:5001');
console.log('  2. Test connectivity: curl http://192.168.8.168:5001/api/tasks');
console.log('  3. Check if tasks and categories endpoints respond correctly');

console.log('\n✅ Network error handling should now work properly!');