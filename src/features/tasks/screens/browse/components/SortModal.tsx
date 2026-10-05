import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: number;
  onSortChange: (index: number) => void;
  sortOptions: string[];
}

// Icon mapping for each sort option
const SORT_ICONS: Record<string, string> = {
  'Recommended':        'star-outline',
  'Price: High to low': 'trending-down-outline',
  'Price: Low to High': 'trending-up-outline',
  'Due date: Earliest': 'calendar-outline',
  'Due date: Latest':   'calendar-outline',
  'Newest tasks':       'time-outline',
  'Oldest tasks':       'hourglass-outline',
};

export default function SortModal({
  visible,
  onClose,
  selectedSort,
  onSortChange,
  sortOptions,
}: SortModalProps) {
  const { isDarkMode } = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.sheet, isDarkMode && { backgroundColor: '#1E293B' }]}>
          {/* Handle bar */}
          <View style={[styles.handle, isDarkMode && { backgroundColor: '#334155' }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconWrap, isDarkMode && { backgroundColor: '#0F172A' }]}>
                <Ionicons name="funnel-outline" size={18} color={isDarkMode ? '#003399' : '#FFFFFF'} />
              </View>
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>Sort By</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, isDarkMode && { backgroundColor: '#0F172A' }]}>
              <Ionicons name="close" size={20} color={isDarkMode ? '#6B7280' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, isDarkMode && { backgroundColor: '#334155' }]} />

          {/* Options */}
          <ScrollView keyboardShouldPersistTaps="handled"
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sortOptions.map((option, index) => {
              const isActive = selectedSort === index;
              const iconName = SORT_ICONS[option] || 'list-outline';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    isActive && (isDarkMode ? { backgroundColor: '#1E3A8A', borderColor: '#38BDF8' } : styles.optionActive)
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSortChange(index);
                    onClose();
                  }}
                >
                  <View style={[
                    styles.optionIconWrap,
                    isDarkMode && { backgroundColor: '#1E293B' },
                    isActive && styles.optionIconWrapActive
                  ]}>
                    <Ionicons
                      name={iconName as any}
                      size={18}
                      color={isActive ? '#fff' : (isDarkMode ? '#94A3B8' : '#FFFFFF')}
                    />
                  </View>
                  <Text style={[
                    styles.optionText,
                    isDarkMode && { color: '#CBD5E1' },
                    isActive && (isDarkMode ? { color: '#F8FAFC', fontWeight: 'bold' } : styles.optionTextActive)
                  ]}>
                    {option}
                  </Text>
                  {isActive && (
                    <View style={styles.checkWrap}>
                      <Ionicons name="checkmark-circle" size={22} color="#ff6b35" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,20,60,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#003399',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
    paddingBottom: 32,
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 20,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginVertical: 3,
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  optionActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconWrapActive: {
    backgroundColor: '#003399',
  },
  optionText: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#003399',
    fontWeight: '700',
  },
  checkWrap: {
    marginLeft: 'auto',
  },
});
