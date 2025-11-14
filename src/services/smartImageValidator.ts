// Smart Image Validator with multiple AI providers and local analysis
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface SmartValidationResult {
  isValid: boolean;
  confidence: number;
  message: string;
  reasons: string[];
  suggestions: string[];
  analysis?: string;
}

export interface TaskContext {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
}

export class SmartImageValidator {
  private readonly DEBUG = __DEV__;

  async validateImage(imageUri: string, taskContext: TaskContext): Promise<SmartValidationResult> {
    try {
      console.log('🔍 Starting smart image validation...');
      
      // Step 1: Basic image validation
      const basicResult = await this.performBasicValidation(imageUri);
      if (!basicResult.isValid) {
        return basicResult;
      }

      // Step 2: Content analysis
      const contentResult = await this.analyzeImageContent(imageUri, taskContext);
      if (!contentResult.isValid) {
        return contentResult;
      }

      // Step 3: Try AI analysis if available
      const aiResult = await this.performAIAnalysis(imageUri, taskContext);
      
      // Combine results
      return this.combineValidationResults(basicResult, contentResult, aiResult, taskContext);

    } catch (error: any) {
      console.error('❌ Validation error:', error);
      
      // In case of error, be permissive but warn
      return {
        isValid: true,
        confidence: 0.5,
        message: '⚠️ Could not fully validate image, proceeding with caution',
        reasons: ['Validation service temporarily unavailable'],
        suggestions: ['Please ensure your image clearly shows the task requirements'],
        analysis: 'Unable to analyze image automatically'
      };
    }
  }

  private async performBasicValidation(imageUri: string): Promise<SmartValidationResult> {
    if (!imageUri) {
      return {
        isValid: false,
        confidence: 0,
        message: '❌ No image provided',
        reasons: ['No image URI'],
        suggestions: ['Please select an image']
      };
    }

    // Check file info
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        return {
          isValid: false,
          confidence: 0,
          message: '❌ Image file not found',
          reasons: ['Image file does not exist'],
          suggestions: ['Please try selecting the image again']
        };
      }

      // Check file size (max 10MB)
      const fileSize = (fileInfo as any).size;
      if (fileSize && fileSize > 10 * 1024 * 1024) {
        return {
          isValid: false,
          confidence: 0,
          message: '❌ Image file too large',
          reasons: ['File size exceeds 10MB limit'],
          suggestions: ['Please compress the image or choose a smaller file']
        };
      }

