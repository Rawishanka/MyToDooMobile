// ============================================================
// ADD SKILLS MODAL
// Screenshot-exact UI: search input + suggested categories
// Uses existing useGetAllCategories() hook — no new API calls
// ============================================================
import { useGetCategoryNames } from '@/src/shared/hooks/useCategoriesApi';
import { RFValue } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────
interface AddSkillsModalProps {
  visible: boolean;
  /** Current skills already saved on the user profile */
  currentSkills: string[];
  /** Called when user taps "Save" — returns final skill list */
  onSave: (skills: string[]) => void;
  /** Called when user dismisses without saving */
  onClose: () => void;
}

// ─── Animated Skill Tag ───────────────────────────────────
const AnimatedSkillTag = ({
  skill,
  onRemove,
}: {
  skill: string;
  onRemove: () => void;
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove());
  };

  return (
    <Animated.View style={[styles.skillTag, { transform: [{ scale }], opacity }]}>
      <Text style={styles.skillTagText}>{skill}</Text>
      <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={14} color="#0052A2" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Suggested Skill Chip ─────────────────────────────────
const SuggestedChip = ({
  label,
  onAdd,
}: {
  label: string;
  onAdd: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    onAdd();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={styles.suggestedChip} onPress={handlePress} activeOpacity={0.75}>
        <Text style={styles.suggestedChipText}>{label}</Text>
        <Text style={styles.suggestedChipPlus}> +</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Modal ───────────────────────────────────────────
export default function AddSkillsModal({
  visible,
  currentSkills,
  onSave,
  onClose,
}: AddSkillsModalProps) {
  const insets = useSafeAreaInsets();
  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(600)).current;

  // ── Load categories from existing API hook (string[] with built-in fallback) ─
  const { data: allCategories = [], isLoading: categoriesLoading } = useGetCategoryNames();

  // ── Sync local skills when modal opens ───────────────────
  useEffect(() => {
    if (visible) {
      setLocalSkills([...currentSkills]);
      setInputText('');
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible]);

  // ── Filter: categories not yet added, matching search ────
  const filteredSuggestions: string[] = allCategories.filter((cat) => {
    const notAdded = !localSkills.some(
      (s) => s.toLowerCase() === cat.toLowerCase()
    );
    if (!inputText.trim()) return notAdded;
    return notAdded && cat.toLowerCase().includes(inputText.toLowerCase().trim());
  });

  // ── Add a skill ──────────────────────────────────────────
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const alreadyExists = localSkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) return;
    setLocalSkills((prev) => [...prev, trimmed]);
    setInputText('');
    Keyboard.dismiss();
  };

  // ── Remove a skill ───────────────────────────────────────
  const removeSkill = (index: number) => {
    setLocalSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = () => {
    onSave(localSkills);
  };

  // ── Close with animation ──────────────────────────────────
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          style={styles.avoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Pressable onPress={() => {}} style={{ flex: 1 }}>
              {/* ── Header (fixed, not scrolled) ── */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                  <Ionicons name="close" size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Skills</Text>
                <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>

              {/* ── Scrollable content ── */}
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
              {/* ── Description ── */}
              <Text style={styles.description}>
                Add skills that are relevant to the services you provide
              </Text>

              {/* ── Search Input ── */}
              <View style={styles.inputRow}>
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type a skill..."
                  placeholderTextColor="#aaa"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (inputText.trim()) addSkill(inputText);
                  }}
                  maxLength={60}
                  autoCapitalize="words"
                />
                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    !inputText.trim() && styles.addBtnDisabled,
                  ]}
                  onPress={() => {
                    if (inputText.trim()) addSkill(inputText);
                  }}
                  disabled={!inputText.trim()}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={inputText.trim() ? '#0052A2' : '#ccc'}
                  />
                </TouchableOpacity>
              </View>

              {/* ── Live search dropdown suggestions ── */}
              {inputText.trim().length > 0 && filteredSuggestions.length > 0 && (
                <View style={styles.dropdownContainer}>
                  <FlatList
                    data={filteredSuggestions.slice(0, 6)}
                    keyExtractor={(item) => item}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => addSkill(item)}
                      >
                        <Ionicons name="search-outline" size={14} color="#888" style={{ marginRight: 8 }} />
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.dropdownSeparator} />}
                  />
                </View>
              )}

              {/* ── Your Skills ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Your Skills{' '}
                  <Text style={styles.sectionCount}>({localSkills.length})</Text>
                </Text>

                {localSkills.length === 0 ? (
                  <Text style={styles.emptyHint}>
                    No skills added yet. Search above or tap a suggestion below.
                  </Text>
                ) : (
                  <View style={styles.tagsWrap}>
                    {localSkills.map((skill, index) => (
                      <AnimatedSkillTag
                        key={`${skill}-${index}`}
                        skill={skill}
                        onRemove={() => removeSkill(index)}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* ── Suggested Skills ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggested Skills</Text>

                {categoriesLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#0052A2" />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                  </View>
                ) : filteredSuggestions.length === 0 && !inputText.trim() ? (
                  <Text style={styles.emptyHint}>
                    All available skills have been added! ✓
                  </Text>
                ) : (
                  <View style={styles.suggestionsWrap}>
                    {(inputText.trim() ? filteredSuggestions : filteredSuggestions.slice(0, 10)).map(
                      (cat) => (
                        <SuggestedChip key={cat} label={cat} onAdd={() => addSkill(cat)} />
                      )
                    )}
                  </View>
                )}
              </View>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  avoidingView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '90%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 4,
  },
  headerBtn: {
    padding: 4,
    minWidth: 48,
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  saveText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#0052A2',
    textAlign: 'right',
  },

  // Description
  description: {
    fontSize: RFValue(14),
    color: '#555',
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 16,
  },

  // Search input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: RFValue(15),
    backgroundColor: '#f8f8f8',
    color: '#222',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#0052A2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addBtnDisabled: {
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },

  // Dropdown
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  dropdownItemText: {
    fontSize: RFValue(14),
    color: '#222',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#f3f3f3',
    marginHorizontal: 14,
  },

  // Section
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  sectionCount: {
    fontWeight: '500',
    color: '#555',
  },
  emptyHint: {
    fontSize: RFValue(13),
    color: '#aaa',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Your skills tags
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0052A2',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: '#fff',
  },
  skillTagText: {
    fontSize: RFValue(14),
    color: '#0052A2',
    fontWeight: '500',
  },

  // Suggested chips
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
  },
  suggestedChipText: {
    fontSize: RFValue(14),
    color: '#444',
  },
  suggestedChipPlus: {
    fontSize: RFValue(14),
    color: '#0052A2',
    fontWeight: '700',
  },

  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  loadingText: {
    fontSize: RFValue(13),
    color: '#888',
  },
});
