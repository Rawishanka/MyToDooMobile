import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { FLOW } from '../flowTheme';

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
              color={selectedType === 'In-person' ? FLOW.blue : '#FFFFFF'} 
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
              color={selectedType === 'Online' ? FLOW.blue : '#FFFFFF'} 
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
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: RFValue(13),
    color: FLOW.textMuted,
    marginBottom: 16,
  },
  locationTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  locationTypeOption: {
    flex: 1,
    backgroundColor: FLOW.glassStrong,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    borderWidth: 1.5,
    borderColor: FLOW.glassBorder,
  },
  locationTypeOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  locationIcon: {
    marginBottom: 8,
  },
  locationTypeTitle: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  locationTypeTitleSelected: {
    color: FLOW.blue,
  },
  locationTypeDescription: {
    fontSize: RFValue(11),
    color: FLOW.textMuted,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  locationTypeDescriptionSelected: {
    color: '#475569',
  },
  locationTypeBothOption: {
    backgroundColor: FLOW.glassStrong,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: FLOW.glassBorder,
  },
  locationTypeBothOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  locationTypeBothText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationTypeBothTextSelected: {
    color: FLOW.blue,
  },
});
