import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type LocationType = 'In-person' | 'Online' | 'Both';

interface LocationTypeSelectorProps {
  selectedType: LocationType;
  onTypeChange: (type: LocationType) => void;
}

export const LocationTypeSelector: React.FC<LocationTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Say where</Text>
      <Text style={styles.sectionSubtitle}>Where do you need it done?</Text>
      
      <View style={styles.locationTypeContainer}>
        <TouchableOpacity
          style={[
            styles.locationTypeOption,
            selectedType === 'In-person' && styles.locationTypeOptionSelected
          ]}
          onPress={() => onTypeChange('In-person')}
        >
          <View style={styles.locationIcon}>
            <Ionicons 
              name="person-outline" 
              size={28} 
              color={selectedType === 'In-person' ? '#fff' : '#2c3e50'} 
            />
          </View>
          <Text style={[
            styles.locationTypeTitle,
            selectedType === 'In-person' && styles.locationTypeTitleSelected
          ]}>
            In Person
          </Text>
          <Text style={[
            styles.locationTypeDescription,
            selectedType === 'In-person' && styles.locationTypeDescriptionSelected
          ]}>
            They need to show up at a place
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.locationTypeOption,
            selectedType === 'Online' && styles.locationTypeOptionSelected
          ]}
          onPress={() => onTypeChange('Online')}
        >
          <View style={styles.locationIcon}>
            <Ionicons 
              name="laptop-outline" 
              size={28} 
              color={selectedType === 'Online' ? '#fff' : '#2c3e50'} 
            />
          </View>
          <Text style={[
            styles.locationTypeTitle,
            selectedType === 'Online' && styles.locationTypeTitleSelected
          ]}>
            Online
          </Text>
          <Text style={[
            styles.locationTypeDescription,
            selectedType === 'Online' && styles.locationTypeDescriptionSelected
          ]}>
            They can do it from their home
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.locationTypeBothOption,
          selectedType === 'Both' && styles.locationTypeBothOptionSelected
        ]}
        onPress={() => onTypeChange('Both')}
      >
        <Text style={[
          styles.locationTypeBothText,
          selectedType === 'Both' && styles.locationTypeBothTextSelected
        ]}>
          Both (In Person & Online)
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 4,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  locationTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  locationTypeOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  locationTypeOptionSelected: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  locationIcon: {
    marginBottom: 8,
  },
  locationTypeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
    textAlign: 'center',
  },
  locationTypeTitleSelected: {
    color: '#fff',
  },
  locationTypeDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  locationTypeDescriptionSelected: {
    color: '#e0e0e0',
  },
  locationTypeBothOption: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  locationTypeBothOptionSelected: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  locationTypeBothText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  locationTypeBothTextSelected: {
    color: '#fff',
  },
});
