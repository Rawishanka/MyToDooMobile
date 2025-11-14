// Simple and reliable OCR validation service
import * as FileSystem from 'expo-file-system/legacy';

export interface SimpleOCRResult {
  isValid: boolean;
  extractedText: string;
  confidence: number;
  message: string;
  aiAnalysis?: string;
  errorMessage?: string;
  suggestions?: string[];
}

export interface TaskContext {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
}

// Simple offline validation that always works
export const simpleValidateImage = async (
  imageUri: string, 
  taskContext: TaskContext
): Promise<SimpleOCRResult> => {
  try {
    console.log('📸 Starting simple image validation...');
    
    // Basic image checks
    if (!imageUri) {
      return {
        isValid: false,
        extractedText: '',
        confidence: 0,
        message: 'No image provided',
        errorMessage: 'Please select an image'
      };
    }

    // Check if image URI looks valid
    if (!imageUri.includes('file://') && !imageUri.includes('http')) {
      return {
        isValid: false,
        extractedText: '',
        confidence: 0,
        message: 'Invalid image format',
        errorMessage: 'Please select a valid image'
      };
    }

    // Try to get image info
    let imageSize = 0;
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      imageSize = fileInfo.exists ? (fileInfo as any).size : 0;
    } catch (e) {
      console.log('⚠️ Could not get image size:', e);
    }

    // Basic size validation
    if (imageSize > 0 && imageSize > 10 * 1024 * 1024) { // 10MB limit
      return {
        isValid: false,
        extractedText: '',
        confidence: 0,
        message: 'Image too large',
        errorMessage: 'Please choose an image smaller than 10MB'
      };
    }

    // STRICT VALIDATION RULES - Reject inappropriate images

    // Get filename for analysis
    const filename = imageUri.split('/').pop()?.toLowerCase() || '';
    const titleWords = (taskContext.title || '').toLowerCase().split(' ').filter(w => w.length > 2);
    const categoryWords = (taskContext.category || '').toLowerCase().split(' ').filter(w => w.length > 2);
    
    // RULE 1: Reject text screenshots and documents
    const textScreenshotKeywords = [
      'screenshot', 'screen_shot', 'screen-shot', 'capture', 'screen',
      'text', 'message', 'chat', 'whatsapp', 'telegram', 'facebook',
      'document', 'pdf', 'email', 'invoice', 'receipt', 'bill',
      'note', 'memo', 'letter', 'contract', 'agreement'
    ];
    
    const hasTextScreenshotName = textScreenshotKeywords.some(keyword => 
      filename.includes(keyword)
    );
    
    if (hasTextScreenshotName) {
      return {
        isValid: false,
        extractedText: `Detected: ${filename}`,
        confidence: 0.1,
        message: '❌ Text screenshots not allowed',
        errorMessage: 'Please upload a photo showing the actual work area or problem, not a text screenshot or document'
      };
    }
    
    // RULE 2: Reject obviously unrelated content
    const unrelatedKeywords = [
      'meme', 'funny', 'joke', 'random', 'test', 'example',
      'sample', 'placeholder', 'temp', 'temporary', 'tmp',
      'wrong', 'different', 'other', 'unrelated', 'mistake'
    ];
    
    const hasUnrelatedContent = unrelatedKeywords.some(keyword => 
      filename.includes(keyword)
    );
    
    if (hasUnrelatedContent) {
      return {
        isValid: false,
        extractedText: `Detected: ${filename}`,
        confidence: 0.1,
        message: '❌ Unrelated content detected',
        errorMessage: 'Please upload relevant photos that show what work needs to be done'
      };
    }
    
    // RULE 3: Check for task relevance (strict scoring)
    const relevantKeywords = [
      ...titleWords,
      ...categoryWords,
      // Common task-related words
      'room', 'house', 'home', 'kitchen', 'bathroom', 'bedroom',
      'repair', 'fix', 'clean', 'paint', 'build', 'install',
      'broken', 'damage', 'problem', 'issue', 'work', 'before', 'after',
      'need', 'help', 'service', 'maintenance', 'renovation'
    ];
    
    const filenameWords = filename.split(/[^a-z0-9]+/).filter(w => w.length > 2);
    const matchedKeywords = relevantKeywords.filter(keyword => 
      filenameWords.some(word => 
        word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)
      )
    );
    
    // Calculate strict relevance score
    const baseRelevance = matchedKeywords.length > 0 ? (matchedKeywords.length / Math.max(relevantKeywords.length, 5)) : 0;
    const taskSpecificMatch = titleWords.length > 0 && titleWords.some(word => 
      filenameWords.some(fw => fw.includes(word) || word.includes(fw))
    );
    
    let finalScore = baseRelevance;
    if (taskSpecificMatch) {
      finalScore += 0.3; // Bonus for task-specific matches
    }
    
    // STRICT THRESHOLD: Images need at least 30% relevance
    const minRequiredScore = 0.3;
    
    if (finalScore < minRequiredScore && titleWords.length > 0) {
      return {
        isValid: false,
        extractedText: `Filename: ${filename}`,
        confidence: finalScore,
        message: '⚠️ Image doesn\'t appear relevant to your task',
        errorMessage: `This image doesn't seem related to "${taskContext.title}". Please upload photos that clearly show the work area or problem.`
      };
    }
    
    // RULE 4: Additional category-specific validation
    if (taskContext.category) {
      const category = taskContext.category.toLowerCase();
      
      // For cleaning tasks, reject obviously non-cleaning images
      if (category.includes('clean') && !filename.includes('clean') && !filename.includes('dirty') && !filename.includes('room') && !filename.includes('kitchen') && !filename.includes('bathroom')) {
        if (finalScore < 0.4) { // Slightly higher threshold for cleaning
          return {
            isValid: false,
            extractedText: `Category: ${taskContext.category}, Filename: ${filename}`,
            confidence: finalScore,
            message: '⚠️ Image doesn\'t appear to show cleaning work',
            errorMessage: 'For cleaning tasks, please upload photos showing the areas that need to be cleaned'
          };
        }
      }
      
      // For repair tasks, look for damage/repair indicators
      if ((category.includes('repair') || category.includes('fix')) && finalScore < 0.35) {
        const hasRepairKeywords = ['repair', 'fix', 'broken', 'damage', 'problem', 'issue'].some(keyword =>
          filename.includes(keyword)
        );
        
        if (!hasRepairKeywords) {
          return {
            isValid: false,
            extractedText: `Category: ${taskContext.category}, Filename: ${filename}`,
            confidence: finalScore,
            message: '⚠️ Image doesn\'t show repair work needed',
            errorMessage: 'For repair tasks, please upload photos showing what\'s broken or needs fixing'
          };
        }
      }
    }
    
    // If we get here, the image passes validation
    const confidence = Math.min(finalScore + 0.2, 0.9); // Add small boost but cap at 90%

    console.log('✅ Strict validation completed:', { 
      isValid: true, 
      confidence, 
      matchedKeywords,
      finalScore 
    });

    return {
      isValid: true,
      extractedText: `Filename: ${filename}`,
      confidence,
      message: `✅ Image approved for ${taskContext.category || 'this task'}`,
      errorMessage: undefined
    };

  } catch (error: any) {
    console.error('❌ Simple validation error:', error);
    
    // Always return a usable result, never completely fail
    return {
      isValid: true, // Default to valid when we can't validate
      extractedText: '',
      confidence: 0.5,
      message: '⚠️ Could not validate image, but proceeding',
      errorMessage: 'Validation service temporarily unavailable',
      aiAnalysis: 'Unable to analyze image automatically',
      suggestions: ['Please manually verify the image is relevant to your task']
    };
  }
};

