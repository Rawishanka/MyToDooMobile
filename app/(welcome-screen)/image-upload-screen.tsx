import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function SnapPhotoScreen() {
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    if (images.length >= 10) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImages([...images, result.assets[0].uri]);
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
                onPress={pickImage} 
                style={styles.uploadBox}
              >
                <Ionicons name="add" size={28} color="#467FFF" />
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
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Snap a photo</Text>
      <Text style={styles.subtitle}>
        Help taskers understand what needs doing. Add up to 10 photos ({images.length}/10)
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