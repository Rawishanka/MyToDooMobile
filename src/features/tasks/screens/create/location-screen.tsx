import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
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

const LocationScreen = () => {
    const [isRemoval, setIsRemoval] = useState(false);
    const [pickupCode, setPickupCode] = useState('');
    const [dropoffCode, setDropoffCode] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const scrollViewRef = React.useRef<ScrollView>(null);

    const { myTask, updateMyTask } = useCreateTaskStore();
    
    // Fetch regular categories
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
    // Location handler
    const handleLocationSelect = (location: LocationData) => {
        setSelectedLocation(location);
        console.log('Selected location:', location);
    };

    // Handle category selection
    const handleCategorySelect = (category: string, categoryObj?: Category) => {
        console.log('Selected category:', category);
        console.log('Selected category object:', categoryObj);
        

        
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
            // CategoryTask - Both category and location are mandatory
            if (!selectedCategory) {
                alert('Please select a category for your task');
                return;
            }
            if (!selectedLocation) {
                alert('Please select a location for your task');
                return;
            }
            updateMyTask({
                isRemoval: false,
                category: selectedCategory,
                location: selectedLocation.address,
                coordinates: selectedLocation.coordinates,
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
                ref={scrollViewRef}
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
                            onRetry={refetchCategories}
                            onCloseDropdown={() => {
                                setShowCategoryDropdown(false);
                                setCategorySearchQuery('');
                            }}
                        />

                        {/* Location Search - Always show when category dropdown is closed */}
                        {!showCategoryDropdown && (
                            <LocationInputSection
                                selectedLocation={selectedLocation}
                                onLocationSelect={handleLocationSelect}
                                scrollViewRef={scrollViewRef}
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