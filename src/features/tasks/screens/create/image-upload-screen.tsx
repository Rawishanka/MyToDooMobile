import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import smart image validation (the working one)
import {
  SmartValidationResult,
  TaskContext,
  validateImageSmart
} from '@/src/services/smartImageValidator';

interface LocationData {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export default function SnapPhotoScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const { myTask, updateMyTask } = useCreateTaskStore();

  // Smart validation states (using the working validation system)
  const [validationResults, setValidationResults] = useState<Map<string, SmartValidationResult>>(new Map());
  const [currentValidationImage, setCurrentValidationImage] = useState<string>('');
  const [isValidatingImage, setIsValidatingImage] = useState(false);

  // Debug function to test validation
  const testValidation = async () => {
    console.log('🧪 Testing validation system...');
    
    // Test API configuration first
    console.log('🔑 API Key check:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? 'PROVIDED' : 'MISSING');
    console.log('🔑 API Key value:', process.env.EXPO_PUBLIC_GEMINI_API_KEY?.substring(0, 20) + '...');
    
    const taskContext = getTaskContext();
    console.log('📋 Current task context:', taskContext);
    console.log('📋 Task has title:', !!taskContext.title);
    console.log('📋 Task has description:', !!taskContext.description);
    console.log('📋 Task has category:', !!taskContext.category);
    
    // Test with first image if available
    if (images.length > 0) {
      const testImageUri = images[0];
      console.log('🖼️ Testing with image:', testImageUri);
      console.log('🖼️ Validation results before test:', Array.from(validationResults.entries()));
      await validateImageWithOCR(testImageUri);
      console.log('🖼️ Validation results after test:', Array.from(validationResults.entries()));
    } else {
      console.log('⚠️ No images available for testing');
    }
  };

  // Initialize with existing photos from store
  useEffect(() => {
    if (myTask.photos && myTask.photos.length > 0) {
      setImages(myTask.photos.filter(photo => photo));
      
      // Add test validation results for existing images to check UI
      const testResults = new Map<string, SmartValidationResult>();
      myTask.photos.forEach((photo, index) => {
        if (photo) {
          testResults.set(photo, {
            isValid: true,
            confidence: 0.8,
            message: `🧪 Test validation message ${index + 1}`,
            reasons: ['Test reason'],
            suggestions: ['Test suggestion'],
            analysis: 'Test AI analysis'
          });
        }
      });
      setValidationResults(testResults);
      console.log('🧪 Set test validation results for existing images:', Array.from(testResults.entries()));
    } else if (myTask.photo) {
      setImages([myTask.photo].filter(photo => photo));
      
      // Add test validation for single photo
      if (myTask.photo) {
        const testResult: SmartValidationResult = {
          isValid: true,
          confidence: 0.8,
          message: '🧪 Test validation for single photo',
          reasons: ['Test reason'],
          suggestions: ['Test suggestion'],
          analysis: 'Test AI analysis'
        };
        setValidationResults(new Map([[myTask.photo, testResult]]));
        console.log('🧪 Set test validation result for single photo');
      }
    }
    
    // Initialize location if exists (only for CategoryTask)
    if (!myTask.isRemoval && myTask.location && myTask.coordinates) {
      setSelectedLocation({
        address: myTask.location,
        coordinates: myTask.coordinates
      });
    }
  }, [myTask]);

  // Debug logging for validation state
  useEffect(() => {
    console.log('🔍 Validation state updated:');
    console.log('🖼️ Images:', images.length);
    console.log('📋 Validation results:', validationResults.size);
    images.forEach((image, index) => {
      const result = validationResults.get(image);
      console.log(`🔍 Image ${index + 1}: ${result ? result.message : 'No validation result'}`);
    });
  }, [validationResults, images]);

  // Make test function available globally for debugging
  useEffect(() => {
    // @ts-ignore - Add to window for debugging
    global.testValidation = testValidation;
    console.log('🧪 Test validation function available as global.testValidation()');
    
    return () => {
      // @ts-ignore - Cleanup
      delete global.testValidation;
    };
  }, [myTask.photos, myTask.photo]);

  // Update store when images change
  useEffect(() => {
    updateMyTask({ 
      photos: images,
      photo: images[0] || ''
    });
  }, [images, updateMyTask]);

  // Helper function to build task context for OCR validation
  const getTaskContext = (): TaskContext => {
    return {
      title: myTask.title || '',
      description: myTask.description || '',
      category: myTask.isRemoval ? 'Moving' : (myTask as any)?.category || '',
      location: selectedLocation?.address || ''
    };
  };

  // Smart validation function (using the working validation system)
  const validateImageWithOCR = async (imageUri: string) => {
    try {
      setIsValidatingImage(true);
      setCurrentValidationImage(imageUri);
      
      console.log('🔍 Starting smart validation for:', imageUri);
      
      const taskContext = getTaskContext();
      console.log('📋 Task context for validation:', taskContext);
      
      // Check if we have sufficient context for validation
      if (!taskContext.title?.trim() && !taskContext.description?.trim()) {
        console.log('ℹ️ Insufficient task context, providing basic validation feedback');
        const basicResult = {
          isValid: true,
          confidence: 0.5,
          message: '📷 Image uploaded successfully. Add task details for better validation.',
          reasons: ['Insufficient task context'],
          suggestions: ['Add more task details for better validation'],
          analysis: 'Insufficient context for detailed analysis'
        };
        setValidationResults(prev => new Map(prev.set(imageUri, basicResult)));
        return true;
      }
      
      // Use the working smart validation system
      const validationResult = await validateImageSmart(imageUri, taskContext);
      
      console.log('✅ Smart validation result:', validationResult);
      console.log('📝 Validation message:', validationResult.message);
      console.log('🎯 Confidence:', validationResult.confidence);
      
      // Store the validation result for display purposes
      console.log('💾 Setting smart validation result for:', imageUri);
      setValidationResults(prev => {
        const newMap = new Map(prev);
        newMap.set(imageUri, validationResult);
        console.log('📋 Updated validation results after smart validation:', Array.from(newMap.entries()));
        return newMap;
      });
      
      // Never block image upload - just provide feedback
      return true;
      
    } catch (error) {
      console.error('❌ Smart validation failed:', error);
      
      // Create a meaningful error result
      const errorResult = {
        isValid: false,
        confidence: 0,
        message: '🔍 Unable to analyze image content',
        reasons: ['Validation service error'],
        suggestions: ['Try taking a clearer photo', 'Ensure good lighting'],
        analysis: 'Validation service temporarily unavailable'
      };
      setValidationResults(prev => new Map(prev.set(imageUri, errorResult)));
      
      // Always allow image upload even on error
      return true;
      
    } finally {
      setIsValidatingImage(false);
      setCurrentValidationImage('');
    }
  };

  // Modified image addition function - instant upload
  const addImageWithValidation = async (imageUri: string) => {
    try {
      console.log('📸 Adding image:', imageUri);
      
      // Add image immediately - NO BLOCKING
      setImages(prevImages => {
        const newImages = [...prevImages, imageUri];
        console.log('✅ Image added, total:', newImages.length);
        return newImages;
      });
      
      // Add simple success validation result
      setValidationResults(prev => {
        const newMap = new Map(prev);
        newMap.set(imageUri, {
          isValid: true,
          confidence: 1,
          message: '✓ Image added',
          reasons: ['Image ready'],
          suggestions: [],
          analysis: 'Image ready for upload'
        });
        return newMap;
      });
      
      // Optional: Run background validation without blocking
      setTimeout(() => {
        validateImageWithOCR(imageUri)
          .then(() => console.log('🎯 Background validation completed'))
          .catch(error => console.warn('⚠️ Background validation failed:', error));
      }, 500);
      
    } catch (error) {
      console.error('❌ Error adding image:', error);
      // Still add the image
      setImages(prevImages => [...prevImages, imageUri]);
    }
  };

  const showImagePickerOptions = () => {
    if (images.length >= 10) return;

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openImageLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const openCamera = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isProcessing) {
      console.log('⏳ Already processing...');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        // Use the new validation function instead of directly adding
        await addImageWithValidation(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const openImageLibrary = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is required to select photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isProcessing) {
      console.log('⏳ Already processing...');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        // Use the new validation function instead of directly adding
        await addImageWithValidation(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const handleDeleteImage = (uri: string) => {
    console.log('🗑️ Deleting image:', uri);
    
    // Remove image from state
    setImages(prevImages => {
      const newImages = prevImages.filter(img => img !== uri);
      console.log('✅ Image removed, remaining:', newImages.length);
      return newImages;
    });
    
    // Clear validation results
    setValidationResults(prev => {
      const newMap = new Map(prev);
      newMap.delete(uri);
      console.log('✅ Validation cleared, remaining validations:', newMap.size);
      return newMap;
    });
    
    // Reset processing state
    setIsProcessing(false);
    console.log('✅ Ready for new uploads');
  };

  // Location handler
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  const handleContinue = () => {
    // Update store with location data
    if (selectedLocation) {
      updateMyTask({
        location: selectedLocation.address,
        coordinates: selectedLocation.coordinates,
      });
    }
    router.push('/time-select-screen' as any);
  };

  const renderGridItems = () => {
    const items = [...images];
    
    // Add upload button if less than 10 images
    if (items.length < 10) {
      items.push('upload_button');
    }
    
    // Create rows of 4 items each
    const rows = [];
    for (let i = 0; i < items.length; i += 4) {
      rows.push(items.slice(i, i + 4));
    }
    
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.imageRow}>
        {row.map((item, itemIndex) => {
          if (item === 'upload_button') {
            return (
              <TouchableOpacity 
                key={`upload-${rowIndex}-${itemIndex}`}
                onPress={showImagePickerOptions} 
                style={[styles.uploadBox, isProcessing && styles.uploadBoxDisabled]}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Ionicons name="hourglass" size={24} color="#999" />
                ) : (
                  <>
                    <Ionicons name="camera" size={24} color="#467FFF" />
                    <Ionicons name="add" size={16} color="#467FFF" style={styles.addIcon} />
                  </>
                )}
              </TouchableOpacity>
            );
          }
          
          return (
            <View key={`${rowIndex}-${itemIndex}`} style={styles.imageWrapper}>
              <Image source={{ uri: item }} style={styles.uploadedImage} />
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => handleDeleteImage(item)}
              >
                <Ionicons name="close-circle" size={22} color="#FF4D4F" />
              </TouchableOpacity>
              
              {/* OCR validation message display - ALWAYS SHOW */}
              <View style={styles.validationTextContainer}>
                {validationResults.get(item) ? (
                  <>
                    <Text style={validationResults.get(item)?.isValid ? styles.validationTextSuccess : styles.validationTextWarning}>
                      {validationResults.get(item)?.message || (validationResults.get(item)?.isValid ? '✅ Image validated' : '⚠️ Image needs improvement')}
                    </Text>
                    {/* Show additional error details if available */}
                    {!validationResults.get(item)?.isValid && validationResults.get(item)?.suggestions && (
                      <Text style={styles.validationTextDetails}>
                        {validationResults.get(item)?.suggestions.join(', ')}
                      </Text>
                    )}
                    {/* Show confidence score for debugging */}
                    {validationResults.get(item)?.confidence !== undefined && (
                      <Text style={styles.validationTextDetails}>
                        Confidence: {Math.round((validationResults.get(item)?.confidence || 0) * 100)}%
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.validationTextWarning}>
                    🔄 Validation pending...
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        
        {/* Fill empty spaces in the row */}
        {Array.from({ length: 4 - row.length }).map((_, emptyIndex) => (
          <View key={`empty-${rowIndex}-${emptyIndex}`} style={styles.emptySlot} />
        ))}
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add photos & location</Text>
        <Text style={styles.subtitle}>
          Help taskers understand what needs doing. Add up to 10 photos ({images.length}/10)
        </Text>

        <View style={styles.imageSection}>
          {renderGridItems()}
        </View>

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionSubtitle}>Where do you need this done?</Text>
          
          <LocationAutocomplete
            onSelect={handleLocationSelect}
            placeholder="Enter address or suburb"
            initialValue={selectedLocation?.address}
          />
          
          {selectedLocation && (
            <View style={styles.selectedLocationContainer}>
              <Ionicons name="location" size={20} color="#0057FF" />
              <Text style={styles.selectedLocationText} numberOfLines={2}>
                {selectedLocation.address}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        onPress={handleContinue} 
        style={[
          styles.continueButton,
          selectedLocation && styles.continueButtonEnabled
        ]}
        disabled={!selectedLocation}
      >
        <Text style={styles.continueText}>
          Continue
        </Text>
      </TouchableOpacity>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B1A33',
  },
  subtitle: {
    color: '#667085',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
  },
  imageSection: {
    marginBottom: 30,
  },
  imageContainer: {
    paddingBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 30, // Add space for validation text below
  },
  uploadedImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 11,
    padding: 1,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  uploadBox: {
    width: 70,
    height: 70,
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E4E7EC',
    borderStyle: 'dashed',
    position: 'relative',
  },
  uploadBoxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8F9FA',
  },
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
  },
  emptySlot: {
    width: 70,
    marginRight: 10,
  },
  locationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 15,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0057FF',
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#D1D1D6',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonEnabled: {
    backgroundColor: '#0057FF',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Validation text styles
  validationTextContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    minHeight: 20,
  },
  validationTextSuccess: {
    fontSize: 10,
    color: '#22C55E',
    fontWeight: '500',
    textAlign: 'center',
  },
  validationTextWarning: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '500',
    textAlign: 'center',
  },
  validationTextLoading: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  validationTextDetails: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  skipButton: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingVertical: 15,
    borderRadius: 20,
  },
  skipText: {
    color: '#2671FF',
    fontWeight: '600',
  },
});