import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {
  DateOptionSelector,
  TimeOfDayGrid,
  TimeToggle,
} from './components';

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  locationType?: 'physical' | 'online' | 'both';
  isActive?: boolean;
}

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function CreateTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { myTask, updateMyTask } = useCreateTaskStore();
  const insets = useSafeAreaInsets();

  // Refs for sections
  const scrollViewRef = useRef<ScrollView>(null);
  const section1Ref = useRef<View>(null);
  const section2Ref = useRef<View>(null);
  const section3Ref = useRef<View>(null);

  // Section 1: Title & Description
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.selectedCategory ? String(params.selectedCategory) : null
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  
  // Validation errors
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [whenError, setWhenError] = useState('');
  const [touched, setTouched] = useState({ 
    title: false, 
    description: false, 
    category: false, 
    location: false,
    when: false 
  });

  // Section 2: Images & Location
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Section 3: Time
  const [selectedOption, setSelectedOption] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePickerOption, setActivePickerOption] = useState('');
  const [onTimeDate, setOnTimeDate] = useState<Date | null>(null);
  const [beforeDate, setBeforeDate] = useState<Date | null>(null);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');
  const [needSpecificTime, setNeedSpecificTime] = useState(false);

  // Keyboard visibility state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Fetch categories
  const { data: categoriesResponse, isLoading: loadingCategories, error: categoriesError } = useGetCategories();

  // Handle pre-selected category from params
  useEffect(() => {
    if (params.selectedCategory) {
      const categoryName = String(params.selectedCategory);
      console.log('📌 Pre-selected category from params:', categoryName);
      console.log('   Current selectedCategory state:', selectedCategory);
      console.log('   Setting category to:', categoryName);
      setSelectedCategory(categoryName);
      setTouched(prev => ({ ...prev, category: true }));
      console.log('   ✅ Category state updated to:', categoryName);
    }
  }, [params.selectedCategory]);

  // Debug: Log when selectedCategory changes
  useEffect(() => {
    console.log('🔄 selectedCategory state changed to:', selectedCategory);
  }, [selectedCategory]);

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
        // Small delay to ensure smooth transition
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

  // Scroll to specific section if requested
  useEffect(() => {
    if (params.section && scrollViewRef.current) {
      setTimeout(() => {
        let targetRef = null;
        switch (params.section) {
          case 'details':
          case 'title':
          case 'description':
            targetRef = section1Ref;
            break;
          case 'photos':
          case 'location':
            targetRef = section2Ref;
            break;
          case 'when':
          case 'time':
            targetRef = section3Ref;
            break;
        }
        
        if (targetRef?.current) {
          targetRef.current.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
              scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
            },
            () => {}
          );
        }
      }, 300);
    }
  }, [params.section]);

  // Validation functions
  const handleTitleChange = (text: string) => {
    // Remove numbers and special characters as user types
    const cleanedText = text.replace(/[^a-zA-Z\s'\-,.]/g, '');
    setTitle(cleanedText);
    
    // Always validate if the field has been touched or if user is actively typing
    if (touched.title || cleanedText.length > 0) {
      // Mark as touched if user starts typing
      if (!touched.title && cleanedText.length > 0) {
        setTouched({ ...touched, title: true });
      }
      
      if (cleanedText.trim().length === 0) {
        setTitleError('Title is required');
      } else if (cleanedText.trim().length < 10) {
        setTitleError('Minimum 10 characters required');
      } else {
        setTitleError('');
      }
    }
  };

  const handleDescriptionChange = (text: string) => {
    // Remove numbers and special characters as user types
    const cleanedText = text.replace(/[^a-zA-Z\s'\-,.]/g, '');
    setDescription(cleanedText);
    
    if (touched.description) {
      if (cleanedText.trim().length === 0) {
        setDescriptionError('Description is required');
      } else if (cleanedText.trim().length < 20) {
        setDescriptionError('Minimum 20 characters required');
      } else {
        setDescriptionError('');
      }
    }
  };

  const handleTitleBlur = () => {
    setTouched({ ...touched, title: true });
    if (title.trim().length === 0) {
      setTitleError('Title is required');
    } else if (title.trim().length < 10) {
      setTitleError('Minimum 10 characters required');
    } else {
      setTitleError('');
    }
  };

  const handleDescriptionBlur = () => {
    setTouched({ ...touched, description: true });
    if (description.trim().length === 0) {
      setDescriptionError('Description is required');
    } else if (description.trim().length < 20) {
      setDescriptionError('Minimum 20 characters required');
    } else {
      setDescriptionError('');
    }
  };

  // Initialize with existing data from store
  useEffect(() => {
    // Section 1
    if (myTask.title) {
      setTitle(myTask.title);
      // Mark as touched and validate if title comes from welcome screen
      setTouched(prev => ({ ...prev, title: true }));
      
      // Run validation on the loaded title
      const trimmedTitle = myTask.title.trim();
      if (trimmedTitle.length === 0) {
        setTitleError('Title is required');
      } else if (trimmedTitle.length < 10) {
        setTitleError('Minimum 10 characters required');
      } else {
        setTitleError('');
      }
    }
    if (myTask.description) {
      setDescription(myTask.description);
      // Also validate description if it exists
      setTouched(prev => ({ ...prev, description: true }));
      
      const trimmedDescription = myTask.description.trim();
      if (trimmedDescription.length === 0) {
        setDescriptionError('Description is required');
      } else if (trimmedDescription.length < 20) {
        setDescriptionError('Minimum 20 characters required');
      } else {
        setDescriptionError('');
      }
    }
    if ('category' in myTask && myTask.category) setSelectedCategory(myTask.category);

    // Section 2
    if (myTask.photos && myTask.photos.length > 0) {
      setImages(myTask.photos.filter(photo => photo));
    } else if (myTask.photo) {
      setImages([myTask.photo].filter(photo => photo));
    }
    if (!myTask.isRemoval && myTask.location && myTask.coordinates) {
      setSelectedLocation({
        address: myTask.location,
        coordinates: myTask.coordinates,
      });
    }

    // Section 3
    if (myTask.date) {
      const existingDate = new Date(myTask.date);
      setOnTimeDate(existingDate);
      setBeforeDate(existingDate);
      setSelectedOption('on_time');
    } else {
      const today = new Date();
      const todayDate = new Date(today);
      const futureDateFor5Days = new Date(today);
      futureDateFor5Days.setDate(today.getDate() + 5);
      setOnTimeDate(todayDate);
      setBeforeDate(futureDateFor5Days);
    }
    if (myTask.time) {
      setSelectedTimeBlock(myTask.time);
      setNeedSpecificTime(true);
    }
  }, []);

  // Reset time toggle when Flexible option is selected
  useEffect(() => {
    if (selectedOption === 'no_rush') {
      setNeedSpecificTime(false);
      setSelectedTimeBlock('');
    }
  }, [selectedOption]);

  // Get categories
  const categoriesData = categoriesResponse?.data || [];
  const fullCategories: Category[] = categoriesData.map((cat: any) => {
    if (typeof cat === 'string') {
      return { _id: cat, name: cat, locationType: undefined };
    }
    return cat;
  });

  const allCategories: string[] = fullCategories.map((cat: Category) => cat.name);

  // Filter categories based on search query
  const categories: string[] = categorySearchQuery.trim()
    ? allCategories.filter(cat =>
        cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
      )
    : allCategories;

  // Image handlers
  const showImagePickerOptions = () => {
    if (images.length >= 10) return;

    Alert.alert('Add Photo', 'Choose how you want to add a photo', [
      { text: 'Take Photo', onPress: () => openCamera() },
      { text: 'Choose from Gallery', onPress: () => openImageLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.', [{ text: 'OK' }]);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is required to select photos.', [{ text: 'OK' }]);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteImage = (uri: string) => {
    setImages(images.filter(img => img !== uri));
  };

  const handleLocationSelect = (location: LocationData) => {
    console.log('📍 Location selected:', location);
    console.log('   Address:', location?.address);
    console.log('   Coordinates:', location?.coordinates);
    setSelectedLocation(location);
    console.log('   Location state updated');
  };

  const handleLocationFocus = () => {
    console.log('📍 Location field focused - scrolling into view');
    // Scroll to location section when focused
    if (section2Ref.current && scrollViewRef.current) {
      setTimeout(() => {
        section2Ref.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            console.log('   Scrolling to location field at y:', y);
            // Scroll with more offset to ensure field is visible above keyboard
            // Add extra space (200px) to account for keyboard height
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

  // Time handlers
  const handleDateChange = (event: DateTimePickerEvent, date?: Date | undefined): void => {
    setShowDatePicker(false);
    if (date) {
      if (activePickerOption === 'on_time') {
        setOnTimeDate(date);
      } else if (activePickerOption === 'before') {
        setBeforeDate(date);
      }
    }
    setActivePickerOption('');
  };

  const handleOpenPicker = (pickerType: string) => {
    setActivePickerOption(pickerType);
    setShowDatePicker(true);
  };

  const timeBlocks = [
    { label: 'Morning', value: 'morning', description: 'before 12 pm', icon: require('@/assets/icons/rooster.png') },
    { label: 'Afternoon', value: 'afternoon', description: '12pm to 5 pm', icon: require('@/assets/icons/hat.png') },
    { label: 'Evening', value: 'evening', description: 'After 5pm', icon: require('@/assets/icons/tea.png') },
    { label: 'Late night', value: 'late_night', description: 'After 9pm', icon: require('@/assets/icons/owl.png') },
  ];

  const options = [
    { label: 'On Date', value: 'on_time' },
    { label: 'Before Date', value: 'before' },
    { label: 'Flexible', value: 'no_rush' },
  ];

  const renderGridItems = () => {
    const items = [...images];

    if (items.length < 10) {
      items.push('upload_button');
    }

    const rows = [];
    for (let i = 0; i < items.length; i += 4) {
      rows.push(items.slice(i, i + 4));
    }

    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.imageRow}>
        {row.map((item, itemIndex) => {
          if (item === 'upload_button') {
            return (
              <TouchableOpacity
                key={`upload-${rowIndex}-${itemIndex}`}
                onPress={showImagePickerOptions}
                style={[styles.uploadBox, isProcessing && styles.uploadBoxDisabled]}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Ionicons name="hourglass" size={24} color="#999" />
                ) : (
                  <>
                    <Ionicons name="camera" size={24} color="#467FFF" />
                    <Ionicons name="add" size={16} color="#467FFF" style={styles.addIcon} />
                  </>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <View key={`${rowIndex}-${itemIndex}`} style={styles.imageWrapper}>
              <Image source={{ uri: item }} style={styles.uploadedImage} />
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteImage(item)}>
                <Ionicons name="close-circle" size={22} color="#FF4D4F" />
              </TouchableOpacity>
            </View>
          );
        })}

        {Array.from({ length: 4 - row.length }).map((_, emptyIndex) => (
          <View key={`empty-${rowIndex}-${emptyIndex}`} style={styles.emptySlot} />
        ))}
      </View>
    ));
  };

  // Validation
  const titleLength = title.trim().length;
  const descriptionLength = description.trim().length;
  
  // Debug: Log validation state
  console.log('=== VALIDATION STATE ===');
  console.log('selectedCategory:', selectedCategory);
  console.log('titleLength:', titleLength, '(min: 10)');
  console.log('descriptionLength:', descriptionLength, '(min: 20)');
  console.log('titleError:', titleError);
  console.log('descriptionError:', descriptionError);
  console.log('selectedLocation:', selectedLocation);
  console.log('selectedOption:', selectedOption);
  
  const isFormValid =
    !!selectedCategory &&
    titleLength >= 10 &&
    descriptionLength >= 20 &&
    !titleError &&
    !descriptionError &&
    !!selectedLocation &&
    selectedOption !== '';
  
  console.log('isFormValid:', isFormValid);
  console.log('========================');

  const handleContinue = () => {
    console.log('\n🔵 ===== CONTINUE BUTTON CLICKED =====');
    console.log('📋 Current Form State:');
    console.log('  - Category:', selectedCategory || 'NOT SELECTED');
    console.log('  - Title:', `"${title}" (${titleLength} chars)`);
    console.log('  - Description:', `"${description}" (${descriptionLength} chars)`);
    console.log('  - Location:', selectedLocation ? selectedLocation.address : 'NOT SELECTED');
    console.log('  - When:', selectedOption || 'NOT SELECTED');
    console.log('  - Images:', images.length);
    
    // Mark all fields as touched to show validation errors
    console.log('🔍 Marking all fields as touched...');
    setTouched({
      title: true,
      description: true,
      category: true,
      location: true,
      when: true,
    });

    // Validate all fields
    console.log('✅ Running validation checks...');
    if (title.trim().length === 0) {
      console.log('  ❌ Title is empty');
      setTitleError('Title is required');
    } else if (title.trim().length < 10) {
      console.log('  ❌ Title too short:', titleLength, '< 10');
      setTitleError('Minimum 10 characters required');
    } else {
      console.log('  ✅ Title valid');
    }

    if (description.trim().length === 0) {
      console.log('  ❌ Description is empty');
      setDescriptionError('Description is required');
    } else if (description.trim().length < 20) {
      console.log('  ❌ Description too short:', descriptionLength, '< 20');
      setDescriptionError('Minimum 20 characters required');
    } else {
      console.log('  ✅ Description valid');
    }

    console.log('\n📊 Validation Results:');
    console.log('  - selectedCategory:', !!selectedCategory);
    console.log('  - titleLength >= 10:', titleLength >= 10);
    console.log('  - descriptionLength >= 20:', descriptionLength >= 20);
    console.log('  - !titleError:', !titleError);
    console.log('  - !descriptionError:', !descriptionError);
    console.log('  - selectedLocation:', !!selectedLocation);
    console.log('  - selectedOption !== "":', selectedOption !== '');
    console.log('  - isFormValid:', isFormValid);

    if (isFormValid) {
      console.log('\n✅ Form is VALID - Proceeding to budget screen...');
      const selectedDate =
        selectedOption === 'on_time' ? onTimeDate : selectedOption === 'before' ? beforeDate : null;

      console.log('💾 Saving task data:', {
        title,
        description,
        category: selectedCategory,
        location: selectedLocation?.address,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        time: selectedTimeBlock || '',
        photos: images.length,
      });

      updateMyTask({
        title,
        description,
        category: selectedCategory,
        isRemoval: false,
        photos: images,
        photo: images[0] || '',
        location: selectedLocation.address,
        coordinates: selectedLocation.coordinates,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        time: selectedTimeBlock ? selectedTimeBlock : '',
      });
      
      console.log('🚀 Navigating to budget screen...');
      router.push('/budget-screen' as any);
    } else {
      console.log('\n❌ Form is INVALID - Showing alert...');
      const missingFields = [];
      if (!selectedCategory) missingFields.push('Category');
      if (titleLength < 10) missingFields.push('Title (min 10 chars)');
      if (descriptionLength < 20) missingFields.push('Description (min 20 chars)');
      if (!selectedLocation) missingFields.push('Location');
      if (selectedOption === '') missingFields.push('When');
      
      console.log('  Missing fields:', missingFields);
      
      Alert.alert(
        'Incomplete Form',
        'Please fill in all required fields:\n' +
        (!selectedCategory ? '• Select a category\n' : '') +
        (titleLength < 10 ? '• Title must be at least 10 characters\n' : '') +
        (descriptionLength < 20 ? '• Description must be at least 20 characters\n' : '') +
        (!selectedLocation ? '• Select a location\n' : '') +
        (selectedOption === '' ? '• Select when you need this done' : '')
      );
    }
    console.log('🔵 ===== END CONTINUE BUTTON =====\n');
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Task Details</Text>
          <Text style={styles.headerSubtitle}>Tell us what you need done</Text>
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
        {/* SECTION 1: TASK DETAILS */}
        <View ref={section1Ref} style={styles.section}>
          {/* Category Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.categorySelector,
                touched.category && !selectedCategory && styles.inputError
              ]}
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setTouched({ ...touched, category: true });
              }}
            >
              <Text style={[styles.categorySelectorText, !selectedCategory && styles.placeholder]}>
                {selectedCategory || 'Select a category'}
              </Text>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
            {touched.category && !selectedCategory && (
              <Text style={styles.validationText}>Category is required</Text>
            )}

            {showCategoryDropdown && (
              <View style={styles.categoryDropdown}>
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={18} color="#999" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search categories..."
                    value={categorySearchQuery}
                    onChangeText={setCategorySearchQuery}
                    placeholderTextColor="#999"
                  />
                </View>

                <ScrollView style={styles.categoriesList} nestedScrollEnabled>
                  {loadingCategories ? (
                    <ActivityIndicator size="small" color="#0057FF" style={styles.loader} />
                  ) : categoriesError ? (
                    <Text style={styles.errorText}>Failed to load categories</Text>
                  ) : categories.length === 0 ? (
                    <Text style={styles.noResultsText}>No categories found</Text>
                  ) : (
                    categories.map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[styles.categoryItem, selectedCategory === category && styles.categoryItemSelected]}
                        onPress={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                          setCategorySearchQuery('');
                          setCategoryError('');
                        }}
                      >
                        <Text
                          style={[
                            styles.categoryItemText,
                            selectedCategory === category && styles.categoryItemTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                        {selectedCategory === category && <Ionicons name="checkmark" size={20} color="#0057FF" />}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Title Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                titleError && styles.inputError
              ]}
              placeholder="e.g. Move my couch"
              value={title}
              onChangeText={handleTitleChange}
              onBlur={handleTitleBlur}
              placeholderTextColor="#999"
              maxLength={200}
            />
            <Text style={styles.charCount}>{titleLength}/200</Text>
            {titleError && (
              <Text style={styles.errorText}>{titleError}</Text>
            )}
            <Text style={styles.helperText}>Only letters, spaces, and basic punctuation allowed</Text>
          </View>

          {/* Description Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textArea,
                touched.description && (descriptionError || (descriptionLength > 0 && descriptionLength < 20)) && styles.inputError
              ]}
              multiline
              placeholder="Give a detailed description of your task..."
              value={description}
              onChangeText={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              placeholderTextColor="#999"
              textAlignVertical="top"
              numberOfLines={4}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{descriptionLength}/1000</Text>
            {touched.description && descriptionError && (
              <Text style={styles.errorText}>{descriptionError}</Text>
            )}
            {touched.description && !descriptionError && descriptionLength > 0 && descriptionLength < 20 && (
              <Text style={styles.errorText}>Minimum 20 characters required</Text>
            )}
            <Text style={styles.helperText}>Only letters, spaces, and basic punctuation allowed</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* SECTION 2: PHOTOS & LOCATION */}
        <View ref={section2Ref} style={styles.section}>
          <Text style={styles.sectionTitle}>Photos & Location</Text>
          <Text style={styles.sectionSubtitle}>Help taskers understand what needs doing ({images.length}/10 photos)</Text>

          <View style={styles.imageSection}>{renderGridItems()}</View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Location <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.locationSubtitle}>
              Where do you need this done? Type and select from suggestions.
            </Text>

            <LocationAutocomplete
              onSelect={(location) => {
                console.log('🗺️ LocationAutocomplete onSelect triggered');
                console.log('   Received location:', location);
                handleLocationSelect(location);
                setTouched({ ...touched, location: true });
                setLocationError('');
                console.log('   Location touched and error cleared');
              }}
              onFocus={handleLocationFocus}
              placeholder="Enter address or suburb"
              initialValue={selectedLocation?.address}
            />

            {!selectedLocation && touched.location && (
              <Text style={styles.helperText}>
                💡 Tip: Type your address and tap on a suggestion from the dropdown list
              </Text>
            )}

            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Ionicons name="location" size={20} color="#0057FF" />
                <Text style={styles.selectedLocationText} numberOfLines={2}>
                  {selectedLocation.address}
                </Text>
              </View>
            )}
            {touched.location && !selectedLocation && (
              <Text style={styles.validationText}>
                Location is required - Please select from dropdown
              </Text>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* SECTION 3: TIME */}
        <View ref={section3Ref} style={styles.section}>
          <Text style={styles.sectionTitle}>
            When <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>When do you need this done?</Text>

          {/* Date/Time Options */}
          <DateOptionSelector
            options={options}
            selectedOption={selectedOption}
            onSelectOption={(option) => {
              setSelectedOption(option);
              setTouched({ ...touched, when: true });
              setWhenError('');
            }}
            onTimeDate={onTimeDate}
            beforeDate={beforeDate}
            onOpenPicker={handleOpenPicker}
          />
          {touched.when && selectedOption === '' && (
            <Text style={styles.validationText}>Please select when you need this done</Text>
          )}

          {/* Time Toggle */}
          <TimeToggle 
            needSpecificTime={needSpecificTime} 
            onToggle={setNeedSpecificTime}
            disabled={selectedOption === 'no_rush'}
          />

          {/* Time of Day Grid */}
          {needSpecificTime && selectedOption !== 'no_rush' && (
            <TimeOfDayGrid
              timeBlocks={timeBlocks}
              selectedTimeBlock={selectedTimeBlock}
              onSelectTimeBlock={setSelectedTimeBlock}
            />
          )}
        </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={
              activePickerOption === 'on_time'
                ? onTimeDate || new Date()
                : activePickerOption === 'before'
                ? beforeDate || new Date()
                : new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>

      {/* Continue Button - Outside KeyboardAvoidingView, Hidden when keyboard is visible */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          style={[
            styles.continueButton, 
            isFormValid && styles.continueButtonEnabled,
            { bottom: Math.max(insets.bottom, 20) }
          ]}
          disabled={!isFormValid}
          onPress={() => {
            console.log('🔘 Continue button PRESSED!');
            console.log('   Button disabled:', !isFormValid);
            console.log('   isFormValid:', isFormValid);
            handleContinue();
          }}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Styles for create task screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginBottom: 15,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 300, // Increased padding for keyboard space
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'right',
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 10,
  },
  categorySelector: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    color: '#999',
  },
  categoryDropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  categoriesList: {
    maxHeight: 250,
  },
  loader: {
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    padding: 20,
    textAlign: 'center',
  },
  noResultsText: {
    color: '#8E8E93',
    padding: 20,
    textAlign: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryItemSelected: {
    backgroundColor: '#F0F5FF',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  categoryItemTextSelected: {
    color: '#0057FF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  validationText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  textArea: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
    height: 120,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  uploadedImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 11,
    padding: 1,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  uploadBox: {
    width: 70,
    height: 70,
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E4E7EC',
    borderStyle: 'dashed',
    position: 'relative',
  },
  uploadBoxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8F9FA',
  },
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
  },
  emptySlot: {
    width: 70,
    marginRight: 10,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0057FF',
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#D1D1D6',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonEnabled: {
    backgroundColor: '#0057FF',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
