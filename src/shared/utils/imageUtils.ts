import * as FileSystem from 'expo-file-system';

/**
 * Convert image URIs to binary data for JSON upload
 */
export interface ImageData {
  uri: string;
  name: string;
  type: string;
  data: string; // base64 encoded binary data
  dataUri: string; // complete data URI for JSON upload
}

/**
 * Convert a single image URI to binary data
 */
export async function convertImageToBinary(uri: string): Promise<ImageData> {
  try {
    console.log('📷 Converting image to binary:', uri);
    
    // Read the file as base64
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Extract filename from URI
    const filename = uri.split('/').pop() || 'image.jpg';
    
    // Determine MIME type based on file extension
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    let mimeType = 'image/jpeg'; // default
    
    switch (extension) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        mimeType = 'image/jpeg';
        break;
    }

    const imageData: ImageData = {
      uri,
      name: filename,
      type: mimeType,
      data: base64Data,
      dataUri: `data:${mimeType};base64,${base64Data}`, // Complete data URI for JSON
    };

    console.log('✅ Image converted successfully:', {
      name: imageData.name,
      type: imageData.type,
      dataSize: `${(base64Data.length * 0.75 / 1024).toFixed(2)}KB`, // Approximate file size
    });

    return imageData;
  } catch (error) {
    console.error('❌ Failed to convert image to binary:', error);
    throw new Error(`Failed to convert image: ${error}`);
  }
}

/**
 * Convert multiple image URIs to binary data
 */
export async function convertImagesToBinary(uris: string[]): Promise<ImageData[]> {
  try {
    console.log('📷 Converting multiple images to binary:', uris.length);
    
    const promises = uris.map(uri => convertImageToBinary(uri));
    const results = await Promise.all(promises);
    
    console.log('✅ All images converted successfully:', results.length);
    return results;
  } catch (error) {
    console.error('❌ Failed to convert multiple images:', error);
    throw error;
  }
}

/**
 * Convert images to data URIs for JSON upload
 */
export function convertImagesToDataUris(images: ImageData[]): string[] {
  return images.map(image => image.dataUri);
}

/**
 * Create task data with binary images for JSON upload
 */
export function createTaskWithBinaryImages(taskData: any, images: ImageData[]): any {
  return {
    ...taskData,
    images: convertImagesToDataUris(images)
  };
}