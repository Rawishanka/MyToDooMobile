import { useTheme } from '@/src/shared/theme';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { FLOW } from '../flowTheme';

interface TimeBlock {
  label: string;
  value: string;
  description: string;
  icon: ImageSourcePropType;
}

interface TimeOfDayGridProps {
  timeBlocks: TimeBlock[];
  selectedTimeBlock: string;
  onSelectTimeBlock: (value: string) => void;
}

export const TimeOfDayGrid: React.FC<TimeOfDayGridProps> = ({
  timeBlocks,
  selectedTimeBlock,
  onSelectTimeBlock,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={styles.gridContainer}>
      {timeBlocks.map(block => (
        <TouchableOpacity
          key={block.value}
          style={[
            styles.gridItem,
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            selectedTimeBlock === block.value && [styles.gridItemSelected, isDarkMode && { backgroundColor: 'rgba(255, 106, 0, 0.15)', borderColor: '#FF6A00' }]
          ]}
          onPress={() => onSelectTimeBlock(block.value)}
        >
          <View style={styles.iconContainer}>
            <Image source={block.icon} style={styles.timeIcon} />
          </View>
          <Text style={[styles.gridTitle, selectedTimeBlock === block.value && styles.gridTitleSelected, isDarkMode && { color: '#F8FAFC' }]}>{block.label}</Text>
          <Text style={[styles.gridDescription, selectedTimeBlock === block.value && styles.gridDescriptionSelected, isDarkMode && { color: '#94A3B8' }]}>{block.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    backgroundColor: FLOW.glassStrong,
    padding: 15,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: FLOW.glassBorder,
    alignItems: 'center',
  },
  gridItemSelected: {
    borderColor: '#FF6A00',
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  timeIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  gridTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
    color: '#FFFFFF',
  },
  gridTitleSelected: {
    color: FLOW.blue,
  },
  gridDescription: {
    fontSize: RFValue(12),
    color: FLOW.textMuted,
    textAlign: 'center',
  },
  gridDescriptionSelected: {
    color: '#475569',
  },
});
