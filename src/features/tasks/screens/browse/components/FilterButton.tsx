import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface FilterButtonProps {
  filteredTasksCount: number;
  onPress: () => void;
}

export default function FilterButton({ filteredTasksCount, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity style={styles.filterBtn} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name="options-outline" size={16} color="#1A2980" />
      <Text style={styles.filterText}>Filter</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{filteredTasksCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filterText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#1A2980',
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: '#1A2980',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  countText: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
