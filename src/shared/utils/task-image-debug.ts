/**
 * Task Image Debug Utility
 * This utility helps debug task image issues by providing comprehensive logging
 * and testing functions for the image upload/display pipeline
 */

export const TaskImageDebug = {
  
  /**
   * Log task data structure for debugging
   */
  logTaskStructure: (task: any, context: string = '') => {
    
    if (task?.images?.length > 0) {
    }
    
    // Check alternative image fields
    const altFields = ['image', 'photos', 'pictures', 'attachments', 'files'];
    altFields.forEach(field => {
      if (task?.[field]) {
      }
    });
    
  },

  /**
   * Test if an image URL is accessible
   */
  testImageUrl: async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const isAccessible = response.ok;
      return isAccessible;
    } catch (error) {
      return false;
    }
  },

  /**
   * Compare task data before and after API call
   */
  compareTaskData: (beforeTask: any, afterTask: any) => {
    
    if (beforeTask?.images && afterTask?.images) {
    }
  },

  /**
   * Validate image data format
   */
  validateImageData: (images: any[]): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (!Array.isArray(images)) {
      issues.push('Images is not an array');
      return { valid: false, issues };
    }
    
    if (images.length === 0) {
      issues.push('Images array is empty');
      return { valid: false, issues };
    }
    
    images.forEach((img, index) => {
      if (typeof img !== 'string') {
        issues.push(`Image ${index} is not a string (type: ${typeof img})`);
      } else if (!img.startsWith('http') && !img.startsWith('data:')) {
        issues.push(`Image ${index} is not a valid URL or data URI`);
      } else if (img.length < 10) {
        issues.push(`Image ${index} URL seems too short`);
      }
    });
    
    return { valid: issues.length === 0, issues };
  }
};