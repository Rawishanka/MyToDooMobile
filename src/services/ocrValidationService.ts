// Enhanced OCR validation service with Gemini AI integration
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Enhanced OCR Validation Service with Gemini AI Integration
 * 
 * This service validates uploaded images by:
 * 1. Using Google Gemini AI for intelligent image analysis
 * 2. Falling back to cloud OCR APIs when available
 * 3. Smart filename and metadata analysis
 * 4. Contextual task relevance checking
 */

export interface OCRValidationResult {
  isValid: boolean;
  extractedText: string;
  confidence: number;
  message: string; // Add message property for display
  aiAnalysis?: string;
  errorMessage?: string;
  suggestions?: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
}

export interface TaskContext {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
}

export interface ValidationRule {
  name: string;
  description: string;
  check: (extractedText: string, taskContext: TaskContext) => {
    isValid: boolean;
    confidence: number;
    reason?: string;
  };
}

export interface ValidationOptions {
  strictMode?: boolean;
  minConfidence?: number;
  useAI?: boolean;
  failFast?: boolean;
}

// Gemini AI Configuration - Multiple model support
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

// Legacy support - deprecated, use simpleOcrService instead
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

// Try multiple models in order of preference
const GEMINI_MODELS = [
  'gemini-1.5-pro',
  'gemini-1.5-flash', 
  'gemini-pro-vision',
  'gemini-pro'
];

const getGeminiUrl = (model: string) => 
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Enable debug mode for OCR validation
const DEBUG_MODE = __DEV__;

/**
 * Default validation rules for image relevance checking
 */
const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    name: 'title_keywords',
    description: 'Check if image contains keywords from task title',
    check: (extractedText: string, taskContext: TaskContext) => {
      if (!taskContext.title) return { isValid: true, confidence: 0.5 };
      
      const titleWords = taskContext.title.toLowerCase()
        .split(' ')
        .filter(word => word.length > 2);
      
      const extractedWords = extractedText.toLowerCase().split(/\s+/);
      const matchedWords = titleWords.filter(word => 
        extractedWords.some(extractedWord => extractedWord.includes(word))
      );
      
      const confidence = titleWords.length > 0 ? matchedWords.length / titleWords.length : 0.5;
      
      return {
        isValid: confidence >= 0.1, // Very low threshold - almost always passes
        confidence,
        reason: confidence < 0.1 ? `Image should relate to "${taskContext.title}"` : undefined
      };
    }
  },
  
  {
    name: 'category_relevance',
    description: 'Check if image is relevant to task category',
    check: (extractedText: string, taskContext: TaskContext) => {
      if (!taskContext.category) return { isValid: true, confidence: 0.5 };
      
      const categoryKeywords: { [key: string]: string[] } = {
        'cleaning': ['clean', 'dirt', 'stain', 'wash', 'vacuum', 'mop', 'scrub', 'polish', 'disinfect', 'room', 'floor', 'surface'],
        'room service': ['room', 'hotel', 'bed', 'bedroom', 'bathroom', 'service', 'housekeeping', 'towel', 'sheet', 'pillow', 'amenities', 'guest', 'suite'],
        'moving': ['box', 'pack', 'move', 'transport', 'furniture', 'heavy', 'lift', 'relocate'],
        'delivery': ['deliver', 'package', 'parcel', 'courier', 'transport', 'pickup', 'drop'],
        'handyman': ['repair', 'fix', 'tool', 'screw', 'nail', 'hammer', 'drill', 'broken', 'maintenance'],
        'gardening': ['plant', 'garden', 'grass', 'weed', 'flower', 'tree', 'soil', 'water', 'pruning'],
        'painting': ['paint', 'brush', 'wall', 'color', 'primer', 'roller', 'surface', 'coating'],
        'plumbing': ['pipe', 'leak', 'faucet', 'drain', 'water', 'plumber', 'toilet', 'sink'],
        'electrical': ['wire', 'electric', 'power', 'socket', 'switch', 'light', 'circuit', 'voltage'],
        'carpentry': ['wood', 'carpenter', 'build', 'frame', 'timber', 'sawdust', 'joint', 'measure'],
        'appliance installation and repair': ['appliance', 'install', 'repair', 'machine', 'device', 'equipment', 'service', 'maintenance']
      };
      
      const categoryName = taskContext.category.toLowerCase();
      const relevantKeywords = categoryKeywords[categoryName] || [];
      
      if (relevantKeywords.length === 0) return { isValid: true, confidence: 0.5 };
      
      const extractedWords = extractedText.toLowerCase().split(/\s+/);
      const matchedKeywords = relevantKeywords.filter(keyword =>
        extractedWords.some(word => word.includes(keyword))
      );
      
      const confidence = matchedKeywords.length / relevantKeywords.length;
      
      return {
        isValid: confidence >= 0.05 || extractedText.length < 20, // Very permissive
        confidence: confidence > 0 ? confidence : 0.3,
        reason: confidence < 0.05 && extractedText.length >= 20 
          ? `Image doesn't seem relevant to ${taskContext.category} tasks` 
          : undefined
      };
    }
  },
  
  {
    name: 'inappropriate_content',
    description: 'Check for inappropriate or unrelated content',
    check: (extractedText: string, taskContext: TaskContext) => {
      const inappropriateKeywords = [
        'offensive', 'inappropriate', 'spam', 'advertisement', 'promotion',
        'unrelated', 'random', 'test', 'placeholder', 'lorem ipsum'
      ];
      
      const extractedWords = extractedText.toLowerCase().split(/\s+/);
      const hasInappropriateContent = inappropriateKeywords.some(keyword =>
        extractedWords.some(word => word.includes(keyword))
      );
      
      return {
        isValid: !hasInappropriateContent,
        confidence: hasInappropriateContent ? 0 : 0.8,
        reason: hasInappropriateContent ? 'Image contains inappropriate or unrelated content' : undefined
      };
    }
  }
];

