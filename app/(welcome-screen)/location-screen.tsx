import { useGetCategories } from '@/hooks/useTaskApi';
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

const LocationScreen = () => {
    const [isRemoval, setIsRemoval] = useState(false);
    const [pickupCode, setPickupCode] = useState('');
    const [dropoffCode, setDropoffCode] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');

    const { myTask, updateMyTask } = useCreateTaskStore();
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
        router.push('/budget-screen');
    };

    const categories = categoriesResponse?.data || [];

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Back Arrow */}
            <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
                <ChevronLeft size={24} color="#1C1C1E" />
            </TouchableOpacity>

            <View style={styles.scrollContent}>
                {/* Title */}
                <Text style={styles.title}>Tell me more!</Text>
                <Text style={styles.subtitle}>Where do you need it done?</Text>

                {/* Toggle */}
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
                        {/* Category Selection */}
                        <Text style={styles.label}>Category</Text>
                        {loadingCategories ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#0057FF" />
                                <Text style={styles.loadingText}>Loading categories from database...</Text>
                            </View>
                        ) : categoriesError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Failed to load categories</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={() => refetchCategories()}>
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
                                    onPress={() => setShowCategoryDropdown(false)}
                                />
                                <View style={[
                                    styles.dropdownContainer,
                                    dropdownPosition === 'above' && styles.dropdownContainerAbove
                                ]}>
                                    <ScrollView 
                                        style={styles.dropdownList}
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                        keyboardShouldPersistTaps="handled"
                                        bounces={false}
                                    >
                                        {categories.map((category, index) => (
                                            <TouchableOpacity
                                                key={`${category}-${index}`}
                                                style={[
                                                    styles.dropdownItem,
                                                    index === categories.length - 1 && { borderBottomWidth: 0 },
                                                    selectedCategory === category && styles.selectedDropdownItem
                                                ]}
                                                onPress={() => {
                                                    setSelectedCategory(category);
                                                    setShowCategoryDropdown(false);
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
                                        ))}
                                        {/* Add a small footer to ensure last item is visible */}
                                        <View style={{ height: 5 }} />
                                    </ScrollView>
                                </View>
                            </>
                        )}

                        {/* Location Search - Always show for category tasks */}
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
                    </>
                )}
            </View>

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
    scrollContent: {
        flex: 1,
        padding: 20,
        paddingTop: 90,
        paddingBottom: 20,
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
        zIndex: 999,
    },
    dropdownContainer: {
        position: 'relative',
        zIndex: 1000,
        marginBottom: 10,
    },
    dropdownContainerAbove: {
        position: 'absolute',
        bottom: 60, // Position above the dropdown trigger
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    dropdownList: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E1E1E1',
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
        minHeight: 50,
    },
    selectedDropdownItem: {
        backgroundColor: '#F0F8FF',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
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
        marginBottom: 40,
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