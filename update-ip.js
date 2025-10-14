#!/usr/bin/env node

/**
 * 🔧 IP Address Update Script
 * Updates all hardcoded IP addresses from 192.168.8.135 to 192.168.8.168
 */

const fs = require('fs');
const path = require('path');

const oldIP = '192.168.8.135';
const newIP = '192.168.8.168';

const filesToUpdate = [
  'api/mytasks.ts',
  'api/task-api.ts', 
  'api/user-api.ts',
  'api/categories-api.ts',
  'app/network-test.tsx',
  'components/QuickAuthTest.tsx',
  'test-ip-config.js',
  'debug-network.js'
];

console.log(`🔧 Updating IP addresses from ${oldIP} to ${newIP}`);
console.log('='.repeat(50));

let totalReplacements = 0;

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const beforeCount = (content.match(new RegExp(oldIP.replace(/\./g, '\\.'), 'g')) || []).length;
    
    if (beforeCount > 0) {
      content = content.replace(new RegExp(oldIP.replace(/\./g, '\\.'), 'g'), newIP);
      fs.writeFileSync(fullPath, content, 'utf8');
      
      console.log(`✅ ${filePath}: ${beforeCount} replacements`);
      totalReplacements += beforeCount;
    } else {
      console.log(`ℹ️  ${filePath}: no changes needed`);
    }
  } else {
    console.log(`❌ ${filePath}: file not found`);
  }
});

console.log('='.repeat(50));
console.log(`🎉 Total replacements: ${totalReplacements}`);
console.log(`📱 Mobile app will now connect to: http://${newIP}:5001/api`);
console.log(`🖥️  Make sure your backend server is running on port 5001`);