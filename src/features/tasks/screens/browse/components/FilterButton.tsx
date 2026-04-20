import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FilterButtonProps {
  filteredTasksCount: number;
  onPress: () => void;
}

export default function FilterButton({ filteredTasksCount, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity style={styles.filterBtn} onPress={onPress}>
      <MaterialCommunityIcons name="filter-variant" size={20} />
      <Text style={styles.filterText}>
        Filter ({filteredTasksCount})
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
