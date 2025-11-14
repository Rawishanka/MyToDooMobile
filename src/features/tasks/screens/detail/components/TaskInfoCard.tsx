import { Task } from '@/src/api/types/tasks';
import { formatCurrency, getCurrencyFromLocation } from '@/src/shared/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskInfoCardProps {
  task: Task;
  getLocationIcon: () => 'location-outline' | 'desktop-outline' | 'car-outline';
  getTimeDisplay: () => string;
}

export const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  task,
  getLocationIcon,
  getTimeDisplay,
}) => {
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
    
    // Debug log for task images
    console.log('🖼️ Task Images Debug:', {
      hasImagesField: !!task.images,
      imagesCount: task.images?.length || 0,
      images: task.images,
      imagesPreview: task.images?.slice(0, 2).map(img => img?.substring(0, 100))
    });
  }, [task.createdBy, task.images]);

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
    const typoFixes: Array<[RegExp, string]> = [
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
    console.log('🚨 renderImageGallery called!');
    console.log('🚨 task.images exists?', !!task.images);
    console.log('🚨 task.images value:', task.images);
    console.log('🚨 task.images length:', task.images?.length);
    
    if (!task.images || task.images.length === 0) {
      console.error('❌ NO IMAGES FOUND IN TASK DATA!');
      console.error('❌ This is why Photos section is not showing');
      console.error('❌ Backend is not returning images array');
      
      // TEMPORARY: Show a message indicating no images were uploaded
      return (
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryTitle}>Photos (0)</Text>
          <Text style={styles.noImagesText}>No photos were saved with this task</Text>
        </View>
      );
    }

    console.log('✅ Task has images array!');
    console.log('🖼️ Task images (original):', task.images);
    console.log('🖼️ First image type:', typeof task.images[0]);
    console.log('🖼️ First image value:', task.images[0]);

    // Extract image strings from whatever format backend sends
    const extractImageString = (imageData: any): string | null => {
      if (!imageData) {
        console.log('❌ Image data is null/undefined');
        return null;
      }
      
      // If already a string, return it
      if (typeof imageData === 'string') {
        console.log('✅ Image is already a string');
        return imageData;
      }
      
      // If it's an object, try common properties
      if (typeof imageData === 'object') {
        const keys = Object.keys(imageData);
        console.log('🔍 Image is object with properties:', keys);
        
        // Check common URL properties
        if (imageData.url) {
          console.log('✅ Found image.url property');
          return imageData.url;
        }
        if (imageData.uri) {
          console.log('✅ Found image.uri property');
          return imageData.uri;
        }
        if (imageData.path) {
          console.log('✅ Found image.path property');
          return imageData.path;
        }
        if (imageData.src) {
          console.log('✅ Found image.src property');
          return imageData.src;
        }
        
        // Check if it has data and contentType (some backends send structured objects)
        if (imageData.data && imageData.contentType) {
          console.log('✅ Found structured data with contentType');
          return `data:${imageData.contentType};base64,${imageData.data}`;
        }
        
        // Just data property without contentType
        if (imageData.data && typeof imageData.data === 'string') {
          console.log('✅ Found data property (assuming base64 image)');
          return `data:image/jpeg;base64,${imageData.data}`;
        }
        
        // Check if it's a Buffer object
        if (imageData.type === 'Buffer' && imageData.data) {
          console.log('✅ Found Buffer object');
          try {
            const base64 = btoa(String.fromCharCode(...imageData.data));
            return `data:image/jpeg;base64,${base64}`;
          } catch (error) {
            console.error('❌ Failed to convert buffer to base64:', error);
          }
        }
        
        console.warn('⚠️ Could not extract image string from object properties:', keys);
      }
      
      return null;
    };

    // Convert all images to strings first
    const imageStrings = task.images
      .map((imageData, index) => {
        const result = extractImageString(imageData);
        console.log(`📸 Image ${index} extraction:`, {
          input: typeof imageData === 'object' ? `Object with keys: ${Object.keys(imageData).join(', ')}` : imageData,
          output: result ? `${result.substring(0, 60)}...` : 'null'
        });
        return result;
      })
      .filter((uri): uri is string => uri !== null);
    
    console.log('🔄 Extracted image strings count:', imageStrings.length);
    
    if (imageStrings.length === 0 && task.images.length > 0) {
      console.error('❌ Failed to extract any image strings!');
      console.error('❌ Raw images data:', JSON.stringify(task.images, null, 2));
    }

    // Fix and filter out any null/undefined/empty image URLs and validate format
    const fixedImages = imageStrings.map(uri => {
      const fixed = fixImageUri(uri);
      if (fixed !== uri) {
        console.log('🔧 URL fixed:', uri, '→', fixed);
      }
      return fixed;
    });
    
    console.log('🔧 Task images (after fixing):', fixedImages);
    
    // Be more lenient - try to show images even if validation is uncertain
    const validImages = fixedImages.filter(uri => {
      if (!uri) return false;
      const isValid = isValidImageUri(uri);
      console.log(`🔍 Validating image: ${uri.substring(0, 50)}... → ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      // Show image anyway if it looks like a URL or data URI
      return uri.length > 10;
    });
    
    console.log('✅ Images to display:', validImages.length, 'of', imageStrings.length);
    console.log('✅ Final images array:', validImages.map(img => img.substring(0, 80)));
    
    if (validImages.length === 0) {
      console.warn('⚠️ No displayable images found after extraction');
      console.warn('⚠️ Original images:', task.images);
      return null;
    }

    // Log first image for debugging
    if (validImages.length > 0) {
      const firstImage = validImages[0];
      console.log('🔍 First image details:', {
        uri: firstImage.substring(0, 50) + (firstImage.length > 50 ? '...' : ''),
        isDataUri: firstImage.startsWith('data:'),
        isHttpUri: firstImage.startsWith('http'),
        length: firstImage.length
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
              
              console.log(`🏞️ Rendering image ${globalIndex}:`, finalImageUri);
              console.log(`🔍 Original vs Final URL:`, { original: imageUri, final: finalImageUri });
              
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
                          // Add headers for better S3 compatibility
                          headers: {
                            'Accept': 'image/*',
                          }
                        }} 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                        onLoadStart={() => {
                          console.log(`🔄 Loading started for image ${globalIndex}: ${finalImageUri}`);
                          handleImageLoadStart(globalIndex);
                        }}
                        onLoadEnd={() => {
                          console.log(`✅ Loading completed for image ${globalIndex}`);
                          handleImageLoadEnd(globalIndex);
                        }}
                        onError={(error) => {
                          console.error(`❌ Loading failed for image ${globalIndex} with URI: ${finalImageUri}`, error);
                          handleImageError(globalIndex, error);
                        }}
                      />
                    )}
                    
                    {hasError && (
                      <View style={styles.thumbnailImageError}>
                        <Ionicons name="image-outline" size={24} color="#999" />
                      </View>
                    )}
                    
                    {isLoading && (
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
                // Priority: 1. Base64 avatar, 2. Profile picture URL, 3. Generated avatar
                if (task.createdBy?.avatar?.startsWith('data:')) {
                  return task.createdBy.avatar; // Base64 image
                } else if (task.createdBy?.profilePicture) {
                  return task.createdBy.profilePicture; // URL image
                } else {
                  // Always fallback to generated avatar
                  const firstName = task.createdBy?.firstName || 'User';
                  const lastName = task.createdBy?.lastName || '';
                  return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0052A2&color=fff&size=120`;
                }
              })()
            }}
            style={styles.avatarImage}
            onError={(error) => {
              console.log('Avatar image failed to load:', error);
              // Even on error, the UI avatar service should still work
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
          {task.location?.address || 'Location not specified'}
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
              const budget = task.budget || 56;
              const currencyInfo = getCurrencyFromLocation(task.location);
              return formatCurrency(budget, currencyInfo);
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
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  posterName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  budgetInfo: {
    marginLeft: 8,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#ff9800',
    fontStyle: 'italic',
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
  },
  // Image Gallery Styles
  imageGallery: {
    marginBottom: 12,
  },
  imageGalleryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noImagesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    marginRight: 8,
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
    width: 80,
    height: 80,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5', // Background color while loading
  },
  thumbnailImageError: {
    width: 80,
    height: 80,
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
    width: 80,
    marginRight: 8,
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
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  fullImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