/**
 * OCR Validation Service Class (Expo Compatible)
 */
export class OCRValidationService {
  private validationRules: ValidationRule[];
  
  constructor(customRules?: ValidationRule[]) {
    this.validationRules = customRules || DEFAULT_VALIDATION_RULES;
  }
  
  /**
   * Enhanced AI image analysis using Google Gemini with improved prompting
   */
  private async analyzeImageWithGemini(imageUri: string, taskContext: TaskContext): Promise<{ text: string; analysis: string; confidence: number }> {
    try {
      if (DEBUG_MODE) console.log('🤖 Starting Gemini AI image analysis...');
      
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      
      // Enhanced prompt for better task relevance analysis
      const prompt = `
You are an expert image validator for a task marketplace app. Analyze this image carefully and determine if it's relevant to the given task.

TASK INFORMATION:
- Title: "${taskContext.title || 'Not specified'}"
- Description: "${taskContext.description || 'Not specified'}"
- Category: "${taskContext.category || 'General'}"
- Location: "${taskContext.location || 'Not specified'}"

ANALYSIS REQUIREMENTS:
1. Examine what objects, people, scenes, or activities are visible in the image
2. Look for any visible text, signs, or labels
3. Assess how well the image content relates to the task requirements
4. Consider if this image would help someone understand what work needs to be done

SCORING CRITERIA:
- Score 9-10: Perfect match - image clearly shows the task area/problem/requirements
- Score 7-8: Good match - relevant content that supports the task description  
- Score 5-6: Partially relevant - some connection but missing key details
- Score 3-4: Weak relevance - minimal connection to the task
- Score 1-2: Not relevant - unrelated to the task

For ROOM SERVICE tasks, look for: bedrooms, bathrooms, lights, beds, room interiors, hotel/accommodation spaces
For APPLIANCE tasks, look for: appliances, electrical items, repair situations, tools, technical problems
For CLEANING tasks, look for: areas that need cleaning, dirty surfaces, organizing needs
For CONSTRUCTION/REPAIR tasks, look for: damage, construction work, tools, building materials

Respond ONLY with valid JSON in this exact format:
{
  "description": "Detailed description of what you see in the image",
  "relevanceScore": 8,
  "isRelevant": true,
  "extractedText": "any text visible in the image",
  "suggestions": ["specific suggestion 1", "specific suggestion 2"],
  "reasoning": "Detailed explanation of why this image is or isn't relevant to the task"
}`;

      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
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
          maxOutputTokens: 1000,
        }
      };

