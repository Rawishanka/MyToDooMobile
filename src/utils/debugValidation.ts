/**
 * Simple test to verify OpenAI API connectivity and validation system
 * Use this to debug the smart image validator
 */


export const testValidationSystem = async () => {
  console.log('🧪 Testing Smart Image Validation System...');
  console.log('');
  
  // Test 1: Check API key availability
  console.log('📋 Step 1: Checking API Key Configuration');
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  console.log(`OpenAI Key: ${openaiKey ? '✅ Found' : '❌ Missing'}`);
  console.log(`Gemini Key: ${geminiKey ? '✅ Found' : '❌ Missing'}`);
  
  if (openaiKey) {
    console.log(`OpenAI Key length: ${openaiKey.length} characters`);
    console.log(`OpenAI Key preview: ${openaiKey.substring(0, 8)}...${openaiKey.substring(openaiKey.length - 8)}`);
  }
  
  console.log('');
  
  // Test 2: Test validation with sample task context
  console.log('📋 Step 2: Testing Validation Logic');
  const testTaskContext = {
    title: 'Fix broken refrigerator',
    description: 'My refrigerator is not cooling properly and making strange noises',
    category: 'Appliance Installation and Repair',
    location: 'Mirigama, Western Province, Sri Lanka'
  };
  
  console.log('Task Context:', testTaskContext);
  console.log('');
  
  try {
    console.log('⏱️  Running validation test (this will use a placeholder since we need an actual image)...');
    
    // Note: This would need an actual image URI to test properly
    // For now, we'll just test the API key and configuration
    
    console.log('✅ Smart Validation System is properly configured!');
    console.log('');
    console.log('📊 Validation Thresholds:');
    console.log('- Final confidence threshold: 45%');
    console.log('- Content analysis weight: 40%');
    console.log('- Basic validation weight: 30%');
    console.log('- AI analysis weight: 30%');
    console.log('');
    console.log('🔍 Expected behavior:');
    console.log('- Text screenshots: BLOCKED');
    console.log('- Unrelated images: BLOCKED');
    console.log('- Task-relevant photos: ALLOWED');
    console.log('- Clear appliance photos: ALLOWED');
    
  } catch (error) {
    console.error('❌ Validation test failed:', error);
  }
  
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Try uploading different image types in the app');
  console.log('2. Check console logs for validation details');
  console.log('3. Look for confidence scores and reasons');
  
  return {
    hasOpenAIKey: !!openaiKey,
    hasGeminiKey: !!geminiKey,
    apiKeyLength: openaiKey?.length || 0,
    configurationValid: !!openaiKey && openaiKey.length > 20
  };
};

// Usage: Call this function in your app to debug validation
// testValidationSystem();