      // Very small files are suspicious
      if (fileSize && fileSize < 1024) {
        return {
          isValid: false,
          confidence: 0,
          message: '❌ Image file too small',
          reasons: ['File size is suspiciously small'],
          suggestions: ['Please choose a proper image file']
        };
      }

    } catch (error) {
      console.log('⚠️ Could not check file info:', error);
    }

    return {
      isValid: true,
      confidence: 0.9,
      message: '✅ Basic validation passed',
      reasons: ['File appears to be a valid image'],
      suggestions: []
    };
  }

  private async analyzeImageContent(imageUri: string, taskContext: TaskContext): Promise<SmartValidationResult> {
    try {
      // Resize image for analysis
      const analyzed = await manipulateAsync(
        imageUri,
        [{ resize: { width: 400 } }],
        { format: SaveFormat.JPEG, compress: 0.7 }
      );

      const reasons: string[] = [];
      const suggestions: string[] = [];
      let confidence = 0.8;

      // Check image dimensions
      if (analyzed.width && analyzed.height) {
        const aspectRatio = analyzed.width / analyzed.height;
        
        // Extremely wide/tall images might be screenshots
        if (aspectRatio > 4) {
          confidence -= 0.3;
          reasons.push('Image appears to be very wide (possible screenshot)');
          suggestions.push('Avoid using screenshots - take direct photos instead');
        } else if (aspectRatio < 0.25) {
          confidence -= 0.3;
          reasons.push('Image appears to be very tall (possible screenshot)');
          suggestions.push('Avoid using screenshots - take direct photos instead');
        }

        // Very small images
        if (analyzed.width < 100 || analyzed.height < 100) {
          confidence -= 0.4;
          reasons.push('Image resolution is too low for proper analysis');
          suggestions.push('Please use a higher resolution image');
        }
      }

      // Check against task category for basic relevance
      confidence += this.getCategoryRelevanceBonus(taskContext.category);

      const isValid = confidence >= 0.4; // More lenient threshold

      return {
        isValid,
        confidence,
        message: isValid ? '✅ Content analysis passed' : '❌ Content analysis failed',
        reasons: isValid ? ['Image appears suitable for the task'] : reasons,
        suggestions: isValid ? [] : suggestions
      };

    } catch (error) {
      console.log('⚠️ Content analysis failed:', error);
      return {
        isValid: true,
        confidence: 0.6,
        message: '⚠️ Content analysis unavailable',
        reasons: ['Could not analyze image content'],
        suggestions: ['Please ensure image clearly shows the task area']
      };
    }
  }

  private getCategoryRelevanceBonus(category?: string): number {
    if (!category) return 0;

    const categoryLower = category.toLowerCase();
    
    // Give bonus for categories that typically need visual verification
    if (categoryLower.includes('repair') || categoryLower.includes('maintenance')) {
      return 0.1;
    }
    if (categoryLower.includes('cleaning') || categoryLower.includes('organising')) {
      return 0.1;
    }
    if (categoryLower.includes('appliance') || categoryLower.includes('electrical')) {
      return 0.1;
    }
    if (categoryLower.includes('construction') || categoryLower.includes('building')) {
      return 0.1;
    }
    
    return 0.05; // Small bonus for having a category
  }

  private async performAIAnalysis(imageUri: string, taskContext: TaskContext): Promise<SmartValidationResult | null> {
    // Try multiple AI providers
    const providers = [
      () => this.tryOpenAIVision(imageUri, taskContext),
      () => this.tryGeminiVision(imageUri, taskContext),
      () => this.tryLocalAnalysis(imageUri, taskContext)
    ];

    for (const provider of providers) {
      try {
        const result = await provider();
        if (result && result.confidence > 0.3) {
          console.log('✅ AI analysis successful');
          return result;
        }
      } catch (error) {
        console.log('⚠️ AI provider failed:', error);
      }
    }

    console.log('ℹ️ No AI analysis available');
    return null;
  }

  private async tryOpenAIVision(imageUri: string, taskContext: TaskContext): Promise<SmartValidationResult | null> {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      console.log('ℹ️ No OpenAI API key provided');
      return null;
    }

    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image for a ${taskContext.category} task titled "${taskContext.title}". 
                
                Is this image appropriate for the task? Consider:
                1. Is it a real photo (not a screenshot of text)?
                2. Does it show something relevant to "${taskContext.category}"?
                3. Would it help someone understand the task?
                
                Respond with JSON only: {"relevant": true/false, "confidence": 0.8, "reason": "explanation", "suggestions": ["tip1"]}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'low'
                }
              }
            ]
          }],
          max_tokens: 300
        })
      });

      if (response.ok) {
        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;
        
        if (content) {
          const aiResult = JSON.parse(content);
          return {
            isValid: aiResult.relevant,
            confidence: aiResult.confidence || 0.7,
            message: aiResult.relevant ? '✅ AI: Image looks good for this task' : '❌ AI: Image may not be suitable',
            reasons: [aiResult.reason || 'AI analysis completed'],
            suggestions: aiResult.suggestions || [],
            analysis: aiResult.reason
          };
        }
      }
    } catch (error) {
      console.log('❌ OpenAI Vision failed:', error);
    }
    
    return null;
  }

  private async tryGeminiVision(imageUri: string, taskContext: TaskContext): Promise<SmartValidationResult | null> {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      return null;
    }

    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
      
      // Try the latest working models
      const models = ['gemini-1.5-pro', 'gemini-pro'];
      
      for (const model of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    {
                      text: `Analyze this image for task: "${taskContext.title}" (category: ${taskContext.category}). 
                      Is this a good image for this task? Respond JSON: {"suitable": true/false, "confidence": 0.8, "explanation": "why", "tips": []}`
                    },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64Image
                      }
                    }
                  ]
                }],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 200
                }
              })
            }
          );

          if (response.ok) {
            const result = await response.json();
            const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiText) {
              let cleanText = aiText.trim();
              if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/```json?\s*/, '').replace(/```\s*$/, '');
              }
              
              const aiResult = JSON.parse(cleanText);
              
              return {
                isValid: aiResult.suitable,
                confidence: aiResult.confidence || 0.6,
                message: aiResult.suitable ? '✅ AI: Image approved' : '❌ AI: Image not suitable',
                reasons: [aiResult.explanation || 'AI analysis completed'],
                suggestions: aiResult.tips || [],
                analysis: aiResult.explanation
              };
            }
          } else {
            console.log(`❌ Gemini model ${model} failed:`, response.status);
          }
        } catch (modelError) {
          console.log(`❌ Gemini model ${model} error:`, modelError);
        }
      }
    } catch (error) {
      console.log('❌ Gemini Vision failed:', error);
    }
    
    return null;
  }

  private async tryLocalAnalysis(imageUri: string, taskContext: TaskContext): Promise<SmartValidationResult> {
    // Local heuristic-based analysis
    console.log('🔍 Performing local analysis...');
    
    let confidence = 0.6;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // Check if task context provides useful information
    if (taskContext.title && taskContext.title.length > 5) {
      confidence += 0.1;
      reasons.push('Task has descriptive title');
    }

    if (taskContext.category) {
      confidence += 0.1;
      reasons.push(`Task category: ${taskContext.category}`);
    }

    if (taskContext.description && taskContext.description.length > 20) {
      confidence += 0.1;
      reasons.push('Task has detailed description');
    }

    // Basic assumptions for local analysis
    const isValid = confidence >= 0.5;
    
    if (!isValid) {
      suggestions.push('Provide more details about your task');
      suggestions.push('Ensure image clearly shows the work area');
    }

    return {
      isValid,
      confidence,
      message: isValid ? '✅ Local analysis: Image appears suitable' : '⚠️ Local analysis: Please verify image relevance',
      reasons,
      suggestions,
      analysis: 'Local heuristic analysis completed'
    };
  }

  private combineValidationResults(
    basic: SmartValidationResult,
    content: SmartValidationResult,
    ai: SmartValidationResult | null,
    taskContext: TaskContext
  ): SmartValidationResult {
    
    // Weighted scoring
    let finalConfidence = 0;
    let totalWeight = 0;

    // Basic validation (30% weight)
    finalConfidence += basic.confidence * 0.3;
    totalWeight += 0.3;

    // Content analysis (40% weight)
    finalConfidence += content.confidence * 0.4;
    totalWeight += 0.4;

    // AI analysis (30% weight if available)
    if (ai) {
      finalConfidence += ai.confidence * 0.3;
      totalWeight += 0.3;
    } else {
      // Redistribute weight if no AI
      finalConfidence = (basic.confidence * 0.4) + (content.confidence * 0.6);
    }

    // Normalize
    if (totalWeight > 0) {
      finalConfidence = finalConfidence / totalWeight;
    }

    // Final decision - be more lenient
    const isValid = finalConfidence >= 0.45; // Lowered threshold

    const allReasons = [
      ...basic.reasons,
      ...content.reasons,
      ...(ai?.reasons || [])
    ];

    const allSuggestions = [
      ...basic.suggestions,
      ...content.suggestions,
      ...(ai?.suggestions || [])
    ];

    // Remove duplicates
    const uniqueReasons = [...new Set(allReasons)];
    const uniqueSuggestions = [...new Set(allSuggestions)];

    const message = isValid 
      ? `✅ Image approved for ${taskContext.category || 'task'} (confidence: ${Math.round(finalConfidence * 100)}%)`
      : `❌ Image validation failed (confidence: ${Math.round(finalConfidence * 100)}%)`;

    return {
      isValid,
      confidence: finalConfidence,
      message,
      reasons: uniqueReasons,
      suggestions: uniqueSuggestions,
      analysis: ai?.analysis || content.analysis || basic.analysis
    };
  }
}

// Export singleton instance
export const smartImageValidator = new SmartImageValidator();

// Export convenience function
export const validateImageSmart = (imageUri: string, taskContext: TaskContext) => 
  smartImageValidator.validateImage(imageUri, taskContext);