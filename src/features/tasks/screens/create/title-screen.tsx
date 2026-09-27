import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { TaskTitleSuggestions } from './components/TaskTitleSuggestions';
import { RFValue } from '@/src/shared/utils/responsive';
import { FLOW, FlowBackground, primaryShadow } from './flowTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppLoader from '@/src/shared/components/AppLoader';

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  locationType?: 'physical' | 'online' | 'both';
  isActive?: boolean;
}

export default function TitleInputScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { myTask, updateMyTask, resetTask } = useCreateTaskStore();

  // Fetch categories
  const { data: categoriesResponse, isLoading: loadingCategories, error: categoriesError } = useGetCategories();

  // Initialize with existing data from store
  useEffect(() => {
    if (myTask.title) {
      setTitle(myTask.title);
    }
    if (myTask.description) {
      setDescription(myTask.description);
    }
    if ('category' in myTask && myTask.category) {
      setSelectedCategory(myTask.category);
    }
  }, [myTask.title, myTask.description]);

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

  const titleLength = title.trim().length;
  const isFormValid = selectedCategory && titleLength >= 10 && description.trim().length > 0;

  const handleContinue = () => {
    if (isFormValid) {
      updateMyTask({ 
        title, 
        description,
        category: selectedCategory,
        isRemoval: false // This is a category task, not removal
      });
      router.push('/image-upload-screen'); // Navigate to the next screen
    }
  };

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Check if user has entered any data (local state or store)
        const hasLocalData = title.trim() || description.trim() || selectedCategory;
        const hasStoreData = myTask.title || myTask.description || ('category' in myTask && myTask.category);
        const hasData = hasLocalData || hasStoreData;
        
        if (hasData) {
          // Show confirmation dialog
          Alert.alert(
            'Discard Changes?',
            'You have unsaved changes. Do you want to discard them?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {} // Do nothing, stay on screen
              },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => {
                  console.log('🗑️ User confirmed discard via hardware back');
                  resetTask();
                  router.back();
                }
              }
            ]
          );
          return true; // Prevent default back behavior
        } else {
          // No data, allow default back behavior
          resetTask();
          return false;
        }
      };

      // Add event listener and get subscription
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup using subscription.remove()
      return () => subscription.remove();
    }, [title, description, selectedCategory, myTask, resetTask, router])
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={FLOW.blue} />
      <FlowBackground isDarkMode={false} />
      {/* Back Button */}
      <TouchableOpacity style={[styles.backButton, { top: Math.max(insets.top, 20) + 6 }]} onPress={() => {
        // Check if user has entered any data (local state or store)
        const hasLocalData = title.trim() || description.trim() || selectedCategory;
        const hasStoreData = myTask.title || myTask.description || ('category' in myTask && myTask.category);
        const hasData = hasLocalData || hasStoreData;
        
        console.log('🔙 Back button pressed - Data check:');
        console.log('   Local data:', { title: title.trim(), description: description.trim(), category: selectedCategory });
        console.log('   Store data:', { title: myTask.title, description: myTask.description, category: ('category' in myTask ? myTask.category : null) });
        console.log('   Has data:', hasData);
        
        if (hasData) {
          // Prompt user to confirm discarding changes
          Alert.alert(
            'Discard Changes?',
            'You have unsaved changes. Do you want to discard them?',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => {
                  console.log('🗑️ User confirmed discard - resetting task form');
                  resetTask();
                  router.back();
                }
              }
            ]
          );
        } else {
          // No data entered, just go back
          console.log('✅ No data to discard, going back');
          resetTask();
          router.back();
        }
      }}>
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title & Subtitle */}
        <Text style={styles.title}>Tell us about your task</Text>
        <Text style={styles.subtitle}>Provide details so heroes know what you need</Text>

        {/* Category Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={[styles.categorySelectorText, !selectedCategory && styles.placeholder]}>
              {selectedCategory || 'Select a category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={FLOW.blue} />
          </TouchableOpacity>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <View style={styles.categoryDropdown}>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="rgba(255,255,255,0.72)" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChangeText={setCategorySearchQuery}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
              </View>

              {/* Categories List */}
              <ScrollView style={styles.categoriesList} nestedScrollEnabled>
                {loadingCategories ? (
                  <AppLoader size={22} color="#FFFFFF" style={styles.loader} />
                ) : categoriesError ? (
                  <Text style={styles.errorText}>Failed to load categories</Text>
                ) : categories.length === 0 ? (
                  <Text style={styles.noResultsText}>No categories found</Text>
                ) : (
                  categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryItem,
                        selectedCategory === category && styles.categoryItemSelected
                      ]}
                      onPress={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                        setCategorySearchQuery('');
                      }}
                    >
                      <Text style={[
                        styles.categoryItemText,
                        selectedCategory === category && styles.categoryItemTextSelected
                      ]}>
                        {category}
                      </Text>
                      {selectedCategory === category && (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* AI-Powered Title Suggestions */}
        <TaskTitleSuggestions 
          selectedCategory={selectedCategory}
          currentTitle={title}
          onSuggestionSelect={(suggestion) => {
            setTitle(suggestion);
            console.log('📝 Applied AI suggestion to title:', suggestion);
          }}
        />

        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Task title <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              styles.input,
              titleLength < 10 && titleLength > 0 && styles.inputError
            ]}
            placeholder="e.g. Move my couch"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
            maxLength={200}
          />
          {titleLength > 0 && titleLength < 10 && (
            <Text style={styles.validationText}>Minimum 10 characters required</Text>
          )}
          <Text style={styles.characterCount}>
            {titleLength}/200 characters
          </Text>
        </View>

        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textArea]}
            multiline
            placeholder="Give a detailed description of your task..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#999"
            textAlignVertical="top"
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isFormValid && styles.continueButtonEnabled,
          ]}
          disabled={!isFormValid}
          onPress={handleContinue}
        >
          <Text style={[styles.continueText, !isFormValid && styles.continueTextDisabled]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FLOW.blue,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 130,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: FLOW.textMuted,
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categorySelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categorySelectorText: {
    fontSize: RFValue(16),
    color: FLOW.ink,
  },
  placeholder: {
    color: FLOW.placeholder,
  },
  categoryDropdown: {
    marginTop: 8,
    backgroundColor: '#003399',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: RFValue(16),
    color: '#FFFFFF',
  },
  categoriesList: {
    maxHeight: 250,
  },
  loader: {
    padding: 20,
  },
  errorText: {
    color: '#FCA5A5',
    padding: 20,
    textAlign: 'center',
  },
  noResultsText: {
    color: 'rgba(255,255,255,0.72)',
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
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  categoryItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  categoryItemText: {
    fontSize: RFValue(16),
    color: '#FFFFFF',
  },
  categoryItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: RFValue(16),
    color: FLOW.ink,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: FLOW.error,
  },
  validationText: {
    fontSize: RFValue(12),
    color: FLOW.error,
    marginTop: 4,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: RFValue(16),
    color: FLOW.ink,
    height: 120,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: FLOW.blueDeep,
    borderTopWidth: 1,
    borderTopColor: FLOW.line,
  },
  continueButton: {
    backgroundColor: FLOW.disabledFill,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonEnabled: {
    backgroundColor: FLOW.orange,
    ...primaryShadow,
  },
  continueText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  continueTextDisabled: {
    color: FLOW.disabledText,
  },
  characterCount: {
    fontSize: RFValue(12),
    color: FLOW.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  required: {
    color: FLOW.required,
  },
});