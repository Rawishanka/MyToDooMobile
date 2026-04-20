/**
 * CDN Upload API
 * 
 * Secure CDN file management for task images, chat messages, reviews, Q&A, and profiles.
 * All uploads go through /cdn/upload-safe (OCR validated) or /cdn/upload (public/secure).
 * 
 * 2-Step Upload Flow:
 * 1. Upload file via /cdn/upload-safe → returns URL
 * 2. Pass returned URL(s) to the relevant API endpoint (e.g. task creation uses image_urls)
 */

import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

// ==================== URL HELPERS ====================

/**
 * Normalize CDN URL to ensure it's an absolute HTTPS URL
 * This is critical for APK builds where relative URLs don't work
 * 
 * EXPORTED for use in components that display task images
 */
export const normalizeCDNUrl = (url: string | undefined | null): string => {
  if (!url) {
    console.warn('⚠️ Empty CDN URL received');
    return '';
  }

  // Already a complete URL with protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Convert HTTP to HTTPS for security and APK compatibility
    const secureUrl = url.replace(/^http:\/\//i, 'https://');
    return secureUrl;
  }

  // Relative URL starting with /api/cdn or /cdn
  if (url.startsWith('/api/cdn') || url.startsWith('/cdn')) {
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const absoluteUrl = `${baseUrl}${url}`;
    return absoluteUrl;
  }

  // Cloudinary or other CDN direct URL
  if (url.includes('cloudinary.com') || url.includes('cloudfront.net') || url.includes('s3.amazonaws.com') || url.includes('minio')) {
    const secureUrl = url.replace(/^http:\/\//i, 'https://');
    return secureUrl;
  }

  // Last resort: assume it's a relative path and prepend API base URL
  const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
  const absoluteUrl = `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  console.warn('⚠️ Unexpected URL format, converting to absolute:', { original: url, absolute: absoluteUrl });
  return absoluteUrl;
};

// ==================== TYPES ====================

export interface CDNFile {
  uri: string;
  type: string;
  name: string;
}

export interface UploadFileRequest {
  file: CDNFile;
  accessType?: 'public' | 'secure';
  taskId?: string;
  folder?: 'reviews' | 'questions' | 'tasks' | 'chat' | 'profiles' | 'uploads';
  type?: 'review' | 'question' | 'task' | 'chat' | 'profile' | 'task_image';
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  data: {
    fileId?: string;
    publicId?: string;
    url: string;
    secureUrl?: string;
    thumbnail?: string;
    resourceType: 'image' | 'video' | 'raw';
    format: string;
    size: number;
    accessType: 'public' | 'secure';
    ocrStatus?: 'passed' | 'skipped' | 'failed';
    ocrText?: string;
  };
}

export interface UploadSafeResponse {
  success: boolean;
  message: string;
  data: {
    publicId: string;
    url: string;
    secureUrl: string;
    thumbnail?: string;
    resourceType: 'image' | 'video' | 'raw';
    format: string;
    size: number;
    accessType: 'public' | 'secure';
    ocrStatus: 'passed' | 'skipped' | 'failed';
    ocrText?: string;
  };
}

export interface UploadSafeMultipleResponse {
  success: boolean;
  message: string;
  data: {
    accepted: Array<{
      fileId: string;
      filename: string;
      url: string;
      secureUrl: string;
      thumbnail?: string;
      resourceType: string;
      format: string;
      size: number;
      ocrStatus: 'passed' | 'skipped';
      ocrText?: string;
    }>;
    rejected: Array<{
      filename: string;
      rejectionReason: string;
      categories: string[];
      fileUrl?: string;
      ocrText?: string;
      ocrStatus: 'failed';
    }>;
    counts: {
      total: number;
      accepted: number;
      rejected: number;
    };
  };
}

export interface RefreshUrlRequest {
  publicId: string;
  expiresIn?: number;
}

export interface RefreshUrlResponse {
  success: boolean;
  message: string;
  data: {
    publicId: string;
    url: string;
    expiresIn: number;
  };
}

// ==================== CORE API FUNCTIONS ====================

/**
 * POST /cdn/upload
 * Upload a file to CDN (public or secure) - NO OCR validation
 */
export const uploadFileToCDN = async (
  data: UploadFileRequest
): Promise<UploadFileResponse> => {
  try {
    console.log('📤 CDN upload:', { folder: data.folder, type: data.type, fileName: data.file.name });

    const formData = new FormData();
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    if (data.accessType) formData.append('accessType', data.accessType);
    if (data.taskId) formData.append('taskId', data.taskId);
    if (data.folder) formData.append('folder', data.folder);
    if (data.type) formData.append('type', data.type);

    const response = await api.post<UploadFileResponse>('/cdn/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const normalizedUrl = normalizeCDNUrl(response.data.data.url);
    console.log('✅ CDN upload success:', { url: normalizedUrl, size: response.data.data.size });

    return {
      ...response.data,
      data: { ...response.data.data, url: normalizedUrl },
    };
  } catch (error: any) {
    console.error('❌ CDN upload failed:', error?.response?.data || error?.message);
    if (error?.response?.status === 401) throw new Error('Authentication required to upload files');
    if (error?.response?.status === 413) throw new Error('File too large. Maximum size is 10MB');
    throw new Error(error?.response?.data?.message || 'Failed to upload file. Please try again.');
  }
};

/**
 * POST /cdn/upload-safe
 * Upload a file with OCR content policy validation
 * Use for: task images, review attachments, Q&A attachments
 */
export const uploadFileSafe = async (
  file: CDNFile,
  options?: {
    accessType?: 'public' | 'secure';
    taskId?: string;
    folder?: string;
    type?: string;
  }
): Promise<UploadSafeResponse> => {
  try {
    console.log('📤 CDN upload-safe (OCR validated):', { fileName: file.name, folder: options?.folder });

    const formData = new FormData();
    formData.append('file', { uri: file.uri, type: file.type, name: file.name } as any);

    if (options?.accessType) formData.append('accessType', options.accessType);
    if (options?.taskId) formData.append('taskId', options.taskId);
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.type) formData.append('type', options.type);

    const response = await api.post<UploadSafeResponse>('/cdn/upload-safe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Normalize URLs
    const data = response.data.data;
    data.url = normalizeCDNUrl(data.url);
    if (data.secureUrl) data.secureUrl = normalizeCDNUrl(data.secureUrl);
    if (data.thumbnail) data.thumbnail = normalizeCDNUrl(data.thumbnail);

    console.log('✅ CDN upload-safe success:', {
      url: data.url,
      ocrStatus: data.ocrStatus,
      size: data.size,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ CDN upload-safe failed:', error?.response?.data || error?.message);

    // OCR rejection (422)
    if (error?.response?.status === 422) {
      const rejectionData = error.response.data;
      throw new Error(
        `Content policy violation: ${rejectionData?.message || 'Image contains restricted content'}. ` +
        `Categories: ${rejectionData?.data?.categories?.join(', ') || 'unknown'}`
      );
    }
    if (error?.response?.status === 401) throw new Error('Authentication required to upload files');
    if (error?.response?.status === 413) throw new Error('File too large. Maximum size is 10MB');
    throw new Error(error?.response?.data?.message || 'Failed to upload file. Please try again.');
  }
};

/**
 * POST /cdn/upload-safe/multiple
 * Upload multiple files with OCR validation (batch)
 * Returns separate arrays for accepted and rejected files
 */
export const uploadFilesSafeMultiple = async (
  files: CDNFile[],
  options?: {
    accessType?: 'public' | 'secure';
    taskId?: string;
    folder?: string;
  }
): Promise<UploadSafeMultipleResponse> => {
  try {
    console.log('📤 CDN upload-safe/multiple:', { count: files.length, folder: options?.folder });

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', { uri: file.uri, type: file.type, name: file.name } as any);
    });

    if (options?.accessType) formData.append('accessType', options.accessType);
    if (options?.taskId) formData.append('taskId', options.taskId);
    if (options?.folder) formData.append('folder', options.folder);

    const response = await api.post<UploadSafeMultipleResponse>('/cdn/upload-safe/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Normalize URLs in accepted files
    response.data.data.accepted = response.data.data.accepted.map((file) => ({
      ...file,
      url: normalizeCDNUrl(file.url),
      secureUrl: normalizeCDNUrl(file.secureUrl),
      thumbnail: file.thumbnail ? normalizeCDNUrl(file.thumbnail) : undefined,
    }));

    console.log('✅ CDN upload-safe/multiple:', {
      accepted: response.data.data.counts.accepted,
      rejected: response.data.data.counts.rejected,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ CDN upload-safe/multiple failed:', error?.response?.data || error?.message);
    if (error?.response?.status === 401) throw new Error('Authentication required to upload files');
    throw new Error(error?.response?.data?.message || 'Failed to upload files. Please try again.');
  }
};

/**
 * POST /cdn/upload/multiple
 * Upload multiple files to CDN (no OCR)
 */
export const uploadFilesMultiple = async (
  files: CDNFile[],
  folder?: string
): Promise<{ success: boolean; message: string; data: any[] }> => {
  try {
    console.log('📤 CDN upload/multiple:', { count: files.length, folder });

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', { uri: file.uri, type: file.type, name: file.name } as any);
    });
    if (folder) formData.append('folder', folder);

    const response = await api.post('/cdn/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Normalize URLs
    if (Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((item: any) => ({
        ...item,
        url: normalizeCDNUrl(item.url),
      }));
    }

    console.log('✅ CDN upload/multiple success:', response.data.data?.length, 'files');
    return response.data;
  } catch (error: any) {
    console.error('❌ CDN upload/multiple failed:', error?.response?.data || error?.message);
    throw new Error(error?.response?.data?.message || 'Failed to upload files. Please try again.');
  }
};

/**
 * GET /cdn/secure/{publicId}
 * Get secure file with access validation (streamed)
 */
export const getSecureFile = async (
  publicId: string,
  taskId: string
): Promise<string> => {
  try {
    const encodedId = encodeURIComponent(publicId);
    const response = await api.get(`/cdn/secure/${encodedId}?taskId=${taskId}`, {
      responseType: 'blob',
    });
    console.log('✅ Secure file retrieved:', publicId);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get secure file failed:', error?.response?.data || error?.message);
    if (error?.response?.status === 403) throw new Error('Access denied. Only task poster and tasker can view this file.');
    throw new Error(error?.response?.data?.message || 'Failed to retrieve secure file.');
  }
};

/**
 * POST /cdn/refresh-url
 * Refresh a signed URL for an existing CDN file
 */
export const refreshCDNUrl = async (
  publicId: string,
  expiresIn: number = 86400
): Promise<RefreshUrlResponse> => {
  try {
    const response = await api.post<RefreshUrlResponse>('/cdn/refresh-url', { publicId, expiresIn });
    console.log('✅ URL refreshed:', { publicId, expiresIn });
    return response.data;
  } catch (error: any) {
    console.error('❌ Refresh URL failed:', error?.response?.data || error?.message);
    throw new Error(error?.response?.data?.message || 'Failed to refresh URL.');
  }
};

/**
 * DELETE /cdn/file/{publicId}
 * Delete a file from CDN
 */
export const deleteCDNFile = async (publicId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const encodedId = encodeURIComponent(publicId);
    const response = await api.delete(`/cdn/file/${encodedId}`);
    console.log('✅ CDN file deleted:', publicId);
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete CDN file failed:', error?.response?.data || error?.message);
    throw new Error(error?.response?.data?.message || 'Failed to delete file.');
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper: Get mime type from file extension
 */
const getMimeType = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeMap[extension] || 'application/octet-stream';
};

/**
 * Helper: Create CDNFile from a URI
 */
export const createCDNFile = (uri: string, customName?: string): CDNFile => {
  const filename = customName || uri.split('/').pop() || `file_${Date.now()}.jpg`;
  return {
    uri,
    type: getMimeType(uri),
    name: filename,
  };
};

/**
 * Upload task images via CDN upload-safe (with OCR validation)
 * Returns array of CDN URLs to pass as image_urls in task creation
 */
export const uploadTaskImages = async (
  imageUris: string[],
  taskId?: string
): Promise<{ urls: string[]; rejected: string[] }> => {
  console.log(`📸 Uploading ${imageUris.length} task image(s) via CDN upload-safe...`);

  const urls: string[] = [];
  const rejected: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    try {
      const file = createCDNFile(imageUris[i], `task_image_${Date.now()}_${i}.jpg`);
      const response = await uploadFileSafe(file, {
        accessType: 'public',
        taskId,
        folder: 'tasks',
        type: 'task_image',
      });
      urls.push(response.data.url);
      console.log(`✅ Task image ${i + 1}/${imageUris.length} uploaded:`, response.data.url);
    } catch (error: any) {
      console.error(`❌ Task image ${i + 1} rejected:`, error.message);
      rejected.push(error.message);
    }
  }

  console.log(`📸 Task images upload complete: ${urls.length} accepted, ${rejected.length} rejected`);
  return { urls, rejected };
};

/**
 * Upload review attachments via CDN upload-safe
 * Returns array of CDN URLs
 */
export const uploadReviewAttachments = async (
  files: Array<{ uri: string; name: string; type: string }>,
  taskId?: string
): Promise<string[]> => {
  console.log(`📎 Uploading ${files.length} review attachment(s) via CDN...`);

  const urls: string[] = [];
  for (const file of files) {
    try {
      const response = await uploadFileSafe(
        { uri: file.uri, type: file.type, name: file.name },
        { accessType: 'public', taskId, folder: 'reviews', type: 'review' }
      );
      urls.push(response.data.url);
    } catch (error: any) {
      console.error(`❌ Review attachment rejected:`, error.message);
      // Continue with other files
    }
  }
  return urls;
};

/**
 * Upload question/answer attachments via CDN upload-safe
 * Returns array of CDN URLs
 */
export const uploadQuestionAttachments = async (
  files: Array<{ uri: string; name: string; type: string }>,
  taskId?: string
): Promise<string[]> => {
  console.log(`❓ Uploading ${files.length} Q&A attachment(s) via CDN...`);

  const urls: string[] = [];
  for (const file of files) {
    try {
      const response = await uploadFileSafe(
        { uri: file.uri, type: file.type, name: file.name },
        { accessType: 'public', taskId, folder: 'questions', type: 'question' }
      );
      urls.push(response.data.url);
    } catch (error: any) {
      console.error(`❌ Q&A attachment rejected:`, error.message);
    }
  }
  return urls;
};

/**
 * Upload profile avatar via CDN
 * Returns the CDN URL for the avatar
 */
export const uploadProfileAvatar = async (imageUri: string): Promise<string> => {
  console.log('👤 Uploading profile avatar via CDN...');

  const file = createCDNFile(imageUri, `avatar_${Date.now()}.jpg`);
  const response = await uploadFileToCDN({
    file,
    accessType: 'public',
    folder: 'profiles',
    type: 'profile',
  });
  console.log('✅ Avatar uploaded:', response.data.url);
  return response.data.url;
};

/**
 * Upload chat image via CDN
 */
export const uploadChatImage = async (
  imageUri: string,
  taskId: string,
  fileName: string = 'chat-image.jpg'
): Promise<string> => {
  const response = await uploadFileToCDN({
    file: { uri: imageUri, type: 'image/jpeg', name: fileName },
    accessType: 'public',
    taskId,
    folder: 'chat',
    type: 'chat',
  });
  return normalizeCDNUrl(response.data.url);
};

/**
 * Upload chat file/document via CDN
 */
export const uploadChatFile = async (
  fileUri: string,
  fileName: string,
  fileType: string,
  taskId: string
): Promise<string> => {
  const response = await uploadFileToCDN({
    file: { uri: fileUri, type: fileType, name: fileName },
    accessType: 'public',
    taskId,
    folder: 'chat',
    type: 'chat',
  });
  return normalizeCDNUrl(response.data.url);
};
