/**
 * Image Validation Test Utility
 * Use this to test the smartImageValidator with different image types
 */

import { smartValidator } from '../services/smartImageValidator';

export interface ValidationTestResult {
  testName: string;
  imagePath: string;
  result: any;
  passed: boolean;
  expectedOutcome: 'block' | 'allow';
  actualOutcome: 'block' | 'allow';
  notes: string;
}

/**
 * Test different types of images to verify validation behavior
 */
export const runValidationTests = async (
  testImages: { path: string; description: string; shouldPass: boolean; category?: string; title?: string; taskDescription?: string }[]
): Promise<ValidationTestResult[]> => {
  const results: ValidationTestResult[] = [];
  
  for (const testImage of testImages) {
    try {
      console.log(`🧪 Testing: ${testImage.description}`);
      
      // Create task context for validation
      const taskContext = {
        title: testImage.title || 'Test Task',
        description: testImage.taskDescription || 'Test description for validation',
        category: testImage.category || 'General Services',
        location: 'Test Location'
      };
      
      const validationResult = await smartValidator.validateImage(testImage.path, taskContext);
      
      const actualOutcome: 'block' | 'allow' = validationResult.isValid ? 'allow' : 'block';
      const expectedOutcome: 'block' | 'allow' = testImage.shouldPass ? 'allow' : 'block';
      const passed = actualOutcome === expectedOutcome;
      
      const result: ValidationTestResult = {
        testName: testImage.description,
        imagePath: testImage.path,
        result: validationResult,
        passed,
        expectedOutcome,
        actualOutcome,
        notes: `Confidence: ${validationResult.confidence}, Message: ${validationResult.message}`
      };
      
      results.push(result);
      
      console.log(`${passed ? '✅' : '❌'} ${testImage.description}`);
      console.log(`   Expected: ${expectedOutcome}, Actual: ${actualOutcome}`);
      console.log(`   Confidence: ${validationResult.confidence}`);
      console.log(`   Reasons: ${validationResult.reasons?.join(', ')}`);
      console.log('');
      
    } catch (error: any) {
      console.error(`❌ Error testing ${testImage.description}:`, error);
      results.push({
        testName: testImage.description,
        imagePath: testImage.path,
        result: { error: error?.message || 'Unknown error' },
        passed: false,
        expectedOutcome: testImage.shouldPass ? 'allow' : 'block',
        actualOutcome: 'block',
        notes: `Error: ${error?.message || 'Unknown error'}`
      });
    }
  }
  
  return results;
};

/**
 * Print a summary of test results
 */
export const printTestSummary = (results: ValidationTestResult[]) => {
  console.log('\n📊 VALIDATION TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log('');
  
  // Show failed tests
  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.log('🔴 FAILED TESTS:');
    failed.forEach(result => {
      console.log(`   • ${result.testName}`);
      console.log(`     Expected: ${result.expectedOutcome}, Got: ${result.actualOutcome}`);
      console.log(`     Notes: ${result.notes}`);
    });
  }
  
  console.log('\n🔧 TUNING RECOMMENDATIONS:');
  
  // Analyze confidence levels
  const validResults = results.filter(r => r.result && typeof r.result.confidence === 'number');
  if (validResults.length > 0) {
    const avgConfidence = validResults.reduce((sum, r) => sum + r.result.confidence, 0) / validResults.length;
    console.log(`   Average confidence: ${avgConfidence.toFixed(2)}`);
    
    const blockedImages = validResults.filter(r => r.actualOutcome === 'block');
    const allowedImages = validResults.filter(r => r.actualOutcome === 'allow');
    
    if (blockedImages.length > 0) {
      const blockedAvg = blockedImages.reduce((sum, r) => sum + r.result.confidence, 0) / blockedImages.length;
      console.log(`   Average confidence of blocked images: ${blockedAvg.toFixed(2)}`);
    }
    
    if (allowedImages.length > 0) {
      const allowedAvg = allowedImages.reduce((sum, r) => sum + r.result.confidence, 0) / allowedImages.length;
      console.log(`   Average confidence of allowed images: ${allowedAvg.toFixed(2)}`);
    }
  }
  
  console.log('   Current threshold: 0.45 (45%)');
  console.log('   - Lower threshold = more strict (blocks more images)');
  console.log('   - Higher threshold = less strict (allows more images)');
};

// Example test cases (uncomment to use)
/*
export const exampleTests = [
  {
    path: 'file://path/to/screenshot.png',
    description: 'Screenshot with text',
    shouldPass: false, // Should be blocked
    category: 'General Services',
    title: 'Test screenshot',
    taskDescription: 'Need to validate this screenshot'
  },
  {
    path: 'file://path/to/appliance.jpg', 
    description: 'Photo of broken appliance',
    shouldPass: true, // Should be allowed
    category: 'Appliance Installation and Repair',
    title: 'Fix broken appliance',
    taskDescription: 'Refrigerator not cooling properly'
  },
  {
    path: 'file://path/to/random.jpg',
    description: 'Random unrelated image',
    shouldPass: false, // Should be blocked
    category: 'General Services',
    title: 'Random task',
    taskDescription: 'This is not related to the task'
  },
  {
    path: 'file://path/to/location.jpg',
    description: 'Photo of work location',
    shouldPass: true, // Should be allowed
    category: 'Cleaning Services',
    title: 'Clean this area',
    taskDescription: 'Need to clean this room'
  }
];

// Usage:
// const results = await runValidationTests(exampleTests);
// printTestSummary(results);
*/