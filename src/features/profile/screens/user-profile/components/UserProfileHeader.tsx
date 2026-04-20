import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const UserProfileHeader: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleShare = () => {
    Alert.alert(
      'Share Profile',
      'Profile sharing functionality will be implemented in the next phase.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>User Profile</Text>
      <TouchableOpacity style={styles.shareIcon} onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  shareIcon: {
    padding: 4,
  },
});
