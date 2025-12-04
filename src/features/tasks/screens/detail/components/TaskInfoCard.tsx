import { Task } from '@/src/api/types/tasks';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { TaskImageDebug } from '@/src/shared/utils/task-image-debug';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        return parsed;
      } catch (e) {
        // If parsing fails, treat it as plain address string
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
    
    // Enhanced debug log for task images using debug utility
    
    if (task.images && Array.isArray(task.images)) {
      const validation = TaskImageDebug.validateImageData(task.images);
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
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const isValidImageUri = (uri: string): boolean => {
    if (!uri || typeof uri !== 'string') {
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
        return false;
      }
      return true;
    }

    // For HTTP URLs, just check format is correct
    if (!isValidFormat) {
    }

    return isValidFormat;
  };

  const fixImageUri = (uri: string): string => {
    if (!uri) return uri;
    
    
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
    } else {
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
    
    // Check alternative image fields that backend might use
    const possibleImageFields = ['images', 'image', 'photos', 'pictures', 'attachments', 'files'];
    const foundImageFields: any[] = [];
    
    possibleImageFields.forEach(field => {
      const taskAsAny = task as any; // Type assertion for dynamic field access
      const fieldValue = taskAsAny?.[field];
      
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
    
    if (foundImageFields.length > 0) {
    }
    
    // Show task structure for debugging
    
    if (!task.images || !Array.isArray(task.images) || task.images.length === 0) {
      
      // Check if images field exists but is empty
      if (task.images && Array.isArray(task.images) && task.images.length === 0) {
      }
      
      // Show debug info in development
      return (
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryTitle}>Photos (0)</Text>
          <Text style={styles.noImagesText}>No photos were found with this task</Text>
        </View>
      );
    }


    // If main images field is empty but we found alternatives, try to use them
    let imageDataToProcess = task.images;
    if ((!imageDataToProcess || imageDataToProcess.length === 0) && foundImageFields.length > 0) {
      const alternativeValue = foundImageFields[0].value;
      imageDataToProcess = Array.isArray(alternativeValue) 
        ? alternativeValue 
        : [alternativeValue];
    }

    if (!imageDataToProcess || imageDataToProcess.length === 0) {
      return (
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryTitle}>Photos (0)</Text>
          <Text style={styles.noImagesText}>No displayable photos found</Text>
        </View>
      );
    }

    // Enhanced image string extraction with comprehensive support
    const extractImageString = (imageData: any): string | null => {

      if (!imageData) {
        return null;
      }
      
      // If already a string (most common case for CDN URLs or data URIs)
      if (typeof imageData === 'string') {
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
        
        // Strategy 1: Common URL properties
        const urlProperties = ['url', 'uri', 'path', 'src', 'location', 'link', 'href'];
        for (const prop of urlProperties) {
          if (imageData[prop] && typeof imageData[prop] === 'string') {
            return imageData[prop];
          }
        }
        
        // Strategy 2: Base64 data with content type
        if (imageData.data && imageData.contentType) {
          return `data:${imageData.contentType};base64,${imageData.data}`;
        }
        
        // Strategy 3: Just base64 data (assume JPEG)
        if (imageData.data && typeof imageData.data === 'string' && imageData.data.length > 100) {
          // Check if it's already a data URI
          if (imageData.data.startsWith('data:')) {
            return imageData.data;
          }
          // Assume it's raw base64
          return `data:image/jpeg;base64,${imageData.data}`;
        }
        
        // Strategy 4: Buffer object
        if (imageData.type === 'Buffer' && imageData.data && Array.isArray(imageData.data)) {
          try {
            const base64 = btoa(String.fromCharCode(...imageData.data));
            return `data:image/jpeg;base64,${base64}`;
          } catch (error) {
          }
        }
        
        // Strategy 5: Nested file object
        if (imageData.file && typeof imageData.file === 'object') {
          return extractImageString(imageData.file);
        }
        
        // Strategy 6: Try to find any string property that looks like an image
        for (const [key, value] of Object.entries(imageData)) {
          if (typeof value === 'string' && value.length > 20 && 
              (value.includes('http') || value.includes('data:image') || value.includes('base64'))) {
            return value;
          }
        }
        
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
        return true;
      }
      
      return false;
    };

    // Convert all images to strings first
    const imageStrings = imageDataToProcess
      .map((imageData, index) => {
        const result = extractImageString(imageData);
        return result;
      })
      .filter((uri): uri is string => uri !== null);
    
    
    if (imageStrings.length === 0 && imageDataToProcess.length > 0) {
      
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
      return fixed;
    });
    
    
    // More lenient validation - prioritize showing images over strict validation
    const validImages = fixedImages.filter(uri => {
      if (!uri) return false;
      const isValid = isValidImageUri(uri);
      return isValid;
    });
    
    
    if (validImages.length === 0) {
      
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
                          handleImageLoadStart(globalIndex);
                        }}
                        onLoadEnd={() => {
                          handleImageLoadEnd(globalIndex);
                        }}
                        onError={(error) => {
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
                      onError={(error) => {}}
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
                  return task.createdBy.avatar; // Base64 image
                } else if (task.createdBy?.avatar && !task.createdBy.avatar.includes('ui-avatars.com')) {
                  return task.createdBy.avatar; // URL from backend
                } else if (task.createdBy?.profilePicture) {
                  return task.createdBy.profilePicture; // Profile picture URL
                } else {
                  // Fallback to generated avatar
                  return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0052A2&color=fff&size=120`;
                }
              })()
            }}
            style={styles.avatarImage}
            onError={(error) => {
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
