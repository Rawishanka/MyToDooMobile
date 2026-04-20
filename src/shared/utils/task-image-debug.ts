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
    console.log(`🔍 === TASK DEBUG: ${context} ===`);
    console.log('🔍 Task ID:', task?.id);
    console.log('🔍 Task Title:', task?.title);
    console.log('🔍 Has images field:', !!task?.images);
    console.log('🔍 Images type:', typeof task?.images);
    console.log('🔍 Images is array:', Array.isArray(task?.images));
    console.log('🔍 Images count:', task?.images?.length || 0);
    console.log('🔍 Images raw value:', task?.images);
    console.log('🔍 Images JSON:', JSON.stringify(task?.images, null, 2));
    
    if (task?.images?.length > 0) {
      console.log('🔍 First image analysis:', {
        type: typeof task.images[0],
        isString: typeof task.images[0] === 'string',
        length: typeof task.images[0] === 'string' ? task.images[0].length : 'N/A',
        preview: typeof task.images[0] === 'string' ? task.images[0].substring(0, 100) + '...' : task.images[0],
        isCloudinary: typeof task.images[0] === 'string' && task.images[0].includes('cloudinary'),
        isDataUri: typeof task.images[0] === 'string' && task.images[0].startsWith('data:'),
        isHttpUri: typeof task.images[0] === 'string' && task.images[0].startsWith('http')
      });
    }
    
    // Check alternative image fields
    const altFields = ['image', 'photos', 'pictures', 'attachments', 'files'];
    altFields.forEach(field => {
      if (task?.[field]) {
        console.log(`🔍 Alternative field '${field}':`, {
          type: typeof task[field],
          isArray: Array.isArray(task[field]),
          length: task[field]?.length,
          value: Array.isArray(task[field]) ? task[field].slice(0, 2) : task[field]
        });
      }
    });
    
    console.log('🔍 All task keys:', task ? Object.keys(task) : 'No task');
    console.log(`🔍 === END TASK DEBUG: ${context} ===`);
  },

  /**
   * Test if an image URL is accessible
   */
  testImageUrl: async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const isAccessible = response.ok;
      console.log(`🌐 Image URL test - ${url.substring(0, 50)}...: ${isAccessible ? '✅ OK' : '❌ Failed'}`);
      return isAccessible;
    } catch (error) {
      console.log(`🌐 Image URL test - ${url.substring(0, 50)}...: ❌ Error -`, error);
      return false;
    }
  },

  /**
   * Compare task data before and after API call
   */
  compareTaskData: (beforeTask: any, afterTask: any) => {
    console.log('🔄 === TASK DATA COMPARISON ===');
    console.log('🔄 Before images:', beforeTask?.images?.length || 0);
    console.log('🔄 After images:', afterTask?.images?.length || 0);
    console.log('🔄 Images changed:', (beforeTask?.images?.length || 0) !== (afterTask?.images?.length || 0));
    
    if (beforeTask?.images && afterTask?.images) {
      console.log('🔄 Before images raw:', JSON.stringify(beforeTask.images, null, 2));
      console.log('🔄 After images raw:', JSON.stringify(afterTask.images, null, 2));
    }
    console.log('🔄 === END COMPARISON ===');
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