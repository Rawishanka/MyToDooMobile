/**
 * CDN Upload API
 * 
 * Secure CDN file management for chat messages, reviews, and Q&A
 * Supports public and secure uploads with authentication
 */

import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

// ==================== TYPES ====================

export interface UploadFileRequest {
  file: {
    uri: string;
    type: string;
    name: string;
  };
  accessType?: 'public' | 'secure';
  taskId?: string; // Required for secure uploads
  folder?: 'reviews' | 'questions' | 'tasks' | 'chat' | 'profiles' | 'uploads';
  type?: 'review' | 'question' | 'task' | 'chat' | 'profile';
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;
    url: string;
    secureUrl?: string;
    thumbnail?: string;
    resourceType: 'image' | 'video' | 'raw';
    format: string;
    size: number;
    accessType: 'public' | 'secure';
  };
}

// ==================== API FUNCTIONS ====================

/**
 * POST /cdn/upload
 * Upload a file to CDN (public or secure)
 */
export const uploadFileToCDN = async (
  data: UploadFileRequest
): Promise<UploadFileResponse> => {
  try {
    console.log('📤 Uploading file to CDN:', {
      accessType: data.accessType || 'public',
      folder: data.folder || 'uploads',
      type: data.type,
      fileName: data.file.name
    });

    // Create FormData for file upload
    const formData = new FormData();
    
    // Append file
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    // Append optional fields
    if (data.accessType) {
      formData.append('accessType', data.accessType);
    }
    
    if (data.taskId) {
      formData.append('taskId', data.taskId);
    }
    
    if (data.folder) {
      formData.append('folder', data.folder);
    }
    
    if (data.type) {
      formData.append('type', data.type);
    }

    const response = await api.post<UploadFileResponse>(
      '/cdn/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ File uploaded successfully:', {
      fileId: response.data.data.fileId,
      url: response.data.data.url,
      size: response.data.data.size
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to upload file:', error);

    if (error?.response?.status === 401) {
      throw new Error('Authentication required to upload files');
    }

    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Invalid file data');
    }

    if (error?.response?.status === 413) {
      throw new Error('File too large. Maximum size is 10MB');
    }

    throw new Error(
      error?.response?.data?.message || 'Failed to upload file. Please try again.'
    );
  }
};

/**
 * Helper: Upload image for chat message
 */
export const uploadChatImage = async (
  imageUri: string,
  taskId: string,
  fileName: string = 'chat-image.jpg'
): Promise<string> => {
  const response = await uploadFileToCDN({
    file: {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    },
    accessType: 'public',
    taskId,
    folder: 'chat',
    type: 'chat',
  });

  return response.data.url;
};

/**
 * Helper: Upload file/document for chat message
 */
export const uploadChatFile = async (
  fileUri: string,
  fileName: string,
  fileType: string,
  taskId: string
): Promise<string> => {
  const response = await uploadFileToCDN({
    file: {
      uri: fileUri,
      type: fileType,
      name: fileName,
    },
    accessType: 'public',
    taskId,
    folder: 'chat',
    type: 'chat',
  });

  return response.data.url;
};
