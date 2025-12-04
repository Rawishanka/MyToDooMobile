import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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

// ✅ NEW: Use OCR API for sensitive data detection
import { OCRAPI } from '@/src/api/ocr-api';

// Helper function to copy image to persistent storage
const copyImageToPersistentStorage = async (sourceUri: string): Promise<string> => {
  try {
    const filename = sourceUri.split('/').pop() || `image_${Date.now()}.jpg`;
    const destinationUri = `${FileSystem.documentDirectory}${filename}`;
    
    // Copy the file to a persistent location
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {

    // If copy fails, return original URI as fallback
    return sourceUri;
  }
};

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
  const { myTask, updateMyTask} = useCreateTaskStore();

  // Initialize with existing photos from store
  useEffect(() => {
    if (myTask.photos && myTask.photos.length > 0) {
      setImages(myTask.photos.filter(photo => photo));
    } else if (myTask.photo) {
      setImages([myTask.photo].filter(photo => photo));
    }
    
    // Initialize location if exists (only for CategoryTask)
    if (!myTask.isRemoval && myTask.location && myTask.coordinates) {
      setSelectedLocation({
        address: myTask.location,
        coordinates: myTask.coordinates
      });
    }
  }, [myTask]);

  // Update store when images change
  useEffect(() => {
    updateMyTask({ 
      photos: images,
      photo: images[0] || ''
    });
  }, [images, updateMyTask]);

  // ✅ NEW: Validate image using OCR API for sensitive data
  const validateAndAddImage = async (imageUri: string): Promise<boolean> => {
    try {

      const validation = await OCRAPI.validateImageForUpload(imageUri);
      
      if (!validation.isValid) {

        Alert.alert(
          'Sensitive Data Detected',
          `This image contains sensitive information and cannot be uploaded:

${validation.reason}

Please remove phone numbers and addresses from the image.`,
          [{ text: 'OK' }]
        );
        return false;
      }

      setImages(prevImages => [...prevImages, imageUri]);
      return true;
    } catch (error) {
      // Only log non-network errors in development
      if (!isNetworkError(error) && __DEV__) {

      }
      // Allow upload if OCR service fails
      setImages(prevImages => [...prevImages, imageUri]);
      return true;
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
        // Copy image to persistent storage to prevent cache deletion
        const persistentUri = await copyImageToPersistentStorage(result.assets[0].uri);
        // ✅ Validate with OCR before adding
        await validateAndAddImage(persistentUri);
      }
    } catch (error) {
      // Only log non-network errors in development
      if (!isNetworkError(error) && __DEV__) {

      }
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
        // Copy image to persistent storage to prevent cache deletion
        const persistentUri = await copyImageToPersistentStorage(result.assets[0].uri);
        // ✅ Validate with OCR before adding
        await validateAndAddImage(persistentUri);
      }
    } catch (error) {
      // Only log non-network errors in development
      if (!isNetworkError(error) && __DEV__) {

      }
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const handleDeleteImage = (uri: string) => {

    setImages(prevImages => prevImages.filter(img => img !== uri));
    setIsProcessing(false);
  };

  // Location handler
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);

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
    marginBottom: 50, // Increased space for validation text below
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
  // Validation text styles - MOVED BELOW IMAGE
  validationTextContainer: {
    position: 'absolute',
    bottom: -45, // Moved further down to be clearly below image
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    minHeight: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  validationTextSuccess: {
    fontSize: 10,
    color: '#16A34A', // Darker green for better readability
    fontWeight: '600',
    textAlign: 'center',
  },
  validationTextWarning: {
    fontSize: 10,
    color: '#DC2626', // Darker red for better readability
    fontWeight: '600',
    textAlign: 'center',
  },
  validationTextLoading: {
    fontSize: 10,
    color: '#3B82F6', // Blue for loading state
    fontWeight: '500',
    textAlign: 'center',
  },
  validationTextDetails: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
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