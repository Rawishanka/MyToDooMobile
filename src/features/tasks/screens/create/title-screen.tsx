import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
  const { myTask, updateMyTask } = useCreateTaskStore();

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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#333" />
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
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <View style={styles.categoryDropdown}>
              {/* Search Input */}
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

              {/* Categories List */}
              <ScrollView style={styles.categoriesList} nestedScrollEnabled>
                {loadingCategories ? (
                  <ActivityIndicator size="small" color="#0057FF" style={styles.loader} />
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
                        <Ionicons name="checkmark" size={20} color="#0057FF" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Title</Text>
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
      <TouchableOpacity
        style={[
          styles.continueButton,
          isFormValid && styles.continueButtonEnabled,
        ]}
        disabled={!isFormValid}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
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