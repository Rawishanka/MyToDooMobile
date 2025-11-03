import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.header}>
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
    paddingTop: 50,
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
