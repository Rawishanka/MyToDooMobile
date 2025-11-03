import { useGetCategories, useGetCategoriesByLocation } from '@/src/shared/hooks/useTaskApi';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import {
    CategoryDropdown,
    LocationInputSection,
    LocationTypeSelector,
    MovingToggle,
    RemovalLocationInputs,
} from './components';

interface LocationData {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    iconUrl?: string;
    locationType?: 'physical' | 'online' | 'both';
    isActive?: boolean;
}

type LocationType = 'In-person' | 'Online' | 'Both';

const LocationScreen = () => {
    const [isRemoval, setIsRemoval] = useState(false);
    const [pickupCode, setPickupCode] = useState('');
    const [dropoffCode, setDropoffCode] = useState('');
    const [locationType, setLocationType] = useState<LocationType>('In-person');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
    const [categorySearchQuery, setCategorySearchQuery] = useState('');

    const { myTask, updateMyTask } = useCreateTaskStore();
    
    // Fetch categories based on location type (only for In-person and Online, not Both)
    const shouldUseFilteredCategories = !isRemoval && locationType !== 'Both';
    const { data: categoriesByLocation, isLoading: loadingCategoriesByLocation, error: categoriesByLocationError, refetch: refetchCategoriesByLocation } = useGetCategoriesByLocation(locationType, shouldUseFilteredCategories);
    
    // Always fetch regular categories (used for Both option and as fallback)
    const { data: categoriesResponse, isLoading: loadingCategories, error: categoriesError, refetch: refetchCategories } = useGetCategories();

    // Debug logs - only when data changes
    useEffect(() => {
        console.log('Current Task:', myTask);
    }, [myTask]);

    useEffect(() => {
        if (categoriesResponse) {
            console.log('Categories Response:', categoriesResponse);
        }
    }, [categoriesResponse]);

    useEffect(() => {
        if (categoriesError) {
            console.log('Categories Error:', categoriesError);
        }
    }, [categoriesError]);

    // Initialize with existing data from store
    useEffect(() => {
        // Check if it's a removal task
        if ('isRemoval' in myTask && myTask.isRemoval) {
            setIsRemoval(true);
            if (myTask.pickupLocation) {
                setPickupCode(myTask.pickupLocation);
            }
            if (myTask.deliveryLocation) {
                setDropoffCode(myTask.deliveryLocation);
            }
        } 
        // Check if it's a category task
        else if ('category' in myTask && myTask.category) {
            setIsRemoval(false);
            setSelectedCategory(myTask.category);
        }
    }, [myTask]);

    // Get all categories (we'll show all categories and auto-select location type based on category)
    const categoriesData = !isRemoval ? (categoriesResponse?.data || []) : [];
    
    // Handle both string arrays (fallback) and object arrays (from backend)
    const fullCategories: Category[] = categoriesData.map((cat: any) => {
        if (typeof cat === 'string') {
            return { _id: cat, name: cat, locationType: undefined };
        }
        return cat;
    });
    
    // Extract category names for display
    const allCategories: string[] = fullCategories.map((cat: Category) => cat.name);
    
    // Filter categories based on search query
    const categories: string[] = categorySearchQuery.trim()
        ? allCategories.filter(cat => 
            cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
          )
        : allCategories;

    // Loading state
    const isLoadingCategories = !isRemoval && loadingCategories;

    // Error state
    const hasErrorCategories = !isRemoval && !!categoriesError;

    // Handle dropdown positioning
    const handleDropdownToggle = (event: any) => {
        const { pageY } = event.nativeEvent;
        const screenHeight = 800; // Approximate screen height, can be made dynamic
        const dropdownHeight = Math.min(categories.length * 50, 200); // Estimate dropdown height
        
        // If there's not enough space below, show above
        if (pageY + dropdownHeight > screenHeight - 100) {
            setDropdownPosition('above');
        } else {
            setDropdownPosition('below');
        }
        
        setShowCategoryDropdown(!showCategoryDropdown);
    };
    // Handle location type change
    const handleLocationTypeChange = (type: LocationType) => {
        setLocationType(type);
        setSelectedCategory(null); // Reset category when changing location type
        if (type === 'Online') {
            setSelectedLocation(null); // Clear location for online tasks
        }
    };

    // Location handler
    const handleLocationSelect = (location: LocationData) => {
        setSelectedLocation(location);
        console.log('Selected location:', location);
    };

    // Handle category selection
    const handleCategorySelect = (category: string, categoryObj?: Category) => {
        console.log('Selected category:', category);
        console.log('Selected category object:', categoryObj);
        
        // Auto-select location type based on category's locationType
        if (categoryObj && categoryObj.locationType) {
            const categoryLocationType = categoryObj.locationType;
            
            console.log('Category locationType:', categoryLocationType);
            
            if (categoryLocationType === 'physical') {
                setLocationType('In-person');
                console.log('✅ Auto-selected: In-person');
            } else if (categoryLocationType === 'online') {
                setLocationType('Online');
                setSelectedLocation(null); // Clear location for online tasks
                console.log('✅ Auto-selected: Online');
            } else if (categoryLocationType === 'both') {
                setLocationType('Both');
                console.log('✅ Auto-selected: Both');
            }
        } else {
            console.log('⚠️ No locationType found for category, keeping current selection');
        }
        
        // Set the selected category (already a string)
        setSelectedCategory(category);
        setShowCategoryDropdown(false);
        setCategorySearchQuery('');
    };

    // Helper to update zustand store with correct type
    const handleContinue = () => {
        if (isRemoval) {
            // RemovalTask
            if (!pickupCode.trim() || !dropoffCode.trim()) {
                alert('Please enter both pickup and drop-off locations');
                return;
            }
            updateMyTask({
                isRemoval: true,
                pickupLocation: pickupCode,
                deliveryLocation: dropoffCode,
            });
        } else {
            // CategoryTask - Both category and location are mandatory for In Person
            if (!selectedCategory) {
                alert('Please select a category for your task');
                return;
            }
            if (locationType === 'In-person' && !selectedLocation) {
                alert('Please select a location for your task');
                return;
            }
            updateMyTask({
                isRemoval: false,
                category: selectedCategory,
                location: locationType === 'In-person' && selectedLocation ? selectedLocation.address : 'Online',
                coordinates: locationType === 'In-person' && selectedLocation ? selectedLocation.coordinates : undefined,
                locationType: locationType, // Store the location type
            });
        }
        router.push('/budget-screen' as any);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Back Arrow */}
            <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
                <ChevronLeft size={24} color="#1C1C1E" />
            </TouchableOpacity>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Title */}
                <Text style={styles.title}>Tell me more!</Text>
                <Text style={styles.subtitle}>Where do you need it done?</Text>

                {/* Toggle for Moving */}
                <MovingToggle value={isRemoval} onValueChange={setIsRemoval} />

                {/* Conditional content */}
                {isRemoval ? (
                    <RemovalLocationInputs
                        pickupCode={pickupCode}
                        dropoffCode={dropoffCode}
                        onPickupChange={setPickupCode}
                        onDropoffChange={setDropoffCode}
                    />
                ) : (
                    <>
                        {/* Location Type Selection */}
                        <LocationTypeSelector
                            selectedType={locationType}
                            onTypeChange={handleLocationTypeChange}
                        />

                        {/* Category Selection */}
                        <CategoryDropdown
                            isLoading={isLoadingCategories}
                            hasError={hasErrorCategories}
                            selectedCategory={selectedCategory}
                            categories={categories}
                            fullCategories={fullCategories}
                            showDropdown={showCategoryDropdown}
                            dropdownPosition={dropdownPosition}
                            searchQuery={categorySearchQuery}
                            onDropdownToggle={handleDropdownToggle}
                            onCategorySelect={handleCategorySelect}
                            onSearchChange={setCategorySearchQuery}
                            onRetry={refetchCategoriesByLocation}
                            onCloseDropdown={() => {
                                setShowCategoryDropdown(false);
                                setCategorySearchQuery('');
                            }}
                        />

                        {/* Location Search - Only show for In Person tasks AND when category dropdown is closed */}
                        {locationType === 'In-person' && !showCategoryDropdown && (
                            <LocationInputSection
                                selectedLocation={selectedLocation}
                                onLocationSelect={handleLocationSelect}
                            />
                        )}
                    </>
                )}
            </ScrollView>

            {/* Continue */}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

export default LocationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backArrow: {
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
        paddingTop: 90,
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
        color: '#666',
        marginBottom: 20,
    },
    continueButton: {
        marginHorizontal: 20,
        marginVertical: 20,
        backgroundColor: '#0057FF',
        padding: 16,
        borderRadius: 25,
        alignItems: 'center',
    },
    continueText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});