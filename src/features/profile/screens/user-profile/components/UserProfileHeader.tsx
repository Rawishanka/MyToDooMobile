import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { LightHeader } from '@/src/shared/components/custom_components/lightCard';

export const UserProfileHeader: React.FC = () => {
  const router = useRouter();

  const handleShare = () => {
    Alert.alert(
      'Share Profile',
      'Profile sharing functionality will be implemented in the next phase.',
      [{ text: 'OK' }]
    );
  };

  return (
    <LightHeader
      title="User Profile"
      onBack={() => router.back()}
      right={
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      }
    />
  );
};
