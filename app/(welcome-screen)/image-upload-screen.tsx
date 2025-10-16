import { useCreateTaskStore } from '@/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SnapPhotoScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { myTask, updateMyTask } = useCreateTaskStore();

  // Initialize with existing photos from store
  useEffect(() => {
    if (myTask.photos && myTask.photos.length > 0) {
      // Use the new photos array
      setImages(myTask.photos.filter(photo => photo)); // Filter out empty strings
    } else if (myTask.photo) {
      // Fallback to single photo for backwards compatibility
      setImages([myTask.photo].filter(photo => photo));
    }
  }, [myTask.photos, myTask.photo]);

  // Update store when images change
  useEffect(() => {
    // Save images to the new photos array
    updateMyTask({ 
      photos: images,
      photo: images[0] || '' // Keep backwards compatibility
    });
  }, [images, updateMyTask]);

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

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsProcessing(false);
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

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteImage = (uri: string) => {
    setImages(images.filter(img => img !== uri));
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Snap a photo</Text>
      <Text style={styles.subtitle}>
        Help taskers understand what needs doing. Take photos or choose from gallery. Add up to 10 photos ({images.length}/10)
      </Text>

      <ScrollView 
        style={styles.imageSection}
        contentContainerStyle={styles.imageContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderGridItems()}
      </ScrollView>

      <TouchableOpacity 
        onPress={() => router.push('/detail-screen')} 
        style={[
          styles.skipButton,
          images.length > 0 && styles.continueButton
        ]}
      >
        <Text style={[
          styles.skipText,
          images.length > 0 && styles.continueText
        ]}>
          {images.length > 0 ? 'Continue' : 'Skip for now'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B1A33',
    marginTop: 40,
  },
  subtitle: {
    color: '#667085',
    fontSize: 14,
    marginTop: 5,
  },
  imageSection: {
    flex: 1,
    marginTop: 20,
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
  skipButton: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingVertical: 15,
    borderRadius: 20,
  },
  continueButton: {
    backgroundColor: '#0052CC',
  },
  skipText: {
    color: '#2671FF',
    fontWeight: '600',
  },
  continueText: {
    color: '#FFFFFF',
  },
});