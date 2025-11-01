import { useGetCategories, useGetCategoriesByLocation } from '@/hooks/useTaskApi';
import { useCreateTaskStore } from '@/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LocationAutocomplete } from '../../components/LocationAutocomplete';

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
    const hasErrorCategories = !isRemoval && categoriesError;

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
        router.push('/budget-screen');
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
                <View style={styles.switchBox}>
                    <Text style={styles.switchLabel}>Hey! are you moving?</Text>
                    <Switch value={isRemoval} onValueChange={setIsRemoval} />
                </View>

                {/* Conditional content */}
                {isRemoval ? (
                    <>
                        {/* Pickup */}
                        <Text style={styles.label}>Pickup Location</Text>
                        <View style={styles.inputBox}>
                            <Ionicons name="location-outline" size={20} color="#aaa" style={styles.icon} />
                            <TextInput
                                placeholder="Enter postal code"
                                value={pickupCode}
                                onChangeText={setPickupCode}
                                style={styles.input}
                            />
                        </View>

                        {/* Drop-off */}
                        <Text style={styles.label}>Drop-off Location</Text>
                        <View style={styles.inputBox}>
                            <Ionicons name="location-outline" size={20} color="#aaa" style={styles.icon} />
                            <TextInput
                                placeholder="Enter postal code"
                                value={dropoffCode}
                                onChangeText={setDropoffCode}
                                style={styles.input}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        {/* Location Type Selection: In Person / Online / Both */}
                        <Text style={styles.sectionTitle}>Say where</Text>
                        <Text style={styles.sectionSubtitle}>Where do you need it done?</Text>
                        
                        <View style={styles.locationTypeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.locationTypeOption,
                                    locationType === 'In-person' && styles.locationTypeOptionSelected
                                ]}
                                onPress={() => {
                                    setLocationType('In-person');
                                    setSelectedCategory(null); // Reset category when changing location type
                                }}
                            >
                                <View style={styles.locationIcon}>
                                    <Ionicons 
                                        name="person-outline" 
                                        size={28} 
                                        color={locationType === 'In-person' ? '#fff' : '#2c3e50'} 
                                    />
                                </View>
                                <Text style={[
                                    styles.locationTypeTitle,
                                    locationType === 'In-person' && styles.locationTypeTitleSelected
                                ]}>
                                    In Person
                                </Text>
                                <Text style={[
                                    styles.locationTypeDescription,
                                    locationType === 'In-person' && styles.locationTypeDescriptionSelected
                                ]}>
                                    They need to show up at a place
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.locationTypeOption,
                                    locationType === 'Online' && styles.locationTypeOptionSelected
                                ]}
                                onPress={() => {
                                    setLocationType('Online');
                                    setSelectedCategory(null); // Reset category when changing location type
                                    setSelectedLocation(null); // Clear location for online tasks
                                }}
                            >
                                <View style={styles.locationIcon}>
                                    <Ionicons 
                                        name="laptop-outline" 
                                        size={28} 
                                        color={locationType === 'Online' ? '#fff' : '#2c3e50'} 
                                    />
                                </View>
                                <Text style={[
                                    styles.locationTypeTitle,
                                    locationType === 'Online' && styles.locationTypeTitleSelected
                                ]}>
                                    Online
                                </Text>
                                <Text style={[
                                    styles.locationTypeDescription,
                                    locationType === 'Online' && styles.locationTypeDescriptionSelected
                                ]}>
                                    They can do it from their home
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.locationTypeBothOption,
                                locationType === 'Both' && styles.locationTypeBothOptionSelected
                            ]}
                            onPress={() => {
                                setLocationType('Both');
                                setSelectedCategory(null); // Reset category when changing location type
                            }}
                        >
                            <Text style={[
                                styles.locationTypeBothText,
                                locationType === 'Both' && styles.locationTypeBothTextSelected
                            ]}>
                                Both (In Person & Online)
                            </Text>
                        </TouchableOpacity>

                        {/* Category Selection */}
                        <Text style={styles.label}>Category</Text>
                        {isLoadingCategories ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#0057FF" />
                                <Text style={styles.loadingText}>Loading categories from database...</Text>
                            </View>
                        ) : hasErrorCategories ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Failed to load categories</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={() => refetchCategoriesByLocation()}>
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={handleDropdownToggle}
                            >
                                <Text style={[
                                    styles.dropdownText,
                                    !selectedCategory && styles.placeholderText
                                ]}>
                                    {selectedCategory || 'Select a category'}
                                </Text>
                                <ChevronDown 
                                    size={20} 
                                    color="#666" 
                                    style={{
                                        transform: [{ rotate: showCategoryDropdown ? '180deg' : '0deg' }]
                                    }}
                                />
                            </TouchableOpacity>
                        )}

                        {/* Category Dropdown */}
                        {showCategoryDropdown && (
                            <>
                                {/* Overlay to close dropdown when tapping outside */}
                                <TouchableOpacity 
                                    style={styles.dropdownOverlay}
                                    activeOpacity={1}
                                    onPress={() => {
                                        setShowCategoryDropdown(false);
                                        setCategorySearchQuery('');
                                    }}
                                />
                                <View style={[
                                    styles.dropdownContainer,
                                    dropdownPosition === 'above' && styles.dropdownContainerAbove
                                ]}>
                                    {/* Search Input */}
                                    <View style={styles.categorySearchContainer}>
                                        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
                                        <TextInput
                                            style={styles.categorySearchInput}
                                            placeholder="Search categories..."
                                            placeholderTextColor="#999"
                                            value={categorySearchQuery}
                                            onChangeText={setCategorySearchQuery}
                                            autoFocus={false}
                                        />
                                        {categorySearchQuery.length > 0 && (
                                            <TouchableOpacity 
                                                onPress={() => setCategorySearchQuery('')}
                                                style={styles.clearSearchButton}
                                            >
                                                <Ionicons name="close-circle" size={18} color="#999" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    
                                    <ScrollView 
                                        style={styles.dropdownList}
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                        keyboardShouldPersistTaps="handled"
                                        bounces={false}
                                    >
                                        {categories.length === 0 ? (
                                            <View style={styles.noResultsContainer}>
                                                <Text style={styles.noResultsText}>No categories found</Text>
                                            </View>
                                        ) : (
                                            categories.map((category, index) => (
                                                <TouchableOpacity
                                                    key={`${category}-${index}`}
                                                    style={[
                                                        styles.dropdownItem,
                                                        index === categories.length - 1 && { borderBottomWidth: 0 },
                                                        selectedCategory === category && styles.selectedDropdownItem
                                                    ]}
                                                    onPress={() => {
                                                        // Find the full category object to get its locationType
                                                        const categoryObj = fullCategories.find((cat: Category) => cat.name === category);
                                                        
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
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.dropdownItemText,
                                                        selectedCategory === category && styles.selectedDropdownItemText
                                                    ]}>
                                                        {category}
                                                    </Text>
                                                    {selectedCategory === category && (
                                                        <Ionicons name="checkmark" size={20} color="#0057FF" />
                                                    )}
                                                </TouchableOpacity>
                                            ))
                                        )}
                                        {/* Add a small footer to ensure last item is visible */}
                                        <View style={{ height: 5 }} />
                                    </ScrollView>
                                </View>
                            </>
                        )}

                        {/* Location Search - Only show for In Person tasks AND when category dropdown is closed */}
                        {locationType === 'In-person' && !showCategoryDropdown && (
                            <>
                                <Text style={styles.label}>Location</Text>
                                <LocationAutocomplete
                                    onSelect={handleLocationSelect}
                                    placeholder="Search for suburb, city or address..."
                                    style={styles.locationAutocomplete}
                                />
                                {selectedLocation && (
                                    <View style={styles.selectedLocationContainer}>
                                        <Ionicons name="location" size={16} color="#0057FF" />
                                        <Text style={styles.selectedLocationText}>
                                            {selectedLocation.address}
                                        </Text>
                                    </View>
                                )}
                            </>
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
    switchBox: {
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        marginTop: 10,
    },
    inputBox: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        height: 45,
        marginBottom: 10,
    },
    icon: {
        marginRight: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        marginBottom: 10,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFE6E6',
        borderRadius: 8,
        padding: 16,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 14,
        color: '#D32F2F',
        flex: 1,
    },
    retryButton: {
        backgroundColor: '#D32F2F',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    retryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        padding: 16,
        marginBottom: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: '#000',
    },
    placeholderText: {
        color: '#aaa',
    },
    dropdownOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 998,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    dropdownContainer: {
        position: 'relative',
        zIndex: 999,
        marginBottom: 10,
        marginTop: -10,
    },
    dropdownContainerAbove: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 999,
        marginBottom: 0,
        marginTop: 0,
    },
    dropdownList: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E1E1E1',
        maxHeight: 250,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    categorySearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    categorySearchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        paddingVertical: 6,
    },
    clearSearchButton: {
        padding: 4,
    },
    noResultsContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        minHeight: 54,
        backgroundColor: '#fff',
    },
    selectedDropdownItem: {
        backgroundColor: '#F0F8FF',
        borderLeftWidth: 3,
        borderLeftColor: '#0057FF',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    selectedDropdownItemText: {
        color: '#0057FF',
        fontWeight: '600',
    },
    locationAutocomplete: {
        marginBottom: 10,
    },
    selectedLocationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    selectedLocationText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#0057FF',
        flex: 1,
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
    // Location Type Styles
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginTop: 4,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    locationTypeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    locationTypeOption: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 110,
        borderWidth: 2,
        borderColor: '#f8f9fa',
    },
    locationTypeOptionSelected: {
        backgroundColor: '#0057FF',
        borderColor: '#0057FF',
    },
    locationIcon: {
        marginBottom: 8,
    },
    locationTypeTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 6,
        textAlign: 'center',
    },
    locationTypeTitleSelected: {
        color: '#fff',
    },
    locationTypeDescription: {
        fontSize: 11,
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: 14,
        paddingHorizontal: 4,
    },
    locationTypeDescriptionSelected: {
        color: '#e0e0e0',
    },
    locationTypeBothOption: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#f8f9fa',
    },
    locationTypeBothOptionSelected: {
        backgroundColor: '#0057FF',
        borderColor: '#0057FF',
    },
    locationTypeBothText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    locationTypeBothTextSelected: {
        color: '#fff',
    },
});