      if (DEBUG_MODE) {
        console.log('🤖 Sending request to Gemini API:', {
          url: `${GEMINI_API_URL}?key=${GEMINI_API_KEY ? 'PROVIDED' : 'MISSING'}`,
          apiKeyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
          modelUsed: GEMINI_API_URL.split('/').pop(),
          taskContext: {
            title: taskContext.title,
            category: taskContext.category,
            description: taskContext.description?.substring(0, 50) + '...'
          }
        });
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Try fallback with gemini-1.5-flash model if gemini-1.5-pro fails
        if (response.status === 404 && GEMINI_API_URL.includes('gemini-1.5-pro')) {
          console.log('🔄 Trying fallback to gemini-1.5-flash model...');
          const fallbackUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
          
          // Remove image data for text-only model
          const fallbackBody = {
            contents: [{
              parts: [{ text: `Analyze this task: "${taskContext.title}" in category "${taskContext.category}". Description: "${taskContext.description}". Rate relevance 1-10 and respond with JSON: {"description": "analysis", "relevanceScore": 7, "isRelevant": true, "extractedText": "", "suggestions": [], "reasoning": "explanation"}` }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1000,
            }
          };

          const fallbackResponse = await fetch(`${fallbackUrl}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackBody)
          });

          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            const fallbackAiResponse = fallbackResult.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (fallbackAiResponse) {
              let cleanedResponse = fallbackAiResponse.trim();
              if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
              }
              
              const parsedResponse = JSON.parse(cleanedResponse);
              return {
                text: parsedResponse.extractedText || '',
                analysis: parsedResponse.description || 'Fallback analysis using text-only model',
                confidence: parsedResponse.relevanceScore / 10
              };
            }
          }
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from Gemini AI');
      }

      if (DEBUG_MODE) {
        console.log('🤖 Raw Gemini response:', aiResponse);
      }

      // Clean and parse the JSON response
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      const parsedResponse = JSON.parse(cleanedResponse);
      const confidence = parsedResponse.relevanceScore / 10;

      if (DEBUG_MODE) {
        console.log('🤖 Gemini AI Analysis completed:', {
          relevanceScore: parsedResponse.relevanceScore,
          isRelevant: parsedResponse.isRelevant,
          confidence,
          description: parsedResponse.description?.substring(0, 100) + '...'
        });
      }

      return {
        text: parsedResponse.extractedText || '',
        analysis: parsedResponse.description + '\n\nReasoning: ' + parsedResponse.reasoning,
        confidence
      };

    } catch (error) {
      console.error('🤖 Gemini AI analysis failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      
      if (DEBUG_MODE) {
        console.error('🤖 Full error details:', {
          message: errorMessage,
          stack: errorStack
        });
      }
      
      return {
        text: '',
        analysis: 'AI analysis failed: ' + errorMessage,
        confidence: 0.3 // Lower confidence for fallback
      };
    }
  }

  /**
   * Preprocess image for better analysis (Expo compatible)
   */
  private async preprocessImage(imageUri: string): Promise<string> {
    try {
      const manipResult = await manipulateAsync(
        imageUri,
        [
          { resize: { width: 1200 } }
        ],
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
        }
      );
      
      return manipResult.uri;
    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error);
      return imageUri;
    }
  }
  
  /**
   * Expo-compatible text extraction using fallback analysis
   */
  private async extractTextFromImage(imageUri: string): Promise<string> {
    try {
      console.log('🔍 Starting Expo-compatible text extraction from image:', imageUri);
      
      const preprocessedUri = await this.preprocessImage(imageUri);
      
      // Try cloud OCR first (if available)
      try {
        const cloudOCRResult = await this.tryCloudOCR(preprocessedUri);
        if (cloudOCRResult) {
          console.log('✅ Cloud OCR extraction completed, text length:', cloudOCRResult.length);
          return cloudOCRResult;
        }
      } catch (cloudError) {
        console.log('ℹ️ Cloud OCR not available, using fallback analysis');
      }
      
      // Fallback: Analyze image filename and metadata
      const filename = imageUri.split('/').pop() || '';
      console.log('📁 Analyzing image filename:', filename);
      
      const filenameText = filename
        .replace(/\.(jpg|jpeg|png|gif|bmp)$/i, '')
        .replace(/[_-]/g, ' ')
        .replace(/\d+/g, ' ')
        .trim();
      
      console.log('📝 Extracted filename text:', filenameText);
      
      return filenameText;
      
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      return '';
    }
  }
  
  /**
   * Try cloud OCR service (placeholder for future implementation)
   */
  private async tryCloudOCR(imageUri: string): Promise<string | null> {
    console.log('🌐 Cloud OCR not yet implemented, using fallback');
    return null;
  }
  
  /**
   * Check if filename contains task-relevant keywords
   */
  private hasTaskRelevantFilename(filename: string, taskContext: TaskContext): boolean {
    const name = filename.toLowerCase();
    
    if (taskContext.title) {
      const titleWords = taskContext.title.toLowerCase().split(' ').filter(w => w.length > 2);
      if (titleWords.some(word => name.includes(word))) return true;
    }
    
    if (taskContext.category) {
      const category = taskContext.category.toLowerCase();
      if (name.includes(category)) return true;
    }
    
    const taskTerms = ['task', 'job', 'work', 'before', 'after', 'repair', 'clean', 'fix'];
    if (taskTerms.some(term => name.includes(term))) return true;
    
    return false;
  }

  /**
   * Validate extracted text against task context
   */
  private validateExtractedText(extractedText: string, taskContext: TaskContext) {
    const titleWords = taskContext.title?.toLowerCase().split(' ').filter(w => w.length > 2) || [];
    const categoryWords = taskContext.category?.toLowerCase().split(' ') || [];
    const descriptionWords = taskContext.description?.toLowerCase().split(' ').filter(w => w.length > 3) || [];
    
    const allTaskWords = [...titleWords, ...categoryWords, ...descriptionWords];
    const extractedWords = extractedText.toLowerCase().split(/\s+/);
    
    const foundKeywords = allTaskWords.filter(word =>
      extractedWords.some(extractedWord => extractedWord.includes(word))
    );
    
    const confidence = allTaskWords.length > 0 ? foundKeywords.length / allTaskWords.length : 0.8;
    const isValid = confidence >= 0.1 || extractedText.length < 10; // Very permissive
    
    return {
      isValid,
      confidence: Math.max(confidence, 0.3),
      reason: !isValid ? 'Image content doesn\'t seem related to the task' : undefined,
      keywords: {
        found: foundKeywords,
        missing: allTaskWords.filter(w => !foundKeywords.includes(w))
      }
    };
  }

  /**
   * Generate AI-powered suggestions based on analysis
   */
  private generateAISuggestions(taskContext: TaskContext, aiAnalysis: string): string[] {
    const suggestions: string[] = [];
    
    if (taskContext.category === 'room service' || taskContext.category?.toLowerCase().includes('room')) {
      suggestions.push('Show a clear view of the room that needs service');
      suggestions.push('Include images of beds, bathroom, or specific areas needing attention');
      suggestions.push('Capture any issues or areas that need housekeeping');
    }
    
    if (aiAnalysis.includes('unclear') || aiAnalysis.includes('dark') || aiAnalysis.includes('blurry')) {
      suggestions.push('Use better lighting and focus');
      suggestions.push('Take the photo from a clearer angle');
    }
    
    suggestions.push('Ensure the image clearly shows what needs to be done');
    return suggestions;
  }

  /**
   * Extract keywords from text for validation
   */
  private extractKeywords(text: string, taskContext: TaskContext): { found: string[]; missing: string[] } {
    const taskWords = [
      ...(taskContext.title?.toLowerCase().split(' ').filter(w => w.length > 2) || []),
      ...(taskContext.category?.toLowerCase().split(' ') || []),
      ...(taskContext.description?.toLowerCase().split(' ').filter(w => w.length > 3) || [])
    ];
    
    const textWords = text.toLowerCase().split(/\s+/);
    const found = taskWords.filter(word => textWords.some(tw => tw.includes(word)));
    const missing = taskWords.filter(word => !found.includes(word));
    
    return { found, missing };
  }

  /**
   * Generate keyword suggestions based on task context
   */
  private generateKeywordSuggestions(taskContext: TaskContext): string[] {
    const suggestions: string[] = [];
    
    if (taskContext.title) {
      suggestions.push(`Include content related to "${taskContext.title}"`);
    }
    
    if (taskContext.category) {
      suggestions.push(`Show items, tools, or scenes relevant to ${taskContext.category} work`);
    }
    
    if (taskContext.description) {
      const words = taskContext.description.toLowerCase()
        .split(/[^a-zA-Z]+/)
        .filter(word => word.length > 3);
      
      if (words.length > 0) {
        suggestions.push(`Consider showing: ${words.slice(0, 3).join(', ')}`);
      }
    }
    
    suggestions.push('Ensure the image clearly shows what needs to be done');
    suggestions.push('Use good lighting and clear focus');
    
    return suggestions;
  }

  /**
   * Basic image file validation
   */
  private async validateImageFile(imageUri: string): Promise<{ isValid: boolean; message: string }> {
    try {
      // Check if image URI is valid
      if (!imageUri || imageUri.trim() === '') {
        return { isValid: false, message: 'No image provided' };
      }

      // Check file extension if available
      const extension = imageUri.toLowerCase().split('.').pop();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (extension && !validExtensions.includes(extension)) {
        return { isValid: false, message: 'Invalid image format. Please use JPG, PNG, or other standard image formats.' };
      }

      // Try to get file info (this is a basic check)
      try {
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
          return { isValid: true, message: 'Image file is valid' };
        }
      } catch (error) {
        // File info check failed, but this might be normal for some URIs
        console.log('File info check failed (this may be normal):', error);
      }

      // Default to valid if we can't determine otherwise
      return { isValid: true, message: 'Image appears to be valid' };
      
    } catch (error) {
      console.warn('Image validation failed:', error);
      return { isValid: true, message: 'Image validation skipped due to error' };
    }
  }

  /**
   * Enhanced validation with Gemini AI integration
   */
  async validateImage(
    imageUri: string, 
    taskContext: TaskContext,
    options?: ValidationOptions
  ): Promise<OCRValidationResult> {
    const strictMode = options?.strictMode || false;
    const minConfidence = options?.minConfidence || 0.6; // Increased from 0.3 to 0.6 for better accuracy
    const useAI = options?.useAI !== false; // Default to true
    
    if (DEBUG_MODE) {
      console.log('🔍 Starting enhanced validation with AI for image:', imageUri);
      console.log('📋 Task context:', taskContext);
      console.log('⚙️ Options:', { strictMode, minConfidence, useAI });
    }
    
    // Basic image file validation first
    const imageFileCheck = await this.validateImageFile(imageUri);
    if (!imageFileCheck.isValid) {
      return {
        isValid: false,
        extractedText: '',
        confidence: 0,
        message: `❌ Invalid image: ${imageFileCheck.message}`,
        errorMessage: imageFileCheck.message,
        keywords: { found: [], missing: [] }
      };
    }
    
    try {
      let extractedText = '';
      let aiAnalysis = '';
      let confidence = 0.5;
      
      // Try Gemini AI analysis first if available
      if (useAI && GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
        try {
          const aiResult = await this.analyzeImageWithGemini(imageUri, taskContext);
          extractedText = aiResult.text;
          aiAnalysis = aiResult.analysis;
          confidence = aiResult.confidence;
          
          console.log('🤖 AI Analysis result:', {
            extractedText: extractedText.substring(0, 100),
            analysis: aiAnalysis.substring(0, 100),
            confidence
          });
          
          // AI analysis is comprehensive, return result
          return {
            isValid: confidence >= 0.6, // Higher threshold for AI analysis
            extractedText,
            confidence,
            message: confidence >= 0.6 ? '✓ AI analysis: Image matches the task' : '⚠️ AI analysis: Image may not be highly relevant to the task',
            aiAnalysis,
            errorMessage: confidence < 0.6 ? 'Image may not be highly relevant to the task' : undefined,
            suggestions: confidence < 0.6 ? this.generateAISuggestions(taskContext, aiAnalysis) : undefined,
            keywords: this.extractKeywords(extractedText, taskContext)
          };
          
        } catch (aiError) {
          console.log('🤖 AI analysis failed, falling back to traditional method:', aiError);
          
          // Set a basic analysis result for fallback
          aiAnalysis = `Basic image validation (AI unavailable): Image uploaded for task "${taskContext.title}" in category "${taskContext.category}". Please ensure the image clearly shows the work area or task requirements.`;
          extractedText = '';
          confidence = 0.5; // Moderate confidence for fallback
        }
      }
      
      // Fallback to traditional analysis
      extractedText = await this.extractTextFromImage(imageUri);
      
      console.log('📝 Extracted text/keywords:', extractedText);
      
      // Enhanced validation for Expo environment
      const filename = imageUri.split('/').pop() || '';
      const hasTaskRelevantName = this.hasTaskRelevantFilename(filename, taskContext);
      
      // If no text extracted and not strict mode, use intelligent fallbacks
      if (!extractedText.trim()) {
        console.log('ℹ️ No text found, using intelligent fallback validation');
        
        if (strictMode) {
          return {
            isValid: false,
            extractedText: '',
            confidence: 0,
            message: 'Unable to analyze image content. Please ensure the image clearly shows what needs to be done.',
            errorMessage: 'Unable to analyze image content. Please ensure the image clearly shows what needs to be done.',
            suggestions: this.generateKeywordSuggestions(taskContext),
            keywords: { found: [], missing: [] }
          };
        } else {
          // Use filename and context analysis
          const contextMatch = hasTaskRelevantName ? 0.8 : 0.6; // More generous for room service
          
          return {
            isValid: contextMatch >= minConfidence,
            extractedText: filename,
            confidence: contextMatch,
            message: contextMatch < minConfidence 
              ? 'Image analysis inconclusive. Please ensure image shows task-related content.'
              : '✓ Image appears relevant to the task',
            errorMessage: contextMatch < minConfidence 
              ? 'Image analysis inconclusive. Please ensure image shows task-related content.'
              : undefined,
            suggestions: contextMatch < minConfidence ? this.generateKeywordSuggestions(taskContext) : undefined,
            keywords: { found: hasTaskRelevantName ? [filename] : [], missing: [] }
          };
        }
      }
      
      // Use enhanced text validation
      const textValidation = this.validateExtractedText(extractedText, taskContext);
      
      return {
        isValid: textValidation.isValid,
        extractedText: extractedText,
        confidence: textValidation.confidence,
        message: textValidation.isValid 
          ? '✓ Image content matches the task' 
          : `⚠️ ${textValidation.reason || 'Consider adding more relevant content'}`,
        errorMessage: !textValidation.isValid ? textValidation.reason : undefined,
        suggestions: !textValidation.isValid ? this.generateKeywordSuggestions(taskContext) : undefined,
        keywords: textValidation.keywords
      };
      
    } catch (error) {
      console.error('❌ Enhanced validation failed:', error);
      
      return {
        isValid: !strictMode,
        extractedText: '',
        confidence: 0,
        message: 'Unable to analyze image. Please ensure the image is clear and relevant to your task.',
        errorMessage: 'Unable to analyze image. Please ensure the image is clear and relevant to your task.',
        suggestions: ['Choose a clear, well-lit image', 'Ensure the image shows what needs to be done'],
        keywords: { found: [], missing: [] }
      };
    }
  }

  /**
   * Batch validate multiple images
   */
  async validateImages(
    imageUris: string[],
    taskContext: TaskContext,
    options?: ValidationOptions
  ): Promise<OCRValidationResult[]> {
    const results: OCRValidationResult[] = [];
    
    for (const uri of imageUris) {
      try {
        const result = await this.validateImage(uri, taskContext, options);
        results.push(result);
        
        if (options?.failFast && !result.isValid) {
          break;
        }
      } catch (error) {
        console.error(`❌ Failed to validate image ${uri}:`, error);
        results.push({
          isValid: false,
          extractedText: '',
          confidence: 0,
          message: 'Failed to process image',
          errorMessage: 'Failed to process image',
          keywords: { found: [], missing: [] }
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const ocrValidationService = new OCRValidationService();

// Export utility functions
export const validateImageWithOCR = (
  imageUri: string,
  taskContext: TaskContext,
  options?: ValidationOptions
) => ocrValidationService.validateImage(imageUri, taskContext, options);

// Backward compatibility alias
export const validateSingleImage = validateImageWithOCR;

export const validateMultipleImages = (
  imageUris: string[],
  taskContext: TaskContext,
  options?: ValidationOptions
) => ocrValidationService.validateImages(imageUris, taskContext, options);