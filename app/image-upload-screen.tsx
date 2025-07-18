import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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

  const renderImage = ({ item }: { item: string }) => (
    <View style={styles.imageWrapper}>
      <Image source={{ uri: item }} style={styles.uploadedImage} />
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteImage(item)}>
        <Ionicons name="close-circle" size={22} color="#FF4D4F" />
      </TouchableOpacity>
    </View>
  );

  const handleDeleteImage = (uri: string) => {
    setImages(images.filter(img => img !== uri));
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>


      <Text style={styles.title}>Snap a photo</Text>
      <Text style={styles.subtitle}>
        Help taskers understand what needs doing. Add up to 10 photos
      </Text>

      <View style={styles.imageSection}>
        <FlatList
          data={images}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderImage}
          ListFooterComponent={
            images.length < 10
              ? (
                <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
                  <Ionicons name="add" size={28} color="#467FFF" />
                </TouchableOpacity>
              )
              : null
          }
        />
      </View>

      <TouchableOpacity style={styles.skipButton} >
        <Text style={styles.skipText}>{images.length > 0 ? 'Continue' : 'Skip for now'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 11,
    padding: 1,
    zIndex: 2,
  },
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
    marginTop: 20,
    flexDirection: 'row',
  },
  uploadBox: {
    width: 70,
    height: 70,
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  uploadedImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  skipButton: {
    marginTop: 'auto',
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
