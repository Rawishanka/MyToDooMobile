// OCR API Service - Google Gemini Image Analysis for Sensitive Data Detection

import API_CONFIG from '@/src/api/config';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface OCRAnalysisResponse {
  success: boolean;
  data: {
    filename: string;
    analysis: {
      containsMobileNumber: boolean;
      containsAddress: boolean;
      mobileNumbers: string[];
      addresses: string[];
      confidence: 'high' | 'medium' | 'low';
      explanation: string;
    };
    hasSensitiveData: boolean;
  };
}

class OCRAPIService {
  private baseURL = API_CONFIG.BASE_URL;

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Analyze image for sensitive data (phone numbers and addresses)
   * @param imageUri - Local file URI of the image
   * @returns OCR analysis result
   */
  async analyzeImage(imageUri: string): Promise<OCRAnalysisResponse> {
    try {
      console.log('🔍 Starting OCR analysis for image:', imageUri);

      // Validate file exists before processing
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error(`Image file not found: ${imageUri}`);
      }

      const fileName = imageUri.split('/').pop() || 'image.jpg';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
      
      // Determine mime type based on extension
      let mimeType = 'image/jpeg';
      if (fileExtension === 'png') mimeType = 'image/png';
      else if (fileExtension === 'gif') mimeType = 'image/gif';
      else if (fileExtension === 'webp') mimeType = 'image/webp';

      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      } as any);

      const headers = await this.getAuthHeaders();
      
      console.log('📤 Sending image to OCR API...');
      const response = await fetch(`${this.baseURL}/ocr/analyze`, {
        method: 'POST',
        headers: {
          ...headers,
          // Don't set Content-Type, let fetch set it automatically for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OCR API error:', response.status, errorText);
        throw new Error(`OCR analysis failed: ${response.status} ${errorText}`);
      }

      const result: OCRAnalysisResponse = await response.json();
      console.log('✅ OCR analysis completed:', {
        hasSensitiveData: result.data?.hasSensitiveData,
        containsMobileNumber: result.data?.analysis?.containsMobileNumber,
        containsAddress: result.data?.analysis?.containsAddress,
        confidence: result.data?.analysis?.confidence,
      });

      return result;
    } catch (error: any) {
      // Only log non-network errors in development
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ OCR analysis failed:', error);
      }
      throw new Error(error.message || 'Failed to analyze image for sensitive data');
    }
  }

  /**
   * Validate if image can be uploaded (no sensitive data)
   * @param imageUri - Local file URI of the image
   * @returns true if safe to upload, false if contains sensitive data
   */
  async validateImageForUpload(imageUri: string): Promise<{
    isValid: boolean;
    reason?: string;
    details?: {
      mobileNumbers: string[];
      addresses: string[];
      explanation: string;
    };
  }> {
    try {
      const result = await this.analyzeImage(imageUri);
      
      if (result.data.hasSensitiveData) {
        const { mobileNumbers, addresses, explanation } = result.data.analysis;
        const reasons: string[] = [];
        
        if (mobileNumbers.length > 0) {
          reasons.push(`Phone number(s) detected: ${mobileNumbers.join(', ')}`);
        }
        if (addresses.length > 0) {
          reasons.push(`Address(es) detected: ${addresses.join(', ')}`);
        }

        return {
          isValid: false,
          reason: reasons.join('\n'),
          details: {
            mobileNumbers,
            addresses,
            explanation,
          },
        };
      }

      return { isValid: true };
    } catch (error: any) {
      // Only log non-network errors in development
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Image validation failed:', error);
      }
      // On error, we'll allow the upload but log the error
      // You can change this behavior to block on errors if needed
      return {
        isValid: true, // Allow upload if OCR service is down
      };
    }
  }
}

export const OCRAPI = new OCRAPIService();
export default OCRAPI;
