/**
 * Debug script to test task image fetching
 * Run this to see if the API is returning images correctly
 */

// Test task ID - replace with your actual task ID
const TEST_TASK_ID = "YOUR_TASK_ID_HERE";

// Mock API base URL - replace with your actual backend URL
const API_BASE_URL = "http://your-backend-url/api";

async function debugTaskImages() {
  console.log("🔍 === TASK IMAGE DEBUG SCRIPT ===");
  console.log("🔍 Testing task ID:", TEST_TASK_ID);
  
  try {
    // Test direct API call
    const response = await fetch(`${API_BASE_URL}/tasks/${TEST_TASK_ID}`);
    const data = await response.json();
    
    console.log("✅ API Response Status:", response.status);
    console.log("✅ API Response Headers:", Object.fromEntries(response.headers.entries()));
    console.log("✅ Full API Response:", JSON.stringify(data, null, 2));
    
    // Check the images field specifically
    const taskData = data?.data;
    console.log("🖼️ === IMAGE ANALYSIS ===");
    console.log("🖼️ Has images field:", !!taskData?.images);
    console.log("🖼️ Images type:", typeof taskData?.images);
    console.log("🖼️ Images is array:", Array.isArray(taskData?.images));
    console.log("🖼️ Images length:", taskData?.images?.length || 0);
    console.log("🖼️ Images content:", taskData?.images);
    
    if (taskData?.images && taskData.images.length > 0) {
      console.log("✅ IMAGES FOUND!");
      taskData.images.forEach((img, index) => {
        console.log(`📸 Image ${index + 1}:`, {
          type: typeof img,
          length: typeof img === 'string' ? img.length : 'N/A',
          preview: typeof img === 'string' ? img.substring(0, 100) + '...' : img,
          isCloudinary: typeof img === 'string' && img.includes('cloudinary')
        });
      });
    } else {
      console.log("❌ NO IMAGES FOUND IN RESPONSE");
      
      // Check all possible fields where images might be
      const possibleFields = ['images', 'image', 'photos', 'pictures', 'attachments', 'files'];
      possibleFields.forEach(field => {
        if (taskData?.[field]) {
          console.log(`🔍 Found alternative field '${field}':`, taskData[field]);
        }
      });
      
      console.log("🔍 All task data keys:", taskData ? Object.keys(taskData) : 'No data');
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Instructions for usage
console.log(`
📝 To use this debug script:

1. Replace TEST_TASK_ID with your actual task ID
2. Replace API_BASE_URL with your actual backend URL
3. Run this in a browser console or Node.js environment
4. Check if the API is returning the images field correctly

If images are missing from the API response but present in Swagger:
- Check if you're using the correct task ID
- Verify the backend is returning the complete task object
- Check if there are any cache issues

`);

// Uncomment to run immediately
// debugTaskImages();