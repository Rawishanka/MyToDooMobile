import { LocationAutocomplete, LocationData } from '@/src/shared/components/LocationAutocomplete';
import { useGetCategories, useUpdateTask, useUpdateTaskWithImages } from '@/src/shared/hooks/useTaskApi';
import { formatNumber, getCurrencyFromLocation, getMinimumBudget } from '@/src/shared/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ✅ NEW: Use OCR API for sensitive data detection
import { OCRAPI } from '@/src/api/ocr-api';

interface EditTaskScreenProps {
  route?: {
    params: {
      taskId: string;
      task?: any;
    };
  };
}

interface TimeBlock {
  label: string;
  value: string;
  description: string;
  icon: any;
}

export default function EditTaskScreen({ route }: EditTaskScreenProps) {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const locationSectionRef = useRef<View>(null);

  // Get task data from params - MEMOIZED to prevent infinite re-renders
  const taskData = useMemo(() => {
    return route?.params?.task || (params.task ? JSON.parse(String(params.task)) : null);
  }, [route?.params?.task, params.task]);
  
  const taskId = route?.params?.taskId || params.taskId;

  console.log('📝 Edit Task Screen - Task ID:', taskId);
  console.log('📝 Edit Task Screen - Task Data:', JSON.stringify(taskData, null, 2));
  console.log('📝 Edit Task Screen - Location field:', taskData?.location);
  console.log('📝 Edit Task Screen - Location type:', typeof taskData?.location);

  // Map task data to form fields - MEMOIZED to prevent recreation
  const initialLocation = useMemo(() => {
    if (!taskData?.location) {
      console.log('📍 No location data in taskData');
      return null;
    }
    
    // Handle case where location might be a stringified JSON
    let locationData = taskData.location;
    if (typeof locationData === 'string') {
      try {
        console.log('📍 Location is a string, attempting to parse:', locationData);
        locationData = JSON.parse(locationData);
        console.log('📍 Parsed location:', locationData);
      } catch (e) {
        console.error('📍 Failed to parse location string:', e);
        // If it's just a plain address string, use it as-is
        return {
          address: locationData,
          coordinates: { lat: 0, lng: 0 }
        };
      }
    }
    
    console.log('📍 Raw location data:', JSON.stringify(locationData, null, 2));
    
    let lat = 0, lng = 0;
    const coords = locationData.coordinates;
    
    if (coords) {
      console.log('📍 Coordinates object:', JSON.stringify(coords, null, 2));
      
      // Check for GeoJSON format: { type: "Point", coordinates: [lng, lat] }
      if (coords.type === 'Point' && Array.isArray(coords.coordinates)) {
        lng = coords.coordinates[0];
        lat = coords.coordinates[1];
        console.log('📍 Parsed GeoJSON format: lat=', lat, 'lng=', lng);
      }
      // Check for nested coordinates: { coordinates: [lng, lat] }
      else if ('coordinates' in coords && Array.isArray(coords.coordinates)) {
        lng = coords.coordinates[0];
        lat = coords.coordinates[1];
        console.log('📍 Parsed nested array format: lat=', lat, 'lng=', lng);
      }
      // Check for object format: { lat: number, lng: number }
      else if ('lat' in coords && 'lng' in coords) {
        lat = coords.lat;
        lng = coords.lng;
        console.log('📍 Parsed object format: lat=', lat, 'lng=', lng);
      }
      // Check if coords itself is an array: [lng, lat]
      else if (Array.isArray(coords)) {
        lng = coords[0];
        lat = coords[1];
        console.log('📍 Parsed direct array format: lat=', lat, 'lng=', lng);
      }
    }
    
    const address = locationData.address || '';
    console.log('📍 Final parsed location:', { address, lat, lng });
    
    // Additional validation - if address is still JSON-like, extract just the address field
    let cleanAddress = address;
    if (typeof address === 'string' && (address.includes('{') || address.includes('coordinates'))) {
      console.warn('📍 Address appears to contain JSON remnants:', address);
      try {
        const parsed = JSON.parse(address);
        cleanAddress = parsed.address || address;
      } catch (e) {
        // Try to extract address using regex if it's malformed JSON
        const match = address.match(/"address":"([^"]+)"/);
        if (match) {
          cleanAddress = match[1];
          console.log('📍 Extracted address from malformed JSON:', cleanAddress);
        }
      }
    }
    
    return {
      address: cleanAddress,
      coordinates: { lat, lng }
    };
  }, [taskData]);

  // Form states - Initialize ONCE with useMemo values
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => 
    taskData?.categories?.[0] || null
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [title, setTitle] = useState(() => taskData?.title || '');
  const [description, setDescription] = useState(() => taskData?.details || '');
  const [images, setImages] = useState<string[]>(() => taskData?.images || []);
  // Track which images are new (local URIs) vs existing (Cloudinary URLs)
  const [existingImages] = useState<string[]>(() => taskData?.images || []);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation);
  
  // When/Time states - match Create Task screen
  const [selectedOption, setSelectedOption] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePickerOption, setActivePickerOption] = useState('');
  const [onTimeDate, setOnTimeDate] = useState<Date | null>(null);
  const [beforeDate, setBeforeDate] = useState<Date | null>(null);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');
  const [needSpecificTime, setNeedSpecificTime] = useState(false);
  
  const [budget, setBudget] = useState(() => taskData?.budget?.toString() || '');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [budgetError, setBudgetError] = useState('');
  const [budgetTouched, setBudgetTouched] = useState(false);

  // Validation states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [touched, setTouched] = useState({ 
    title: false, 
    description: false, 
    category: false, 
    location: false,
    when: false 
  });

  // Keyboard visibility
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Fetch categories
  const { data: categoriesResponse, isLoading: loadingCategories } = useGetCategories();
  const categories = categoriesResponse?.data || [];

  // Update task mutations
  const updateTaskMutation = useUpdateTask();
  const updateTaskWithImagesMutation = useUpdateTaskWithImages();

  // Initialize date states from task data
  useEffect(() => {
    if (taskData?.dateType) {
      const dateTypeMap: Record<string, string> = {
        'flexible': 'no_rush',
        'before': 'before',
        'on_time': 'on_time',
        'Easy': 'no_rush',
        'Specific': 'on_time',
        'Before': 'before'
      };
      setSelectedOption(dateTypeMap[taskData.dateType] || 'no_rush');
    }

    if (taskData?.date) {
      const existingDate = new Date(taskData.date);
      if (taskData.dateType === 'before' || taskData.dateType === 'Before') {
        setBeforeDate(existingDate);
      } else {
        setOnTimeDate(existingDate);
      }
    } else {
      // Initialize with default dates if no existing date
      const today = new Date();
      setOnTimeDate(today);
      const futureDateFor5Days = new Date(today);
      futureDateFor5Days.setDate(today.getDate() + 5);
      setBeforeDate(futureDateFor5Days);
    }

    if (taskData?.time) {
      setSelectedTimeBlock(taskData.time);
      setNeedSpecificTime(true);
    }
  }, [taskData]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setTimeout(() => setIsKeyboardVisible(false), 100)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Reset time toggle when Flexible option is selected
  useEffect(() => {
    if (selectedOption === 'no_rush') {
      setNeedSpecificTime(false);
      setSelectedTimeBlock('');
    }
  }, [selectedOption]);

  // Update currency symbol based on location using utility function
  useEffect(() => {
    if (selectedLocation) {
      const currencyInfo = getCurrencyFromLocation(selectedLocation);
      setCurrencySymbol(currencyInfo.symbol);
    } else {
      setCurrencySymbol('$'); // Default to USD
    }
  }, [selectedLocation]);

  // Calculate minimum budget based on currency
  const minimumBudget = useMemo(() => {
    const currencyInfo = getCurrencyFromLocation(selectedLocation || undefined);
    return getMinimumBudget(currencyInfo.code);
  }, [selectedLocation]);

  // Validation functions (same as Create Task) - MEMOIZED with useCallback
  const handleTitleChange = useCallback((text: string) => {
    const cleanedText = text.replace(/[^a-zA-Z\s'\-,.]/g, '');
    setTitle(cleanedText);
    
    if (touched.title || cleanedText.length > 0) {
      if (!touched.title && cleanedText.length > 0) {
        setTouched(prev => ({ ...prev, title: true }));
      }
      
      if (cleanedText.trim().length === 0) {
        setTitleError('Title is required');
      } else if (cleanedText.trim().length < 10) {
        setTitleError('Minimum 10 characters required');
      } else {
        setTitleError('');
      }
    }
  }, [touched.title]);

  const handleDescriptionChange = useCallback((text: string) => {
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
  }, [touched.description]);

  const handleTitleBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, title: true }));
    if (title.trim().length === 0) {
      setTitleError('Title is required');
    } else if (title.trim().length < 10) {
      setTitleError('Minimum 10 characters required');
    } else {
      setTitleError('');
    }
  }, [title]);

  const handleDescriptionBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, description: true }));
    if (description.trim().length === 0) {
      setDescriptionError('Description is required');
    } else if (description.trim().length < 20) {
      setDescriptionError('Minimum 20 characters required');
    } else {
      setDescriptionError('');
    }
  }, [description]);

  // Image picker function with OCR validation
  const pickImage = async () => {
    if (images.length >= 10) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is required to select photos.', [{ text: 'OK' }]);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const imageUri = result.assets[0].uri;
        
        // ✅ Validate with OCR API
        console.log('🔍 Validating image with OCR API:', imageUri);
        const validation = await OCRAPI.validateImageForUpload(imageUri);
        
        if (!validation.isValid) {
          console.warn('❌ Image contains sensitive data:', validation.reason);
          Alert.alert(
            'Sensitive Data Detected',
            `This image contains sensitive information and cannot be uploaded:

${validation.reason}

Please remove phone numbers and addresses from the image.`,
            [{ text: 'OK' }]
          );
          return;
        }
        
        console.log('✅ Image passed OCR validation');
        setImages(prevImages => [...prevImages, imageUri]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Remove image function - MEMOIZED
  const removeImage = useCallback((uri: string) => {
    setImages(prevImages => prevImages.filter(img => img !== uri));
  }, []);

  // Location handlers - MEMOIZED
  const handleLocationSelect = useCallback((location: LocationData) => {
    console.log('📍 Location selected:', location);
    setSelectedLocation(location);
    setTouched(prev => ({ ...prev, location: true }));
  }, []);

  const handleLocationFocus = useCallback(() => {
    console.log('📍 Location field focused');
    if (locationSectionRef.current && scrollViewRef.current) {
      setTimeout(() => {
        locationSectionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y + 100, animated: true });
          },
          () => {}
        );
      }, 150);
    }
  }, []);

  // Date picker handlers - MEMOIZED
  const handleDateChange = useCallback((event: DateTimePickerEvent, date?: Date | undefined): void => {
    console.log('📅 Date picker change:', { event: event.type, date });
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && date) {
      if (activePickerOption === 'on_time') {
        console.log('📅 Setting onTimeDate:', date);
        setOnTimeDate(date);
      } else if (activePickerOption === 'before') {
        console.log('📅 Setting beforeDate:', date);
        setBeforeDate(date);
      }
    }
    
    if (Platform.OS === 'ios' && event.type === 'dismissed') {
      setShowDatePicker(false);
    }
    
    setActivePickerOption('');
  }, [activePickerOption]);

  const handleOpenPicker = useCallback((pickerType: string) => {
    console.log('📅 Opening date picker:', pickerType);
    setActivePickerOption(pickerType);
    setShowDatePicker(true);
  }, []);

  // Budget handlers - MEMOIZED with validation
  const handleBudgetChange = useCallback((text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanedText.split('.');
    const validText = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanedText;
    
    setBudget(validText);
    setBudgetTouched(true);
    
    // Validate budget amount
    const budgetNumber = parseFloat(validText);
    if (validText && !isNaN(budgetNumber)) {
      if (budgetNumber < minimumBudget) {
        setBudgetError(`Minimum budget is ${currencySymbol}${formatNumber(minimumBudget, { forceDecimals: true })}`);
      } else {
        setBudgetError('');
      }
    } else if (validText) {
      setBudgetError('Please enter a valid number');
    } else {
      setBudgetError('');
    }
  }, [minimumBudget, currencySymbol]);

  const handleBudgetFocus = useCallback(() => {
    setBudgetTouched(true);
    // Clear default "0" or "0.00" when user starts typing
    if (budget === '0' || budget === '0.00' || budget === '') {
      setBudget('');
      setBudgetError('');
    }
  }, [budget]);

  const handleBudgetBlur = useCallback(() => {
    // Validate on blur
    const budgetNumber = parseFloat(budget);
    if (budget && !isNaN(budgetNumber)) {
      if (budgetNumber < minimumBudget) {
        setBudgetError(`Minimum budget is ${currencySymbol}${formatNumber(minimumBudget, { forceDecimals: true })}`);
      } else {
        setBudgetError('');
      }
    } else if (budgetTouched && !budget) {
      setBudgetError('Budget is recommended');
    }
  }, [budget, budgetTouched, minimumBudget, currencySymbol]);

  // Time blocks (same as Create Task) - MEMOIZED to prevent recreation
  const timeBlocks: TimeBlock[] = useMemo(() => [
    { label: 'Morning', value: 'morning', description: 'before 12 pm', icon: require('@/assets/icons/rooster.png') },
    { label: 'Afternoon', value: 'afternoon', description: '12pm to 5 pm', icon: require('@/assets/icons/hat.png') },
    { label: 'Evening', value: 'evening', description: 'After 5pm', icon: require('@/assets/icons/tea.png') },
    { label: 'Late night', value: 'late_night', description: 'After 9pm', icon: require('@/assets/icons/owl.png') },
  ], []);

  // Date options (same as Create Task: On Date, Before Date, Flexible) - MEMOIZED
  const dateOptions = useMemo(() => [
    { label: 'On Date', value: 'on_time' },
    { label: 'Before Date', value: 'before' },
    { label: 'Flexible', value: 'no_rush' },
  ], []);

  // Filter categories based on search
  const filteredCategories = categories.filter((cat: any) =>
    (typeof cat === 'string' ? cat : cat.name)
      .toLowerCase()
      .includes(categorySearchQuery.toLowerCase())
  );

  // Validation check
  const titleLength = title.trim().length;
  const descriptionLength = description.trim().length;
  const budgetNumber = parseFloat(budget);
  const isBudgetValid = !budget || (!isNaN(budgetNumber) && budgetNumber >= minimumBudget);
  
  const isFormValid =
    !!selectedCategory &&
    titleLength >= 10 &&
    descriptionLength >= 20 &&
    !titleError &&
    !descriptionError &&
    !!selectedLocation &&
    selectedOption !== '' &&
    isBudgetValid;

  // Handle save with validation
  const handleSave = async () => {
    if (!taskId) {
      Alert.alert("Error", "Task ID is missing");
      return;
    }

    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      category: true,
      location: true,
      when: true,
    });

    // Validate all fields
    if (title.trim().length === 0) {
      setTitleError('Title is required');
    } else if (title.trim().length < 10) {
      setTitleError('Minimum 10 characters required');
    }

    if (description.trim().length === 0) {
      setDescriptionError('Description is required');
    } else if (description.trim().length < 20) {
      setDescriptionError('Minimum 20 characters required');
    }

    if (!isFormValid) {
      const missingFields = [];
      if (!selectedCategory) missingFields.push('Category');
      if (titleLength < 10) missingFields.push('Title (min 10 chars)');
      if (descriptionLength < 20) missingFields.push('Description (min 20 chars)');
      if (!selectedLocation) missingFields.push('Location');
      if (selectedOption === '') missingFields.push('When');
      if (!isBudgetValid) missingFields.push(`Budget (min ${currencySymbol}${formatNumber(minimumBudget, { forceDecimals: true })})`);
      
      Alert.alert(
        'Incomplete Form',
        'Please fill in all required fields:\n' +
        (!selectedCategory ? '• Select a category\n' : '') +
        (titleLength < 10 ? '• Title must be at least 10 characters\n' : '') +
        (descriptionLength < 20 ? '• Description must be at least 20 characters\n' : '') +
        (!selectedLocation ? '• Select a location\n' : '') +
        (selectedOption === '' ? '• Select when you need this done\n' : '') +
        (!isBudgetValid ? `• Budget must be at least ${currencySymbol}${formatNumber(minimumBudget, { forceDecimals: true })}` : '')
      );
      return;
    }

    console.log('💾 Saving task:', taskId);

    try {
      const selectedDate =
        selectedOption === 'on_time' ? onTimeDate : selectedOption === 'before' ? beforeDate : null;

      console.log('\n🔨 EDIT TASK: Building update request...');
      console.log('📝 EDIT TASK: Current form values:');
      console.log('  - Title:', title);
      console.log('  - Description:', description);
      console.log('  - Budget:', budget);
      console.log('  - Location:', selectedLocation?.address);
      console.log('  - Category:', selectedCategory);
      console.log('  - Date option:', selectedOption);
      console.log('  - Selected date:', selectedDate);
      console.log('  - Time block:', selectedTimeBlock);

      // Get currency code from location using utility function
      const currencyInfo = getCurrencyFromLocation(selectedLocation || undefined);
      console.log('💰 EDIT TASK: Currency info:', currencyInfo);

      // Prepare the update request body matching backend API expectations
      const updateRequest: any = {
        title: title.trim(),
        details: description.trim(), // Backend expects 'details' field
        budget: budget ? parseFloat(budget) : undefined,
        currency: currencyInfo.code,
        time: selectedTimeBlock || undefined,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
        dateType: selectedOption === 'no_rush' ? 'Easy' : selectedOption === 'on_time' ? 'DoneOn' : 'DoneBy',
      };
      
      console.log('🗓️ EDIT TASK: Date type mapping:', {
        selectedOption,
        mappedDateType: updateRequest.dateType
      });

      // Add location only if it exists (GeoJSON format required by backend)
      if (selectedLocation) {
        updateRequest.location = {
          address: selectedLocation.address,
          coordinates: {
            type: "Point",
            coordinates: [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat] // GeoJSON: [longitude, latitude]
          }
        };
        console.log('📍 EDIT TASK: Location added (GeoJSON format):', updateRequest.location);
      }

      // Add category if changed
      if (selectedCategory) {
        updateRequest.category = selectedCategory; // Backend expects singular string
        console.log('🏷️ EDIT TASK: Category added:', selectedCategory);
      }

      // Remove undefined values
      Object.keys(updateRequest).forEach(key => 
        updateRequest[key] === undefined && delete updateRequest[key]
      );

      console.log('\n📤 EDIT TASK: Final update request payload:');
      console.log(JSON.stringify(updateRequest, null, 2));
      
      // 🖼️ HANDLE IMAGES: Separate new uploads from existing URLs
      console.log('\n🖼️ EDIT TASK: Processing images...');
      console.log('🖼️ Current images array:', images);
      console.log('🖼️ Original existing images:', existingImages);
      
      // Detect which images are new (local file:// URIs) vs existing (https:// Cloudinary URLs)
      const newImageUris = images.filter(img => 
        img.startsWith('file://') || 
        img.startsWith('content://') || 
        (!img.startsWith('http://') && !img.startsWith('https://'))
      );
      
      const keptExistingImages = images.filter(img => 
        img.startsWith('http://') || img.startsWith('https://')
      );
      
      const hasNewImages = newImageUris.length > 0;
      const imagesChanged = images.length !== existingImages.length || 
                           !images.every((img, idx) => img === existingImages[idx]);
      
      // 🔧 FIX: Calculate if images were removed to determine replaceImages flag
      const imagesWereRemoved = keptExistingImages.length < existingImages.length;
      const shouldReplaceImages = imagesWereRemoved || (imagesChanged && !hasNewImages);
      
      console.log('🖼️ New image URIs to upload:', newImageUris.length, newImageUris);
      console.log('🖼️ Existing images to keep:', keptExistingImages.length, keptExistingImages);
      console.log('🖼️ Has new images:', hasNewImages);
      console.log('🖼️ Images changed:', imagesChanged);
      console.log('🖼️ Images were removed:', imagesWereRemoved, `(${existingImages.length} → ${keptExistingImages.length})`);
      console.log('🖼️ Should replace images:', shouldReplaceImages);
      
      let result;
      
      if (hasNewImages || imagesChanged) {
        // Use updateTaskWithImages for multipart upload
        console.log('\n🚀 EDIT TASK: Using updateTaskWithImages (with image upload support)...');
        result = await updateTaskWithImagesMutation.mutateAsync({
          taskId: taskId as string,
          updates: updateRequest,
          newImageUris,
          existingImages: keptExistingImages,
          replaceImages: shouldReplaceImages // TRUE when images removed, FALSE when only adding
        });
      } else {
        // Use regular updateTask (no images changed)
        console.log('\n🚀 EDIT TASK: Using regular updateTask (no image changes)...');
        result = await updateTaskMutation.mutateAsync({
          taskId: taskId as string,
          updates: updateRequest
        });
      }

      console.log('\n✅ EDIT TASK: Mutation completed successfully!');
      console.log('✅ EDIT TASK: API Response:');
      console.log(JSON.stringify(result, null, 2));

      console.log('\n🎉 EDIT TASK: Showing success alert...');
      
      // Show success message
      Alert.alert(
        "Task Updated",
        "Your task has been updated successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log('✅ EDIT TASK: User confirmed success, navigating back...');
              router.back();
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('\n❌❌❌ EDIT TASK: ERROR OCCURRED ❌❌❌');
      console.error('❌ EDIT TASK: Error object:', error);
      console.error('❌ EDIT TASK: Error message:', error?.message);
      console.error('❌ EDIT TASK: Error stack:', error?.stack);
      console.error('❌ EDIT TASK: Error response:', error?.response);
      console.error('❌ EDIT TASK: Error response data:', error?.response?.data);
      console.error('❌ EDIT TASK: Error status:', error?.response?.status);
      
      let errorMessage = "Failed to update task. Please try again.";
      let errorTitle = "Update Failed";
      
      if (error?.message?.includes("Authentication") || error?.isAuthError) {
        errorMessage = "Your session has expired. Please login again to update this task.";
        errorTitle = "Authentication Required";
      } else if (error?.message?.includes("Network")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
        errorTitle = "Connection Error";
      } else if (error?.message?.includes("not found")) {
        errorMessage = "This task was not found. It may have been deleted.";
        errorTitle = "Task Not Found";
      } else if (error?.message?.includes("permission")) {
        errorMessage = "You don't have permission to update this task.";
        errorTitle = "Permission Denied";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage);
    }
  };

  return (
    <View style={styles.wrapper}>
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
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
        <View style={styles.section}>
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
                  ) : categories.length === 0 ? (
                    <Text style={styles.noResultsText}>No categories found</Text>
                  ) : (
                    filteredCategories.map((cat: any, index: number) => {
                      const categoryName = typeof cat === 'string' ? cat : cat.name;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[styles.categoryItem, selectedCategory === categoryName && styles.categoryItemSelected]}
                          onPress={() => {
                            setSelectedCategory(categoryName);
                            setShowCategoryDropdown(false);
                            setCategorySearchQuery('');
                          }}
                        >
                          <Text
                            style={[
                              styles.categoryItemText,
                              selectedCategory === categoryName && styles.categoryItemTextSelected,
                            ]}
                          >
                            {categoryName}
                          </Text>
                          {selectedCategory === categoryName && <Ionicons name="checkmark" size={20} color="#0057FF" />}
                        </TouchableOpacity>
                      );
                    })
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos & Location</Text>
          <Text style={styles.sectionSubtitle}>Help taskers understand what needs doing ({images.length}/10 photos)</Text>

          <View style={styles.imageSection}>
            {images.map((uri, index) => (
              <View key={uri} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(uri)}>
                  <Ionicons name="close-circle" size={22} color="#FF4D4F" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 10 && (
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#467FFF" />
                <Ionicons name="add" size={16} color="#467FFF" style={styles.addIcon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Location */}
          <View ref={locationSectionRef} style={styles.fieldContainer}>
            <Text style={styles.label}>
              Location <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.locationSubtitle}>
              Where do you need this done? Type and select from suggestions.
            </Text>

            <LocationAutocomplete
              onSelect={handleLocationSelect}
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

        {/* SECTION 3: WHEN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            When <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>When do you need this done?</Text>

          {/* Date/Time Options - Match Create Task */}
          <View style={styles.dateSection}>
            <Text style={styles.dateSectionTitle}>Date</Text>
            {dateOptions.map((option) => (
              <View key={option.value}>
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setSelectedOption(option.value);
                    setTouched({ ...touched, when: true });
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  <View style={[
                    styles.radioOuter,
                    selectedOption === option.value && styles.radioOuterSelected,
                  ]}>
                    {selectedOption === option.value && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                {/* Show date selector for On Date */}
                {option.value === 'on_time' && selectedOption === 'on_time' && (
                  <TouchableOpacity 
                    onPress={() => handleOpenPicker('on_time')} 
                    style={styles.dateSelector}
                  >
                    <Text style={styles.dateText}>
                      📅 {onTimeDate ? onTimeDate.toDateString() : 'Select date'} (Tap to change)
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Show date selector for Before Date */}
                {option.value === 'before' && selectedOption === 'before' && (
                  <TouchableOpacity 
                    onPress={() => handleOpenPicker('before')} 
                    style={styles.dateSelector}
                  >
                    <Text style={styles.dateText}>
                      📅 {beforeDate ? beforeDate.toDateString() : 'Select date'} (Tap to change)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {touched.when && selectedOption === '' && (
            <Text style={styles.validationText}>Please select when you need this done</Text>
          )}

          {/* Time Toggle */}
          <View style={[styles.toggleRow, selectedOption === 'no_rush' && styles.toggleRowDisabled]}>
            <Text style={[styles.toggleText, selectedOption === 'no_rush' && styles.toggleTextDisabled]}>
              I need certain time of day
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (selectedOption !== 'no_rush') {
                  setNeedSpecificTime(!needSpecificTime);
                }
              }}
              disabled={selectedOption === 'no_rush'}
            >
              <View style={[
                styles.switch,
                needSpecificTime && selectedOption !== 'no_rush' && styles.switchActive,
                selectedOption === 'no_rush' && styles.switchDisabled
              ]}>
                <View style={[
                  styles.switchThumb,
                  needSpecificTime && selectedOption !== 'no_rush' && styles.switchThumbActive
                ]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Time of Day Grid */}
          {needSpecificTime && selectedOption !== 'no_rush' && (
            <View style={styles.gridContainer}>
              {timeBlocks.map(block => (
                <TouchableOpacity
                  key={block.value}
                  style={[
                    styles.gridItem,
                    selectedTimeBlock === block.value && styles.gridItemSelected
                  ]}
                  onPress={() => setSelectedTimeBlock(block.value)}
                >
                  <View style={styles.iconContainer}>
                    <Image source={block.icon} style={styles.timeIcon} />
                  </View>
                  <Text style={styles.gridTitle}>{block.label}</Text>
                  <Text style={styles.gridDescription}>{block.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* SECTION 4: BUDGET */}
        <View style={styles.section}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Budget (Optional)</Text>
            <Text style={styles.helperText}>
              Minimum recommended: {currencySymbol}{formatNumber(minimumBudget)}. You can negotiate the final price later.
            </Text>
            <View style={[
              styles.budgetInputContainer,
              budgetError && budgetTouched && styles.inputError
            ]}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.budgetTextInput}
                value={budget}
                onChangeText={handleBudgetChange}
                onFocus={handleBudgetFocus}
                onBlur={handleBudgetBlur}
                keyboardType="decimal-pad"
                placeholder={minimumBudget.toString()}
                placeholderTextColor="#999"
              />
            </View>
            {budgetError && budgetTouched && (
              <Text style={styles.errorText}>{budgetError}</Text>
            )}
            {budget && !budgetError && parseFloat(budget) >= minimumBudget && (
              <Text style={styles.successText}>✓ Valid budget amount</Text>
            )}
          </View>
        </View>
        </ScrollView>
          </View>
        </TouchableWithoutFeedback>

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

      {/* Save Button */}
      {!isKeyboardVisible && (
        <TouchableOpacity 
          style={[
            styles.saveButton,
            isFormValid && styles.saveButtonEnabled,
            { bottom: Math.max(insets.bottom, 20) },
            (updateTaskMutation.isPending || updateTaskWithImagesMutation.isPending) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || updateTaskMutation.isPending || updateTaskWithImagesMutation.isPending}
        >
          {(updateTaskMutation.isPending || updateTaskWithImagesMutation.isPending) ? (
            <View style={styles.saveButtonContent}>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      )}
      </View>

      {/* Bottom safe area for Android navigation bar */}
      <View style={styles.bottomSafeArea} />
    </View>
  );
}

// Styles matching Create Task Screen
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    paddingBottom: 300,
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
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: '#34C759',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 30,
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
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
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
  dateSection: {
    marginBottom: 30,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0057FF',
    backgroundColor: '#0057FF',
  },
  radioInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  dateSelector: {
    marginBottom: 16,
    paddingLeft: 16,
  },
  dateText: {
    color: '#0057FF',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  toggleRowDisabled: {
    opacity: 0.5,
    backgroundColor: '#F2F2F7',
  },
  toggleTextDisabled: {
    color: '#8E8E93',
  },
  switch: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#0057FF',
  },
  switchDisabled: {
    backgroundColor: '#F2F2F7',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  gridItemSelected: {
    borderColor: '#FF6A00',
    backgroundColor: '#FFF4E6',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  gridDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  budgetTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#D1D1D6',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonEnabled: {
    backgroundColor: '#0057FF',
  },
  saveButtonDisabled: {
    backgroundColor: '#aaa',
    opacity: 0.7,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  validationTextContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 6,
    minHeight: 22,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  validationTextSuccess: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
    textAlign: 'center',
  },
  validationTextWarning: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
    textAlign: 'center',
  },
  validationTextDetails: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 48 : 0,
    backgroundColor: '#fff',
  },
});
