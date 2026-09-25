import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface FilterButtonProps {
  activeFiltersCount: number;
  onPress: () => void;
}

export default function FilterButton({ activeFiltersCount, onPress }: FilterButtonProps) {
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.filterBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]} 
      onPress={onPress} 
      activeOpacity={0.75}
    >
      <Ionicons name="options-outline" size={16} color={isDarkMode ? '#38BDF8' : '#003399'} />
      <Text style={[styles.filterText, isDarkMode && { color: '#F8FAFC' }]}>Filter</Text>
      {activeFiltersCount > 0 && (
        <View style={[styles.countBadge, isDarkMode && { backgroundColor: '#38BDF8' }]}>
          <Text style={[styles.countText, isDarkMode && { color: '#0B1120' }]}>{activeFiltersCount}</Text>
        </View>
      )}
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
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filterText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#003399',
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: '#003399',
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
