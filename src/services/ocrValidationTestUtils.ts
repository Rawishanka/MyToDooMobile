/**
 * OCR Validation Test Utility
 * 
 * This utility provides functions to test OCR validation
 * with sample images and scenarios.
 */

import { TaskContext, validateSingleImage } from './ocrValidationService';

// Sample task contexts for testing
export const sampleTaskContexts: { [key: string]: TaskContext } = {
  cleaning: {
    title: 'Deep clean my kitchen',
    description: 'Need someone to thoroughly clean my kitchen including appliances, countertops, and floor',
    category: 'Cleaning',
    location: 'Sydney, NSW'
  },
  
  moving: {
    title: 'Move furniture to new apartment',
    description: 'Help move heavy furniture items including sofa, bed, and dining table',
    category: 'Moving',
    location: 'Melbourne, VIC'
  },
  
  handyman: {
    title: 'Fix broken door handle',
    description: 'The front door handle is loose and needs repair or replacement',
    category: 'Handyman',
    location: 'Brisbane, QLD'
  },
  
  gardening: {
    title: 'Trim hedges and mow lawn',
    description: 'Regular garden maintenance including hedge trimming and lawn mowing',
    category: 'Gardening',
    location: 'Perth, WA'
  }
};

// Test scenarios with expected outcomes
export const testScenarios = [
  {
    name: 'Valid cleaning image',
    taskContext: sampleTaskContexts.cleaning,
    expectedValid: true,
    description: 'Image showing dirty kitchen with cleaning supplies visible'
  },
  {
    name: 'Invalid cleaning image',
    taskContext: sampleTaskContexts.cleaning,
    expectedValid: false,
    description: 'Image showing car or unrelated content'
  },
  {
    name: 'Moving boxes image',
    taskContext: sampleTaskContexts.moving,
    expectedValid: true,
    description: 'Image showing cardboard boxes or furniture'
  },
  {
    name: 'Visual-only image',
    taskContext: sampleTaskContexts.handyman,
    expectedValid: true,
    description: 'Image with no text but showing relevant visual content'
  }
];

/**
 * Test OCR validation with a specific image URI and task context
 */
export async function testOCRValidation(
  imageUri: string, 
  taskContext: TaskContext,
  options?: {
    strictMode?: boolean;
    minConfidence?: number;
  }
) {
  try {
    console.log('🧪 Starting OCR validation test...');
    console.log('📋 Task context:', taskContext);
    console.log('🖼️ Image URI:', imageUri);
    
    const result = await validateSingleImage(imageUri, taskContext, options);
    
    console.log('✅ Validation completed:');
    console.log('   Valid:', result.isValid);
    console.log('   Confidence:', result.confidence);
    console.log('   Extracted text:', result.extractedText.substring(0, 100));
    console.log('   Keywords found:', result.keywords.found);
    console.log('   Error:', result.errorMessage);
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Run multiple test scenarios
 */
export async function runTestSuite(imageUris: string[]) {
  const results: any[] = [];
  
  for (let i = 0; i < Math.min(imageUris.length, testScenarios.length); i++) {
    const imageUri = imageUris[i];
    const scenario = testScenarios[i];
    
    try {
      console.log(`\n🧪 Test ${i + 1}: ${scenario.name}`);
      
      const result = await testOCRValidation(
        imageUri, 
        scenario.taskContext,
        { strictMode: false, minConfidence: 0.3 }
      );
      
      const passed = result.isValid === scenario.expectedValid;
      
      results.push({
        scenario: scenario.name,
        passed,
        result,
        expected: scenario.expectedValid,
        actual: result.isValid
      });
      
      console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`   Error: ❌ EXCEPTION - ${errorMessage}`);
      results.push({
        scenario: scenario.name,
        passed: false,
        error: errorMessage,
        expected: scenario.expectedValid,
        actual: null
      });
    }
  }
  
  // Summary
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`\n📊 Test Suite Results: ${passedTests}/${totalTests} passed`);
  
  return results;
}

/**
 * Quick validation test with console output
 */
export async function quickTest(imageUri: string, taskTitle: string) {
  const taskContext: TaskContext = {
    title: taskTitle,
    description: '',
    category: '',
    location: ''
  };
  
  try {
    const result = await testOCRValidation(imageUri, taskContext);
    
    if (result.isValid) {
      console.log('✅ Image validation PASSED');
    } else {
      console.log('❌ Image validation FAILED');
      console.log('   Reason:', result.errorMessage);
      console.log('   Suggestions:', result.suggestions?.join(', '));
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Validation test failed:', error);
    return null;
  }
}

// Export for global access in development
if (__DEV__) {
  (global as any).testOCR = {
    test: testOCRValidation,
    quick: quickTest,
    suite: runTestSuite,
    contexts: sampleTaskContexts
  };
  
  console.log('🧪 OCR Test utilities available globally as testOCR');
  console.log('   Usage: testOCR.quick(imageUri, "task title")');
}