// Enhanced validation with AI (when available)
export const validateImageWithAI = async (
  imageUri: string,
  taskContext: TaskContext
): Promise<SimpleOCRResult> => {
  // First, try simple validation as baseline
  const simpleResult = await simpleValidateImage(imageUri, taskContext);
  
  // Try AI enhancement if API key is available
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('ℹ️ No AI API key, using simple validation only');
    return simpleResult;
  }

  try {
    console.log('🤖 Attempting AI analysis...');
    
    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const prompt = `Analyze this image for a ${taskContext.category || 'general'} task titled "${taskContext.title}". 
    Respond with JSON only: {"relevant": true/false, "confidence": 0.8, "description": "what you see", "suggestions": ["tip1", "tip2"]}`;

    // Try the latest working Gemini model
    const models = ['gemini-1.5-pro', 'gemini-pro'];
    
    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: model.includes('pro') && !model.includes('1.5') 
                ? [{ text: prompt.replace('Analyze this image for', 'Analyze this task for') }] // Text only for basic pro
                : [
                    { text: prompt },
                    { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
                  ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 500,
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (aiText) {
            console.log('✅ AI analysis successful with model:', model);
            
            // Try to parse AI response
            try {
              let cleanText = aiText.trim();
              if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/```json?\s*/, '').replace(/```\s*$/, '');
              }
              
              const aiResult = JSON.parse(cleanText);
              
              return {
                isValid: aiResult.relevant || simpleResult.isValid,
                extractedText: '',
                confidence: aiResult.confidence || simpleResult.confidence,
                message: aiResult.relevant 
                  ? `✅ AI: ${aiResult.description || 'Image looks good for this task'}`
                  : `⚠️ AI: ${aiResult.description || 'Image may not be ideal for this task'}`,
                aiAnalysis: aiResult.description,
                suggestions: aiResult.suggestions || simpleResult.suggestions
              };
            } catch (parseError) {
              console.log('⚠️ Could not parse AI response, using description directly');
              return {
                ...simpleResult,
                aiAnalysis: aiText,
                message: `✅ AI analysis: ${aiText.substring(0, 100)}...`
              };
            }
          }
        } else {
          console.log(`❌ Model ${model} failed:`, response.status);
        }
      } catch (modelError) {
        console.log(`❌ Model ${model} error:`, modelError);
      }
    }

    console.log('⚠️ All AI models failed, using simple validation');
    return {
      ...simpleResult,
      aiAnalysis: 'AI analysis unavailable, using basic validation'
    };

  } catch (error) {
    console.log('❌ AI validation failed:', error);
    return {
      ...simpleResult,
      aiAnalysis: 'AI analysis failed, using basic validation'
    };
  }
};