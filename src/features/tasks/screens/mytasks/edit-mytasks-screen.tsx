import { LocationAutocomplete, LocationData } from '@/src/shared/components/LocationAutocomplete';
import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EditTaskScreenProps {
  route?: {
    params: {
      taskId: string;
      task?: any;
    };
  };
}

export default function EditTaskScreen({ route }: EditTaskScreenProps) {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const locationSectionRef = useRef<View>(null);

  // Get task data from params
  const taskData = route?.params?.task || (params.task ? JSON.parse(String(params.task)) : null);
  const taskId = route?.params?.taskId || params.taskId;

  console.log('📝 Edit Task Screen - Task ID:', taskId);
  console.log('📝 Edit Task Screen - Task Data:', taskData);
  console.log('📝 Mapped Fields:');
  console.log('   - Category:', taskData?.categories?.[0]);
  console.log('   - Title:', taskData?.title);
  console.log('   - Description:', taskData?.details);
  console.log('   - Location:', taskData?.location?.address);
  console.log('   - DateType (When):', taskData?.dateType);
  console.log('   - Budget:', taskData?.budget);
  console.log('   - Images:', taskData?.images?.length || 0, 'images');

  // Map task data to form fields
  const getLocationFromTask = () => {
    if (!taskData?.location) return null;
    
    const coords = taskData.location.coordinates;
    // Handle both coordinate formats
    let lat = 0, lng = 0;
    if (coords && typeof coords === 'object') {
      if ('coordinates' in coords && Array.isArray(coords.coordinates)) {
        // Format: { type: "Point", coordinates: [lng, lat] }
        lng = coords.coordinates[0];
        lat = coords.coordinates[1];
      } else if ('lat' in coords && 'lng' in coords) {
        // Format: { lat: number, lng: number }
        lat = coords.lat;
        lng = coords.lng;
      }
    }
    
    return {
      address: taskData.location.address || '',
      coordinates: { lat, lng }
    };
  };

  // Form states - Initialize with existing task data
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    taskData?.categories?.[0] || null  // Take first category from array
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [title, setTitle] = useState(taskData?.title || '');
  const [description, setDescription] = useState(taskData?.details || '');  // 'details' not 'description'
  const [images, setImages] = useState<string[]>(taskData?.images || []);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(getLocationFromTask());
  const [selectedOption, setSelectedOption] = useState(taskData?.dateType || '');  // 'dateType' not 'when'
  const [budget, setBudget] = useState(taskData?.budget?.toString() || '');

  // Keyboard visibility
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Fetch categories
  const { data: categoriesResponse, isLoading: loadingCategories } = useGetCategories();
  const categories = categoriesResponse?.data || [];

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        console.log('⌨️ Keyboard shown');
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log('⌨️ Keyboard hidden');
        setTimeout(() => {
          setIsKeyboardVisible(false);
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle location field focus - scroll into view
  const handleLocationFocus = () => {
    console.log('📍 Location field focused - scrolling into view');
    if (locationSectionRef.current && scrollViewRef.current) {
      setTimeout(() => {
        locationSectionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            console.log('   Scrolling to location field at y:', y);
            scrollViewRef.current?.scrollTo({ 
              y: y + 100, 
              animated: true 
            });
          },
          () => console.log('   Failed to measure location field')
        );
      }, 150);
    }
  };

  // Image picker function
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Remove image function
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Handle save
  const handleSave = () => {
    console.log('💾 Saving task:', taskId);
    console.log('   Category:', selectedCategory);
    console.log('   Title:', title);
    console.log('   Description:', description);
    console.log('   Location:', selectedLocation);
    console.log('   When:', selectedOption);
    console.log('   Budget:', budget);
    // TODO: Implement actual save logic
    router.back();
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((cat: any) =>
    (typeof cat === 'string' ? cat : cat.name)
      .toLowerCase()
      .includes(categorySearchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <Text style={styles.headerSubtitle}>Update your task details</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
        >
        <View style={styles.form}>
        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category* <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={[styles.input, styles.categoryButton]}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={[styles.inputText, selectedCategory && styles.selectedText]}>
              {selectedCategory || 'Select a Category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search categories..."
                value={categorySearchQuery}
                onChangeText={setCategorySearchQuery}
              />
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {loadingCategories ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  filteredCategories.map((cat: any, index: number) => {
                    const categoryName = typeof cat === 'string' ? cat : cat.name;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedCategory(categoryName);
                          setShowCategoryDropdown(false);
                          setCategorySearchQuery('');
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{categoryName}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>MyToDo Title for Task</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Tell My ToDoo here's what you need done?"
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Describe the MyToDoo Task</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Give a detailed description of the MyToDoo tasks"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Photos */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Snap a Photo</Text>
          <View style={styles.imageGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF0000" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={32} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Location */}
        <View ref={locationSectionRef} style={styles.formGroup}>
          <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
          <LocationAutocomplete
            onSelect={(location) => {
              console.log('📍 Location selected:', location);
              setSelectedLocation(location);
            }}
            onFocus={handleLocationFocus}
            placeholder="Enter address or suburb"
            initialValue={selectedLocation?.address}
          />
        </View>

        {/* When - Options only, NO TIME PICKER */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>When <Text style={styles.required}>*</Text></Text>
          <View style={styles.whenOptions}>
            <TouchableOpacity
              style={[styles.whenOption, selectedOption === 'flexible' && styles.whenOptionSelected]}
              onPress={() => setSelectedOption('flexible')}
            >
              <Text style={[styles.whenOptionText, selectedOption === 'flexible' && styles.whenOptionTextSelected]}>
                I'm Flexible
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.whenOption, selectedOption === 'on_time' && styles.whenOptionSelected]}
              onPress={() => setSelectedOption('on_time')}
            >
              <Text style={[styles.whenOptionText, selectedOption === 'on_time' && styles.whenOptionTextSelected]}>
                On a Specific Time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.whenOption, selectedOption === 'before' && styles.whenOptionSelected]}
              onPress={() => setSelectedOption('before')}
            >
              <Text style={[styles.whenOptionText, selectedOption === 'before' && styles.whenOptionTextSelected]}>
                Before a Date
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget (Optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Budget (Optional)</Text>
          <View style={styles.budgetInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.budgetTextInput}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>
        </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button - Outside KeyboardAvoidingView, Hidden when keyboard is visible */}
      {!isKeyboardVisible && (
        <TouchableOpacity 
          style={[
            styles.saveButton,
            { bottom: Math.max(insets.bottom, 20) }
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Styles for Edit Task Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 300,
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  locationTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  budgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  budgetTextInput: {
    flex: 1,
    fontSize: 16,
  },
  saveButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#4CD964',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
  },
  categoryButton: {
    cursor: 'pointer',
  },
  selectedText: {
    color: '#000',
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    padding: 12,
    fontSize: 16,
  },
  dropdownList: {
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  whenOptions: {
    gap: 10,
  },
  whenOption: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
    marginBottom: 8,
  },
  whenOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  whenOptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  whenOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
