import { OCRAPI } from '@/src/api/ocr-api';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export interface AttachmentItem {
  id: string;
  uri: string;
  type: 'image' | 'document';
  name: string;
  size?: number;
}

interface AttachmentPickerProps {
  attachments: AttachmentItem[];
  onAttachmentsChange: (attachments: AttachmentItem[]) => void;
  maxAttachments?: number;
  allowImages?: boolean;
  allowDocuments?: boolean;
  style?: any;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  attachments = [],
  onAttachmentsChange,
  maxAttachments = 5,
  allowImages = true,
  allowDocuments = true,
  style
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const addAttachment = (newAttachment: AttachmentItem) => {
    const updatedAttachments = [...attachments, newAttachment];
    onAttachmentsChange(updatedAttachments);
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(item => item.id !== id);
    onAttachmentsChange(updatedAttachments);
  };

  const pickImage = async () => {
    try {
      setIsProcessing(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your photos to attach images.');
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        // ✅ OCR: Validate image for sensitive data
        console.log('🔍 Analyzing image for sensitive data...');
        const validation = await OCRAPI.validateImageForUpload(asset.uri);
        
        if (!validation.isValid) {
          console.warn('❌ Image contains sensitive data:', validation.reason);
          Alert.alert(
            'Sensitive Data Detected',
            `This image contains sensitive information and cannot be uploaded:\n\n${validation.reason}\n\nPlease remove phone numbers and addresses before uploading.`,
            [{ text: 'OK' }]
          );
          setIsProcessing(false);
          return;
        }
        
        console.log('✅ Image passed OCR validation');
        const newAttachment: AttachmentItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize
        };
        addAttachment(newAttachment);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhoto = async () => {
    try {
      setIsProcessing(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your camera to take photos.');
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        // ✅ OCR: Validate image for sensitive data
        console.log('🔍 Analyzing photo for sensitive data...');
        const validation = await OCRAPI.validateImageForUpload(asset.uri);
        
        if (!validation.isValid) {
          console.warn('❌ Photo contains sensitive data:', validation.reason);
          Alert.alert(
            'Sensitive Data Detected',
            `This photo contains sensitive information and cannot be uploaded:\n\n${validation.reason}\n\nPlease remove phone numbers and addresses before uploading.`,
            [{ text: 'OK' }]
          );
          setIsProcessing(false);
          return;
        }
        
        console.log('✅ Photo passed OCR validation');
        const newAttachment: AttachmentItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize
        };
        addAttachment(newAttachment);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickDocument = async () => {
    try {
      setIsProcessing(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const newAttachment: AttachmentItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: 'document',
          name: asset.name,
          size: asset.size
        };
        addAttachment(newAttachment);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const showAttachmentOptions = () => {
    if (attachments.length >= maxAttachments) {
      Alert.alert('Maximum Reached', `You can only attach up to ${maxAttachments} items.`);
      return;
    }

    const options = ['Cancel'];
    const actions: (() => void)[] = [];

    if (allowImages) {
      options.push('Take Photo', 'Choose Photo');
      actions.push(takePhoto, pickImage);
    }

    if (allowDocuments) {
      options.push('Choose File');
      actions.push(pickDocument);
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            actions[buttonIndex - 1]?.();
          }
        }
      );
    } else {
      const alertOptions: Array<{ text: string; onPress?: () => void; style?: any }> = [
        { text: 'Cancel', style: 'cancel' }
      ];

      if (allowImages) {
        alertOptions.push(
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose Photo', onPress: pickImage }
        );
      }

      if (allowDocuments) {
        alertOptions.push({ text: 'Choose File', onPress: pickDocument });
      }

      Alert.alert('Add Attachment', 'Choose an option', alertOptions);
    }
  };

  const renderAttachmentItem = ({ item }: { item: AttachmentItem }) => (
    <View style={styles.attachmentItem}>
      <View style={styles.attachmentContent}>
        {item.type === 'image' ? (
          <Image source={{ uri: item.uri }} style={styles.attachmentImage} />
        ) : (
          <View style={styles.documentIcon}>
            <Ionicons name="document" size={24} color="#666" />
          </View>
        )}
        <View style={styles.attachmentInfo}>
          <Text style={styles.attachmentName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.size && (
            <Text style={styles.attachmentSize}>
              {(item.size / 1024 / 1024).toFixed(1)} MB
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeAttachment(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#FF4D4F" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Attachments List */}
      {attachments.length > 0 && (
        <FlatList
          data={attachments}
          renderItem={renderAttachmentItem}
          keyExtractor={(item) => item.id}
          style={styles.attachmentsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Attachment Button */}
      {attachments.length < maxAttachments && (
        <TouchableOpacity
          style={[styles.addButton, isProcessing && styles.addButtonDisabled]}
          onPress={showAttachmentOptions}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Ionicons name="hourglass" size={20} color="#999" />
              <Text style={styles.addButtonTextDisabled}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="attach" size={20} color="#007AFF" />
              <Text style={styles.addButtonText}>
                Attach {allowImages && allowDocuments ? 'Image or File' : allowImages ? 'Image' : 'File'}
                {attachments.length > 0 && ` (${attachments.length}/${maxAttachments})`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  attachmentsList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  attachmentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
  },
  addButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  addButtonTextDisabled: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    marginLeft: 8,
  },
});