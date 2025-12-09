import { Task } from '@/src/api/types/tasks';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { TaskImageDebug } from '@/src/shared/utils/task-image-debug';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Responsive utilities
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';

interface TaskInfoCardProps {
  task: Task;
  getLocationIcon: () => 'location-outline' | 'desktop-outline' | 'car-outline';
  getTimeDisplay: () => string;
  refetch?: () => void; // Added refetch function
}

export const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  task,
  getLocationIcon,
  getTimeDisplay,
  refetch, // Added refetch prop
}) => {
  // Use current user's location for currency auto-detection
  const { countryInfo } = useLocationCountry();
  
  // Helper function to parse location if it's a string
  const parseLocation = (location: any) => {
    if (!location) return null;
    
    // If it's already an object with address, return it
    if (typeof location === 'object' && location.address) {
      return location;
    }
    
    // If it's a string, try to parse it
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        console.log('📍 TaskInfoCard: Parsed stringified location:', parsed);
        return parsed;
      } catch (e) {
        // If parsing fails, treat it as plain address string
        console.warn('⚠️ TaskInfoCard: Could not parse location string:', location);
        return { address: location, coordinates: {} };
      }
    }
    
    return null;
  };
  
  // Get parsed location
  const parsedLocation = parseLocation(task.location);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const screenWidth = Dimensions.get('window').width;

  // Debug log to see what avatar and images data we have
  React.useEffect(() => {
    console.log('🖼️ Avatar Debug - Task Creator Data:', {
      firstName: task.createdBy?.firstName,
      lastName: task.createdBy?.lastName,
      hasAvatar: !!task.createdBy?.avatar,
      hasProfilePicture: !!task.createdBy?.profilePicture,
      avatarPreview: task.createdBy?.avatar?.substring(0, 50) + '...',
      profilePictureUrl: task.createdBy?.profilePicture
    });
    
    // Enhanced debug log for task images using debug utility
    TaskImageDebug.logTaskStructure(task, `TaskInfoCard useEffect - Task ${task._id}`);
    
    if (task.images && Array.isArray(task.images)) {
      const validation = TaskImageDebug.validateImageData(task.images);
      console.log('🖼️ Image validation result:', validation);
    }
  }, [task.createdBy, task.images, task._id]);

  const handleImageLoadStart = (index: number) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: true }));
    setImageErrors(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadEnd = (index: number) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number, error: any) => {
    console.error(`Failed to load image ${index}:`, error);
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const isValidImageUri = (uri: string): boolean => {
    if (!uri || typeof uri !== 'string') {
      console.log('❌ Invalid URI: not a string or empty');
      return false;
    }
    
    // Check for valid data URI format or HTTP(S) URLs
    const isValidFormat = (
      uri.startsWith('data:image/') || 
      uri.startsWith('http://') || 
      uri.startsWith('https://') ||
      uri.startsWith('file://') ||
      uri.startsWith('data:') // More lenient for data URIs
    );

    // For data URIs, do basic validation
    if (uri.startsWith('data:')) {
      // Just check if it has some content after 'data:'
      const hasContent = uri.length > 20; // Reasonable minimum length
      if (!hasContent) {
        console.warn('⚠️ Data URI too short:', uri);
        return false;
      }
      console.log('✅ Data URI looks valid (length:', uri.length, ')');
      return true;
    }

    // For HTTP URLs, just check format is correct
    if (!isValidFormat) {
      console.warn('⚠️ URI format not recognized:', uri.substring(0, 50));
    }

    return isValidFormat;
  };

  const fixImageUri = (uri: string): string => {
    if (!uri) return uri;
    
    console.log('🔍 Checking URI for fixes:', uri);
    
    let correctedUri = uri;
    
    // Fix all known S3 URL typos
    const typoFixes: [RegExp, string][] = [
      // Domain typos
      [/amazoonaws\.com/g, 'amazonaws.com'],           // amazoonaws -> amazonaws
      [/aamazonaws\.com/g, 'amazonaws.com'],           // aamazonaws -> amazonaws  
      [/amazon\.aws\.com/g, 'amazonaws.com'],          // amazon.aws -> amazonaws
      [/amazonaws\.com\.com/g, 'amazonaws.com'],       // double .com
      
      // Region typos
      [/eu-noorth-1/g, 'eu-north-1'],                  // eu-noorth -> eu-north
      [/eu-norht-1/g, 'eu-north-1'],                   // eu-norht -> eu-north
      [/eu-nroth-1/g, 'eu-north-1'],                   // eu-nroth -> eu-north
      [/eu-north-11/g, 'eu-north-1'],                  // double 1
      
      // Bucket name typos
      [/chamithiimageupload/g, 'chamithimageupload'],  // double i
      [/chamithimageuplood/g, 'chamithimageupload'],   // uplood -> upload
    ];
    
    // Apply all fixes
    typoFixes.forEach(([pattern, replacement]) => {
      correctedUri = correctedUri.replace(pattern, replacement);
    });
    
    // Ensure HTTPS for S3 URLs (AWS requires HTTPS for newer buckets)
    if (correctedUri.includes('amazonaws.com') && correctedUri.startsWith('http://')) {
      correctedUri = correctedUri.replace('http://', 'https://');
    }
    
    // Ensure proper S3 URL format
    if (correctedUri.includes('amazonaws.com') && !correctedUri.includes('.s3.')) {
      // Fix missing .s3. in URL if needed
      correctedUri = correctedUri.replace(/\.amazonaws\.com/, '.s3.amazonaws.com');
    }
    
    if (correctedUri !== uri) {
      console.log('🔧 Fixed image URL:', uri, '->', correctedUri);
    } else {
      console.log('✅ URL is already correct:', uri);
    }
    
    return correctedUri;
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImageIndex(null);
  };

  const renderImageGallery = () => {
    console.log('🔍 === RENDER IMAGE GALLERY DEBUG ===');
    console.log('🔍 renderImageGallery called for task:', task?.title || task?._id);
    console.log('🔍 task.images exists?', !!task.images);
    console.log('🔍 task.images type:', typeof task.images);
    console.log('🔍 task.images is array?', Array.isArray(task.images));
    console.log('🔍 task.images value:', task.images);
    console.log('🔍 task.images length:', task.images?.length);
    console.log('🔍 task.images JSON:', JSON.stringify(task.images, null, 2));
    
    // Check alternative image fields that backend might use
    const possibleImageFields = ['images', 'image', 'photos', 'pictures', 'attachments', 'files'];
    const foundImageFields: any[] = [];
    
    possibleImageFields.forEach(field => {
      const taskAsAny = task as any; // Type assertion for dynamic field access
      const fieldValue = taskAsAny?.[field];
      console.log(`🔍 Checking field '${field}':`, {
        exists: !!fieldValue,
        type: typeof fieldValue,
        isArray: Array.isArray(fieldValue),
        length: Array.isArray(fieldValue) ? fieldValue.length : 'N/A',
        value: fieldValue
      });
      
      if (fieldValue && (Array.isArray(fieldValue) ? fieldValue.length > 0 : true)) {
        foundImageFields.push({
          field,
          value: fieldValue,
          type: typeof fieldValue,
          isArray: Array.isArray(fieldValue),
          length: Array.isArray(fieldValue) ? fieldValue.length : 'N/A'
        });
      }
    });
    
    console.log('🔍 Found alternative image fields count:', foundImageFields.length);
    if (foundImageFields.length > 0) {
      console.log('✅ Found alternative image fields:', foundImageFields);
    }
    
    // Show task structure for debugging
    console.log('🔍 === COMPLETE TASK STRUCTURE ===');
    console.log('🔍 Task ID:', task?._id);
    console.log('🔍 Task title:', task?.title);
    console.log('🔍 Task keys:', task ? Object.keys(task) : 'No task');
    console.log('🔍 Full task object:', JSON.stringify(task, null, 2));
    console.log('🔍 === END TASK STRUCTURE ===');
    
    if (!task.images || !Array.isArray(task.images) || task.images.length === 0) {
      console.log('🔍 NO IMAGES FOUND IN TASK DATA!');
      console.log('🔍 This is why Photos section is not showing');
      console.log('🔍 task.images:', task.images);
      console.log('🔍 All task keys:', task ? Object.keys(task) : 'No task');
      console.log('🔍 Alternative image fields found:', foundImageFields.length);
      
      // Check if images field exists but is empty
      if (task.images && Array.isArray(task.images) && task.images.length === 0) {
        console.log('🔍 CRITICAL: Images field exists but is EMPTY ARRAY!');
        console.log('🔍 This means either:');
        console.log('🔍   1. Images were not saved during task creation');
        console.log('🔍   2. Images were saved but not returned by backend');
        console.log('🔍   3. Images were deleted after creation');
      }
      
      // Show debug info in development
      return (
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryTitle}>Photos (0)</Text>
          <Text style={styles.noImagesText}>No photos were found with this task</Text>
        </View>
      );
    }

    console.log('✅ Task has images array!');
    console.log('🖼️ Task images (original):', task.images);
    console.log('🖼️ First image type:', typeof task.images[0]);
    console.log('🖼️ First image value:', task.images[0]);

    // If main images field is empty but we found alternatives, try to use them
    let imageDataToProcess = task.images;
    if ((!imageDataToProcess || imageDataToProcess.length === 0) && foundImageFields.length > 0) {
      console.log('🔄 Using alternative image field:', foundImageFields[0].field);
      const alternativeValue = foundImageFields[0].value;
      imageDataToProcess = Array.isArray(alternativeValue) 
        ? alternativeValue 
        : [alternativeValue];
    }

    if (!imageDataToProcess || imageDataToProcess.length === 0) {
      console.log('🔍 No processable image data found');
      return (
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryTitle}>Photos (0)</Text>
          <Text style={styles.noImagesText}>No displayable photos found</Text>
        </View>
      );
    }

    // Enhanced image string extraction with comprehensive support
    const extractImageString = (imageData: any): string | null => {
      console.log('🔍 Processing image data:', {
        type: typeof imageData,
        isNull: imageData === null,
        isUndefined: imageData === undefined,
        preview: typeof imageData === 'string' ? imageData.substring(0, 50) : 'Not string'
      });

      if (!imageData) {
        console.log('❌ Image data is null/undefined');
        return null;
      }
      
      // If already a string (most common case for CDN URLs or data URIs)
      if (typeof imageData === 'string') {
        console.log('✅ Image is already a string, length:', imageData.length);
        // Handle various URL patterns
        if (imageData.startsWith('http') || imageData.startsWith('https') || imageData.startsWith('data:')) {
          return imageData;
        }
        // Handle relative URLs or file paths
        if (imageData.startsWith('/') || imageData.includes('cloudinary') || imageData.includes('s3') || imageData.includes('cdn')) {
          return imageData.startsWith('/') ? `https://your-api-domain.com${imageData}` : imageData;
        }
        // Return as-is and let React Native handle it
        return imageData;
      }
      
      // If it's an object, try multiple extraction strategies
      if (typeof imageData === 'object') {
        const keys = Object.keys(imageData);
        console.log('🔍 Image is object with properties:', keys);
        
        // Strategy 1: Common URL properties
        const urlProperties = ['url', 'uri', 'path', 'src', 'location', 'link', 'href'];
        for (const prop of urlProperties) {
          if (imageData[prop] && typeof imageData[prop] === 'string') {
            console.log(`✅ Found ${prop} property:`, imageData[prop].substring(0, 50));
            return imageData[prop];
          }
        }
        
        // Strategy 2: Base64 data with content type
        if (imageData.data && imageData.contentType) {
          console.log('✅ Found structured data with contentType:', imageData.contentType);
          return `data:${imageData.contentType};base64,${imageData.data}`;
        }
        
        // Strategy 3: Just base64 data (assume JPEG)
        if (imageData.data && typeof imageData.data === 'string' && imageData.data.length > 100) {
          console.log('✅ Found base64 data property, length:', imageData.data.length);
          // Check if it's already a data URI
          if (imageData.data.startsWith('data:')) {
            return imageData.data;
          }
          // Assume it's raw base64
          return `data:image/jpeg;base64,${imageData.data}`;
        }
        
        // Strategy 4: Buffer object
        if (imageData.type === 'Buffer' && imageData.data && Array.isArray(imageData.data)) {
          console.log('✅ Found Buffer object, converting to base64');
          try {
            const base64 = btoa(String.fromCharCode(...imageData.data));
            return `data:image/jpeg;base64,${base64}`;
          } catch (error) {
            console.log('🔍 Failed to convert buffer to base64:', error);
          }
        }
        
        // Strategy 5: Nested file object
        if (imageData.file && typeof imageData.file === 'object') {
          console.log('🔍 Found nested file object, recursing...');
          return extractImageString(imageData.file);
        }
        
        // Strategy 6: Try to find any string property that looks like an image
        for (const [key, value] of Object.entries(imageData)) {
          if (typeof value === 'string' && value.length > 20 && 
              (value.includes('http') || value.includes('data:image') || value.includes('base64'))) {
            console.log(`✅ Found image-like string in ${key} property`);
            return value;
          }
        }
        
        console.warn('⚠️ Could not extract image string from object, keys:', keys);
        console.warn('⚠️ Full object:', JSON.stringify(imageData, null, 2));
      }
      
      return null;
    };

    // Enhanced image validation - more permissive
    const isValidImageUri = (uri: string): boolean => {
      if (!uri || typeof uri !== 'string') return false;
      
      // Allow data URIs
      if (uri.startsWith('data:image/')) return true;
      
      // Allow HTTP/HTTPS URLs
      if (uri.startsWith('http://') || uri.startsWith('https://')) return true;
      
      // Allow relative paths that look like images
      if (uri.includes('.jpg') || uri.includes('.jpeg') || uri.includes('.png') || 
          uri.includes('.webp') || uri.includes('.gif')) return true;
      
      // Allow CDN URLs (cloudinary, S3, etc.)
      if (uri.includes('cloudinary') || uri.includes('s3.amazonaws') || 
          uri.includes('cdn.') || uri.includes('amazonaws.com')) return true;
      
      // For very long strings that might be base64 without proper prefix
      if (uri.length > 100 && !uri.includes(' ') && !uri.includes('\n')) {
        console.log('🔍 Possibly raw base64 string, allowing:', uri.substring(0, 50));
        return true;
      }
      
      console.log('❌ URI validation failed for:', uri.substring(0, 50));
      return false;
    };

    // Convert all images to strings first
    const imageStrings = imageDataToProcess
      .map((imageData, index) => {
        const result = extractImageString(imageData);
        console.log(`📸 Image ${index} extraction:`, {
          input: typeof imageData === 'object' && imageData !== null ? `Object with keys: ${Object.keys(imageData).join(', ')}` : String(imageData),
          output: result ? `${result.substring(0, 60)}...` : 'null',
          outputLength: result ? result.length : 0
        });
        return result;
      })
      .filter((uri): uri is string => uri !== null);
    
    console.log('🔄 Extracted image strings count:', imageStrings.length);
    
    if (imageStrings.length === 0 && imageDataToProcess.length > 0) {
      console.log('🔍 Failed to extract any image strings!');
      console.log('🔍 Raw images data:', JSON.stringify(imageDataToProcess.slice(0, 2), null, 2));
      
      // Show debug info to user in development
      return (
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryTitle}>Photos ({imageDataToProcess.length} found, 0 displayable)</Text>
          <Text style={styles.noImagesText}>
            Images found but could not be displayed. Check console for details.
          </Text>
          {__DEV__ && (
            <Text style={[styles.noImagesText, { fontSize: 10, color: '#999' }]}>
              DEV: {JSON.stringify(imageDataToProcess[0], null, 2).substring(0, 200)}...
            </Text>
          )}
        </View>
      );
    }

    // Fix and validate image URLs
    const fixedImages = imageStrings.map(uri => {
      const fixed = fixImageUri(uri);
      if (fixed !== uri) {
        console.log('🔧 URL fixed:', uri.substring(0, 50), '→', fixed.substring(0, 50));
      }
      return fixed;
    });
    
    console.log('🔧 Task images (after fixing):', fixedImages.length);
    
    // More lenient validation - prioritize showing images over strict validation
    const validImages = fixedImages.filter(uri => {
      if (!uri) return false;
      const isValid = isValidImageUri(uri);
      console.log(`🔍 Validating image: ${uri.substring(0, 50)}... → ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      return isValid;
    });
    
    console.log('✅ Images to display:', validImages.length, 'of', imageStrings.length);
    if (validImages.length > 0) {
      console.log('✅ First displayable image:', validImages[0].substring(0, 100));
    }
    
    if (validImages.length === 0) {
      console.warn('⚠️ No displayable images found after extraction');
      console.warn('⚠️ Original images:', imageDataToProcess?.length, 'images');
      console.warn('⚠️ Extracted strings:', imageStrings.length, 'strings');
      
      return (
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryTitle}>Photos ({imageDataToProcess?.length || 0})</Text>
          <Text style={styles.noImagesText}>
            {imageDataToProcess?.length > 0 
              ? `Found ${imageDataToProcess.length} images but couldn't display them. Format may be unsupported.`
              : 'No photos were saved with this task'}
          </Text>
        </View>
      );
    }

    // Log first image for debugging
    if (validImages.length > 0) {
      const firstImage = validImages[0];
      console.log('🔍 First image details:', {
        uri: firstImage.substring(0, 50) + (firstImage.length > 50 ? '...' : ''),
        isDataUri: firstImage.startsWith('data:'),
        isHttpUri: firstImage.startsWith('http'),
        length: firstImage.length,
        hasBase64: firstImage.includes('base64'),
        format: firstImage.match(/(jpeg|jpg|png|webp|gif)/i)?.[0] || 'unknown'
      });
    }

    // Group images into rows of 3
    const imageRows = [];
    for (let i = 0; i < validImages.length; i += 3) {
      imageRows.push(validImages.slice(i, i + 3));
    }

    return (
      <View style={styles.imageGallery}>
        <Text style={styles.imageGalleryTitle}>Photos ({validImages.length})</Text>
        {imageRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.imageRow}>
            {row.map((imageUri, imageIndex) => {
              const globalIndex = rowIndex * 3 + imageIndex;
              const isLoading = imageLoadingStates[globalIndex];
              const hasError = imageErrors[globalIndex];
              
              // Apply one final URL fix right before rendering
              const finalImageUri = fixImageUri(imageUri);
              
              console.log(`🏞️ Rendering image ${globalIndex}:`, {
                original: imageUri.substring(0, 50),
                final: finalImageUri.substring(0, 50),
                hasError,
                isLoading
              });
              
              return (
                <TouchableOpacity
                  key={globalIndex}
                  style={styles.imageWrapper}
                  onPress={() => !hasError && openImageModal(globalIndex)}
                  activeOpacity={hasError ? 1 : 0.8}
                >
                  <View style={styles.imageContainer}>
                    {!hasError && (
                      <Image 
                        source={{ 
                          uri: finalImageUri,
                          // Add headers for better compatibility
                          headers: {
                            'Accept': 'image/*',
                            'Cache-Control': 'no-cache'
                          }
                        }} 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                        onLoadStart={() => {
                          console.log(`🔄 Loading started for image ${globalIndex}`);
                          handleImageLoadStart(globalIndex);
                        }}
                        onLoadEnd={() => {
                          console.log(`✅ Loading completed for image ${globalIndex}`);
                          handleImageLoadEnd(globalIndex);
                        }}
                        onError={(error) => {
                          console.log(`🔍 Loading failed for image ${globalIndex}:`, {
                            uri: finalImageUri.substring(0, 100),
                            error: error.nativeEvent?.error || error
                          });
                          handleImageError(globalIndex, error);
                        }}
                      />
                    )}
                    
                    {hasError && (
                      <View style={styles.thumbnailImageError}>
                        <Ionicons name="image-outline" size={24} color="#999" />
                        <Text style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                          Load Error
                        </Text>
                      </View>
                    )}
                    
                    {isLoading && !hasError && (
                      <View style={styles.imageLoadingOverlay}>
                        <ActivityIndicator size="small" color="#0057FF" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            {/* Fill empty spaces in incomplete rows */}
            {Array.from({ length: 3 - row.length }).map((_, emptyIndex) => (
              <View key={`empty-${rowIndex}-${emptyIndex}`} style={styles.emptyImageSlot} />
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderImageModal = () => {
    if (!task.images || selectedImageIndex === null) return null;

    // Extract image strings (same logic as renderImageGallery)
    const extractImageString = (imageData: any): string | null => {
      if (!imageData) return null;
      if (typeof imageData === 'string') return imageData;
      if (typeof imageData === 'object') {
        if (imageData.url) return imageData.url;
        if (imageData.uri) return imageData.uri;
        if (imageData.path) return imageData.path;
        if (imageData.src) return imageData.src;
        if (imageData.data && imageData.contentType) {
          return `data:${imageData.contentType};base64,${imageData.data}`;
        }
        if (imageData.type === 'Buffer' && imageData.data) {
          const base64 = btoa(String.fromCharCode(...imageData.data));
          return `data:image/jpeg;base64,${base64}`;
        }
      }
      return null;
    };

    const imageStrings = task.images
      .map(extractImageString)
      .filter((uri): uri is string => uri !== null);

    const validImages = imageStrings
      .map(uri => fixImageUri(uri)) // Fix URLs first
      .filter(uri => uri && isValidImageUri(uri)); // Then validate
    
    if (validImages.length === 0 || selectedImageIndex >= validImages.length) return null;

    return (
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageModalBackdrop}
            activeOpacity={1}
            onPress={closeImageModal}
          >
            <View style={styles.imageModalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeImageModal}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: selectedImageIndex * screenWidth, y: 0 }}
              >
                {validImages.map((imageUri, index) => (
                  <View key={index} style={[styles.fullImageContainer, { width: screenWidth }]}>
                    <Image 
                      source={{ uri: imageUri }} 
                      style={styles.fullImage}
                      resizeMode="contain"
                      onError={(error) => console.error(`Failed to load modal image ${index}:`, error)}
                    />
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {(selectedImageIndex || 0) + 1} / {validImages.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.taskCard}>
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Image 
            source={{ 
              uri: (() => {
                const firstName = task.createdBy?.firstName || 'User';
                const lastName = task.createdBy?.lastName || '';
                
                // Priority: 1. Base64 avatar, 2. Avatar URL, 3. Profile picture URL, 4. Generated avatar
                if (task.createdBy?.avatar?.startsWith?.('data:')) {
                  console.log('✅ Using base64 avatar');
                  return task.createdBy.avatar; // Base64 image
                } else if (task.createdBy?.avatar && !task.createdBy.avatar.includes('ui-avatars.com')) {
                  console.log('✅ Using avatar URL:', task.createdBy.avatar);
                  return task.createdBy.avatar; // URL from backend
                } else if (task.createdBy?.profilePicture) {
                  console.log('✅ Using profilePicture URL:', task.createdBy.profilePicture);
                  return task.createdBy.profilePicture; // Profile picture URL
                } else {
                  // Fallback to generated avatar
                  console.log('⚠️ Using generated avatar for:', firstName, lastName);
                  return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0052A2&color=fff&size=120`;
                }
              })()
            }}
            style={styles.avatarImage}
            onError={(error) => {
              console.log('❌ Avatar image failed to load:', error);
              console.log('Task creator data:', task.createdBy);
            }}
          />
        </View>
      </View>

      {/* Task Title */}
      <Text style={styles.taskTitle}>{task.title}</Text>

      {/* Poster Info */}
      <View style={styles.posterInfo}>
        <Ionicons name="person-outline" size={16} color="#666" />
        <Text style={styles.posterName}>
          {task.createdBy?.firstName} {task.createdBy?.lastName}
        </Text>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New!</Text>
        </View>
      </View>

      {/* Task Creation Date */}
      {task.createdAt && (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            Posted {new Date(task.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      )}

      {/* Location */}
      <View style={styles.detailRow}>
        <Ionicons name={getLocationIcon()} size={16} color="#666" />
        <Text style={styles.detailText}>
          {(() => {
            const address = parsedLocation?.address || 'Location not specified';
            // Clean up any JSON remnants from address
            let cleanAddress = address;
            if (typeof address === 'string' && (address.includes('{') || address.includes('"coordinates"'))) {
              console.warn('⚠️ TaskInfoCard: Address contains JSON remnants:', address);
              // Try to extract just the address part
              const match = address.match(/"address":"([^"]+)"/);
              if (match) {
                cleanAddress = match[1];
              }
            }
            return cleanAddress;
          })()}
        </Text>
      </View>

      {/* Timing */}
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.detailText}>{getTimeDisplay()}</Text>
      </View>

      {/* Budget */}
      <View style={styles.budgetRow}>
        
        <Ionicons name="cash-outline" size={20} color="#000" />
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetAmount}>
            {(() => {
              const budget = task.budget;
              // Use user's current location for currency display (auto geo-location)
              const userCurrencyInfo = getCurrencyFromUserLocation(countryInfo);
              return budget ? formatCurrency(budget, userCurrencyInfo) : `${userCurrencyInfo.symbol}0.00`;
            })()}
          </Text>
          <Text style={styles.budgetLabel}>Budget</Text>
        </View>
      </View>

      {/* Category */}
      {task.categories && task.categories.length > 0 && (
        <Text style={styles.category}>{task.categories[0]}</Text>
      )}

      {/* Description */}
      {task.details && <Text style={styles.description}>{task.details}</Text>}

      {/* Image Gallery */}
      {renderImageGallery()}

      {/* Note */}
      <Text style={styles.note}>
        Note: It is equity share not the 10 dollar listed above
      </Text>

      {/* Image Modal */}
      {renderImageModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    padding: isTablet ? wp('3%') : wp('4%'),
    marginBottom: hp('2%'),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  avatar: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
  },
  taskTitle: {
    fontSize: RFValue(isTablet ? 18 : 18),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp('1.5%'),
    textAlign: 'center',
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  posterName: {
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#666',
    marginLeft: wp('1.5%'),
    marginRight: wp('2%'),
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: RFValue(9),
    color: '#fff',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  dateText: {
    fontSize: RFValue(11),
    color: '#999',
    marginLeft: wp('1.5%'),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  detailText: {
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#666',
    marginLeft: wp('2%'),
    flex: 1,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: isTablet ? wp('2%') : wp('3%'),
    borderRadius: 8,
    marginBottom: hp('1.5%'),
  },
  budgetInfo: {
    marginLeft: wp('2%'),
  },
  budgetAmount: {
    fontSize: RFValue(isTablet ? 18 : 18),
    fontWeight: '700',
    color: '#000',
  },
  budgetLabel: {
    fontSize: RFValue(11),
    color: '#666',
  },
  category: {
    fontSize: RFValue(11),
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  description: {
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#333',
    lineHeight: RFValue(isTablet ? 18 : 18),
    marginBottom: hp('1.5%'),
  },
  note: {
    fontSize: RFValue(11),
    color: '#ff9800',
    fontStyle: 'italic',
    backgroundColor: '#fff3e0',
    padding: wp('2%'),
    borderRadius: 4,
  },
  // Image Gallery Styles
  imageGallery: {
    marginBottom: hp('1.5%'),
  },
  imageGalleryTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
  },
  noImagesText: {
    fontSize: RFValue(12),
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: isTablet ? wp('3%') : wp('4%'),
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: hp('1%'),
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    marginRight: wp('2%'),
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  imageContainer: {
    position: 'relative',
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
  },
  thumbnailImage: {
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5', // Background color while loading
  },
  thumbnailImageError: {
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  emptyImageSlot: {
    width: isTablet ? 120 : 80,
    marginRight: wp('2%'),
  },
  // Image Modal Styles
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalBackdrop: {
    flex: 1,
    width: '100%',
  },
  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: wp('4%'),
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: wp('1.5%'),
  },
  fullImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isTablet ? wp('10%') : wp('5%'),
  },
  fullImage: {
    width: '100%',
    height: '70%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 15,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: RFValue(13),
    fontWeight: '500',
  },
});
