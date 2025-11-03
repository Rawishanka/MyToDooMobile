import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  return (
    <View style={styles.gridContainer}>
      {timeBlocks.map(block => (
        <TouchableOpacity
          key={block.value}
          style={[
            styles.gridItem,
            selectedTimeBlock === block.value && styles.gridItemSelected
          ]}
          onPress={() => onSelectTimeBlock(block.value)}
        >
          <View style={styles.iconContainer}>
            <Image source={block.icon} style={styles.timeIcon} />
          </View>
          <Text style={styles.gridTitle}>{block.label}</Text>
          <Text style={styles.gridDescription}>{block.description}</Text>
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
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  gridItemSelected: {
    borderColor: '#FF6A00',
    backgroundColor: '#FFF4E6',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  gridDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
