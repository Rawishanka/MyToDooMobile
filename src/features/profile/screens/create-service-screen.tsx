import { isAbnRequiredListingError } from '@/src/api/service-listing-api';
import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { useCreateServiceListing } from '@/src/shared/hooks/useServiceListingApi';
import { RFValue } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CreateServiceScreenProps {
  onBack: () => void;
  onCreated?: () => void;
  onNeedAbn?: () => void;
}

export default function CreateServiceScreen({
  onBack,
  onCreated,
  onNeedAbn,
}: CreateServiceScreenProps) {
  const insets = useSafeAreaInsets();
  const createMutation = useCreateServiceListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [radiusKm, setRadiusKm] = useState('30');
  const [suburb, setSuburb] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);
    const numericRadius = Number(radiusKm) || 30;

    if (!trimmedTitle || !trimmedDescription) {
      Alert.alert('Missing details', 'Please enter a title and description.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }
    if (!suburb.trim() || lat == null || lng == null) {
      Alert.alert('Location required', 'Please select a suburb / service area.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription,
        price: numericPrice,
        currency: 'AUD',
        radiusKm: numericRadius,
        suburb: suburb.trim(),
        lat,
        lng,
        categories: [],
      });
      Alert.alert('Service listed', 'Your service offering is now live.', [
        {
          text: 'OK',
          onPress: () => {
            onCreated?.();
            onBack();
          },
        },
      ]);
    } catch (error: any) {
      if (isAbnRequiredListingError(error)) {
        Alert.alert(
          'ABN required',
          error?.response?.data?.message ||
            'Verify your ABN before offering services.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Verify ABN',
              onPress: () => onNeedAbn?.(),
            },
          ]
        );
        return;
      }
      Alert.alert(
        'Could not create listing',
        error?.response?.data?.message || error?.message || 'Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create service</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Weekend lawn mowing"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what you offer"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Price (AUD)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="80"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Service radius (km)</Text>
        <TextInput
          style={styles.input}
          value={radiusKm}
          onChangeText={setRadiusKm}
          placeholder="30"
          placeholderTextColor="#999"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Suburb / service area</Text>
        <LocationAutocomplete
          onSelect={(location) => {
            setSuburb(location.address);
            setLat(location.coordinates.lat);
            setLng(location.coordinates.lng);
          }}
          placeholder="Search suburb..."
          country="AU"
          initialValue={suburb}
        />
        {suburb ? (
          <Text style={styles.selectedLocation}>{suburb}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, createMutation.isPending && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Publish service</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#003366',
    marginLeft: 8,
  },
  content: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: RFValue(15),
    color: '#222',
  },
  textArea: { minHeight: 110 },
  selectedLocation: {
    marginTop: 8,
    color: '#0052A2',
    fontSize: RFValue(13),
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#0052A2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: RFValue(16), fontWeight: '600' },
});
