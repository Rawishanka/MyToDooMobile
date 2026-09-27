import { isAbnRequiredListingError } from '@/src/api/service-listing-api';
import { AppAlert } from '@/src/shared/components/AppAlert';
import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { useGetCategoryNames } from '@/src/shared/hooks/useCategoriesApi';
import { useCreateServiceListing } from '@/src/shared/hooks/useServiceListingApi';
import { validateContactContent } from '@/src/shared/utils/contactModeration';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlueBackdrop, IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';
import React, { useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AppLoader from '@/src/shared/components/AppLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CreateServiceScreenProps {
  onBack: () => void;
  onCreated?: () => void;
  onNeedAbn?: () => void;
}

export default function CreateServiceScreen({
  onBack,
  onCreated,
  onNeedAbn,
}: CreateServiceScreenProps) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const createMutation = useCreateServiceListing();
  const { data: categoryNames = [] } = useGetCategoryNames();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const filteredCategories = React.useMemo(() => {
    if (!categorySearchQuery.trim()) return categoryNames;
    const q = categorySearchQuery.toLowerCase().trim();
    return categoryNames.filter((c: string) => c.toLowerCase().includes(q));
  }, [categoryNames, categorySearchQuery]);
  const [price, setPrice] = useState('');
  const [radiusKm, setRadiusKm] = useState('30');
  const [suburb, setSuburb] = useState('');
  const [suburbDropdownOpen, setSuburbDropdownOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Visual-only: which text input currently shows the orange focus ring
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const focusProps = (name: string) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField((cur) => (cur === name ? null : cur)),
  });

  const handleBack = () => {
    Keyboard.dismiss();
    const hasUnsavedChanges =
      title.trim().length > 0 ||
      description.trim().length > 0 ||
      price.trim().length > 0 ||
      suburb.trim().length > 0 ||
      selectedCategory.length > 0;

    if (hasUnsavedChanges) {
      AppAlert.alert(
        'Discard Changes?',
        'You have unsaved details for this service offering. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              onBack();
            },
          },
        ]
      );
    } else {
      onBack();
    }
  };

  React.useEffect(() => {
    const onHardwareBack = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [title, description, price, suburb, selectedCategory]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCategory) {
      newErrors.category = 'Please select a category for this service.';
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Please enter a service title.';
    } else if (trimmedTitle.length < 5) {
      newErrors.title = 'Title must be at least 5 characters (currently ' + trimmedTitle.length + ').';
    } else {
      const mod = validateContactContent(trimmedTitle);
      if (!mod.isClean) {
        newErrors.title = mod.reason || 'Contact details are not allowed in titles.';
      }
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      newErrors.description = 'Please describe what you offer.';
    } else if (trimmedDesc.length < 15) {
      newErrors.description = 'Description must be at least 15 characters (currently ' + trimmedDesc.length + ').';
    } else {
      const mod = validateContactContent(trimmedDesc);
      if (!mod.isClean) {
        newErrors.description = mod.reason || 'Contact details are not allowed in descriptions.';
      }
    }

    const numPrice = Number(price);
    if (!price || Number.isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Please enter a valid price (AUD) greater than 0.';
    }

    const numRadius = Number(radiusKm);
    if (radiusKm && (Number.isNaN(numRadius) || numRadius < 1 || numRadius > 200)) {
      newErrors.radius = 'Radius must be between 1 and 200 km.';
    }

    if (!suburb.trim() || lat == null || lng == null) {
      newErrors.suburb = 'Please select a suburb / service location.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!validate()) {
      AppAlert.alert('Incomplete Details', 'Please check the highlighted fields before submitting.');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);
    const numericRadius = Number(radiusKm) || 30;

    try {
      await createMutation.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription,
        price: numericPrice,
        currency: 'AUD',
        radiusKm: numericRadius,
        suburb: suburb.trim(),
        lat: lat!,
        lng: lng!,
        categories: selectedCategory ? [selectedCategory] : [],
      });

      AppAlert.alert('Service Published! 🎉', 'Your service offering is now live for customers to discover and book.', [
        {
          text: 'View My Services',
          onPress: () => {
            if (onCreated) {
              onCreated();
            } else {
              onBack();
            }
          },
        },
      ]);
    } catch (error: any) {
      if (isAbnRequiredListingError(error)) {
        AppAlert.alert(
          'ABN Required',
          'You need a verified Australian Business Number (ABN) on your profile to publish service listings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add ABN',
              onPress: () => {
                if (onNeedAbn) onNeedAbn();
                else onBack();
              },
            },
          ]
        );
        return;
      }

      AppAlert.alert(
        'Could Not Create Service',
        error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  const titleLength = title.trim().length;
  const descLength = description.trim().length;

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
    >
      <BlueBackdrop />
      <LightHeader title="Offer a Service" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.content, suburbDropdownOpen && { paddingBottom: 380 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            {/* Info Banner */}
            <View style={[styles.infoBanner, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <IconChip name="shield-checkmark-outline" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoBannerTitle, isDarkMode && { color: '#F8FAFC' }]}>List your skills on MyToDoo</Text>
                <Text style={[styles.infoBannerSub, isDarkMode && { color: '#94A3B8' }]}>
                  Posters can view and book your services directly. Once booked, an offer is automatically created in your task pipeline.
                </Text>
              </View>
            </View>

            <View style={[styles.formCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            {/* Category Picker */}
            <View style={styles.labelRow}>
              <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Category <Text style={styles.required}>*</Text></Text>
              {selectedCategory ? (
                <Text style={[styles.selectedCategoryBadge, isDarkMode && { color: '#38BDF8' }]}>
                  ✓ {selectedCategory}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.helperText, isDarkMode && { color: '#94A3B8' }]}>
              Select the category that best matches your service.
            </Text>
            <View style={{ zIndex: 1100, elevation: 1100 }}>
              <TouchableOpacity
                style={[
                  styles.categorySelectorBox,
                  isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                  categoryDropdownOpen && { borderColor: '#ff6b35' },
                  errors.category ? styles.inputError : null,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setCategoryDropdownOpen(!categoryDropdownOpen);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.categorySelectorInner}>
                  <Ionicons
                    name="grid-outline"
                    size={18}
                    color={selectedCategory ? (isDarkMode ? '#38BDF8' : '#003399') : '#94A3B8'}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.categorySelectorValue,
                      isDarkMode && { color: '#F8FAFC' },
                      !selectedCategory && { color: isDarkMode ? '#64748B' : '#94A3B8', fontWeight: '400' },
                    ]}
                  >
                    {selectedCategory || 'Select a category'}
                  </Text>
                </View>
                <Ionicons
                  name={categoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={isDarkMode ? '#94A3B8' : '#003399'}
                />
              </TouchableOpacity>

              {categoryDropdownOpen && (
                <View
                  style={[
                    styles.categoryDropdownMenu,
                    isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                  ]}
                >
                  <View
                    style={[
                      styles.categorySearchRow,
                      isDarkMode && { backgroundColor: '#0F172A', borderBottomColor: '#334155' },
                    ]}
                  >
                    <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.categorySearchInput, isDarkMode && { color: '#F8FAFC' }]}
                      placeholder="Search categories..."
                      value={categorySearchQuery}
                      onChangeText={setCategorySearchQuery}
                      placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    />
                    {categorySearchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setCategorySearchQuery('')}>
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView
                    style={{ maxHeight: 220 }}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredCategories.length === 0 ? (
                      <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={{ fontSize: RFValue(13), color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                          No categories found
                        </Text>
                      </View>
                    ) : (
                      filteredCategories.map((catName) => {
                        const isSelected = selectedCategory === catName;
                        return (
                          <TouchableOpacity
                            key={catName}
                            style={[
                              styles.categoryDropdownItem,
                              isDarkMode && { borderBottomColor: '#334155' },
                              isSelected && (isDarkMode ? { backgroundColor: '#0F172A' } : styles.categoryItemActive),
                            ]}
                            onPress={() => {
                              setSelectedCategory(catName);
                              setCategoryDropdownOpen(false);
                              setCategorySearchQuery('');
                              if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                            }}
                          >
                            <Text
                              style={[
                                styles.categoryDropdownItemText,
                                isDarkMode && { color: '#F8FAFC' },
                                isSelected && { color: isDarkMode ? '#38BDF8' : '#003399', fontWeight: '700' },
                              ]}
                            >
                              {catName}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={18} color={isDarkMode ? '#38BDF8' : '#003399'} />
                            )}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
            {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

            {/* Title */}
            <View style={[styles.labelRow, { marginTop: 14 }]}>
              <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Service Title <Text style={styles.required}>*</Text></Text>
              <Text
                style={[
                  styles.charCounter,
                  isDarkMode && { color: '#94A3B8' },
                  titleLength > 0 && titleLength < 5 && styles.charCounterWarning,
                  titleLength >= 5 && styles.charCounterSuccess,
                ]}
              >
                {title.length}/80 (Min 5)
              </Text>
            </View>
            <Text style={[styles.helperText, isDarkMode && { color: '#94A3B8' }]}>
              Give your service a clear, professional title. No contact details or links.
            </Text>
            <TextInput
              style={[
                styles.input,
                isDarkMode && { backgroundColor: '#1E293B', color: '#F8FAFC', borderColor: '#334155' },
                focusedField === 'title' && styles.inputFocused,
                errors.title ? styles.inputError : null,
              ]}
              {...focusProps('title')}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Professional Lawn Mowing & Edging"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              maxLength={80}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

            {/* Description */}
            <View style={[styles.labelRow, { marginTop: 14 }]}>
              <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Description <Text style={styles.required}>*</Text></Text>
              <Text
                style={[
                  styles.charCounter,
                  isDarkMode && { color: '#94A3B8' },
                  descLength > 0 && descLength < 15 && styles.charCounterWarning,
                  descLength >= 15 && styles.charCounterSuccess,
                ]}
              >
                {description.length}/1000 (Min 15)
              </Text>
            </View>
            <Text style={[styles.helperText, isDarkMode && { color: '#94A3B8' }]}>
              Describe your experience, what equipment you bring, and what is included.
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                isDarkMode && { backgroundColor: '#1E293B', color: '#F8FAFC', borderColor: '#334155' },
                focusedField === 'description' && styles.inputFocused,
                errors.description ? styles.inputError : null,
              ]}
              {...focusProps('description')}
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Describe your service in detail..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

            {/* Price & Radius Row */}
            <View style={[styles.row, { marginTop: 14 }]}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Price (AUD) <Text style={styles.required}>*</Text></Text>
                <Text style={[styles.helperText, isDarkMode && { color: '#94A3B8' }]}>Fixed package price</Text>
                <TextInput
                  style={[
                    styles.input,
                    isDarkMode && { backgroundColor: '#1E293B', color: '#F8FAFC', borderColor: '#334155' },
                    focusedField === 'price' && styles.inputFocused,
                    errors.price ? styles.inputError : null,
                  ]}
                  {...focusProps('price')}
                  value={price}
                  onChangeText={(t) => {
                    setPrice(t);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                  placeholder="e.g. 80"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  keyboardType="decimal-pad"
                />
                {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Service Radius (km)</Text>
                <Text style={[styles.helperText, isDarkMode && { color: '#94A3B8' }]}>Operating travel limit</Text>
                <TextInput
                  style={[
                    styles.input,
                    isDarkMode && { backgroundColor: '#1E293B', color: '#F8FAFC', borderColor: '#334155' },
                    focusedField === 'radius' && styles.inputFocused,
                    errors.radius ? styles.inputError : null,
                  ]}
                  {...focusProps('radius')}
                  value={radiusKm}
                  onChangeText={(t) => {
                    setRadiusKm(t);
                    if (errors.radius) setErrors((prev) => ({ ...prev, radius: '' }));
                  }}
                  placeholder="30"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                {errors.radius ? <Text style={styles.errorText}>{errors.radius}</Text> : null}
              </View>
            </View>

            {/* Location */}
            <Text style={[styles.label, { marginTop: 14 }, isDarkMode && { color: '#F8FAFC' }]}>Suburb / Service Area <Text style={styles.required}>*</Text></Text>
            <Text style={[styles.helperText, isDarkMode && { color: '#94A3B8' }]}>Base suburb where you provide this service</Text>
            <View style={{ zIndex: 1000, elevation: 1000, marginTop: 4 }}>
              <LocationAutocomplete
                onSelect={(location) => {
                  Keyboard.dismiss();
                  setSuburb(location.address);
                  setLat(location.coordinates.lat);
                  setLng(location.coordinates.lng);
                  setSuburbDropdownOpen(false);
                  if (errors.suburb) setErrors((prev) => ({ ...prev, suburb: '' }));
                }}
                placeholder="Search suburb or postcode..."
                country="AU"
                initialValue={suburb}
                onDropdownStateChange={setSuburbDropdownOpen}
              />
            </View>
            {errors.suburb ? <Text style={styles.errorText}>{errors.suburb}</Text> : null}
            {suburb ? (
              <View style={styles.selectedLocBadge}>
                <Ionicons name="location" size={14} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
                <Text style={[styles.selectedLocation, isDarkMode && { color: '#38BDF8' }]} numberOfLines={1}>{suburb}</Text>
              </View>
            ) : null}

            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, createMutation.isPending && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
              activeOpacity={0.85}
            >
              {createMutation.isPending ? (
                <AppLoader color="#fff" size={22} />
              ) : (
                <Text style={styles.submitText}>Publish Service</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#003399' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 60 },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 16,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  required: { color: '#FCA5A5' },
  inputFocused: { borderColor: '#ff6b35' },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    gap: 12,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  infoBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 17,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  charCounter: {
    fontSize: RFValue(11),
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  charCounterWarning: {
    color: '#FBBF24',
    fontWeight: '600',
  },
  charCounterSuccess: {
    color: '#4ADE80',
    fontWeight: '600',
  },
  helperText: {
    fontSize: RFValue(11.5),
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 6,
  },
  selectedCategoryBadge: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#4ADE80',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: RFValue(14),
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#F87171',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: RFValue(12),
    marginTop: 4,
    marginLeft: 2,
  },
  textArea: { minHeight: 100 },
  row: { flexDirection: 'row' },
  categorySelectorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categorySelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categorySelectorValue: {
    flex: 1,
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#0F172A',
  },
  categoryDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  categorySearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  categorySearchInput: {
    flex: 1,
    fontSize: RFValue(13.5),
    color: '#0F172A',
    paddingVertical: 2,
  },
  categoryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryItemActive: {
    backgroundColor: 'rgba(0,51,153,0.08)',
  },
  categoryDropdownItemText: {
    fontSize: RFValue(13.5),
    color: '#334155',
  },
  selectedLocBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  selectedLocation: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
