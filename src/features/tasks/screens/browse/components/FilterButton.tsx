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
      <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <Ionicons name="options-outline" size={14} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
      </View>
      <Text style={[styles.filterText, isDarkMode && { color: '#F8FAFC' }]}>Filter</Text>
      {activeFiltersCount > 0 && (
        <View style={[styles.countBadge, !isDarkMode && { backgroundColor: '#ff6b35' }, isDarkMode && { backgroundColor: '#38BDF8' }]}>
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
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingLeft: 6,
    paddingRight: 14,
    height: 40,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 0,
  },
  iconChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#FFFFFF',
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
