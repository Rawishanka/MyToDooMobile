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
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="funnel-outline" size={18} color="#1A2980" />
              </View>
              <Text style={styles.headerTitle}>Sort By</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Options */}
          <ScrollView
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
                  style={[styles.option, isActive && styles.optionActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSortChange(index);
                    onClose();
                  }}
                >
                  <View style={[styles.optionIconWrap, isActive && styles.optionIconWrapActive]}>
                    <Ionicons
                      name={iconName as any}
                      size={18}
                      color={isActive ? '#fff' : '#6B7280'}
                    />
                  </View>
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {option}
                  </Text>
                  {isActive && (
                    <View style={styles.checkWrap}>
                      <Ionicons name="checkmark-circle" size={22} color="#FF7A00" />
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
    paddingBottom: 32,
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8ECF4',
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
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#1A1D2E',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F6FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F8',
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
    backgroundColor: '#FAFBFF',
    borderWidth: 1,
    borderColor: '#F0F2F8',
  },
  optionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconWrapActive: {
    backgroundColor: '#1A2980',
  },
  optionText: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#4B5563',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#1A2980',
    fontWeight: '700',
  },
  checkWrap: {
    marginLeft: 'auto',
  },
});
