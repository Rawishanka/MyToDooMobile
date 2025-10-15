import { useGetCategories } from '@/hooks/useTaskApi';
import { useCreateTaskStore } from '@/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const LocationScreen = () => {
    const [isRemoval, setIsRemoval] = useState(true);
    const [pickupCode, setPickupCode] = useState('');
    const [dropoffCode, setDropoffCode] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const { myTask, updateMyTask } = useCreateTaskStore();
    const { data: categoriesResponse, isLoading: loadingCategories, error: categoriesError, refetch: refetchCategories } = useGetCategories();

    console.log('Current Task:', myTask);
    console.log('Categories Response:', categoriesResponse);
    console.log('Categories Error:', categoriesError);

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
            // CategoryTask
            if (!selectedCategory) {
                alert('Please select a category for your task');
                return;
            }
            updateMyTask({
                isRemoval: false,
                category: selectedCategory,
            });
        }
        router.push('/budget-screen');
    };

    const categories = categoriesResponse?.data || [];

    return (
        <View style={styles.container}>
            {/* Back Arrow */}
            <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
                <ChevronLeft size={24} color="#1C1C1E" />
            </TouchableOpacity>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
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
                            <View style={styles.dropdownList}>
                                {categories.map((category, index) => (
                                    <TouchableOpacity
                                        key={category}
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
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Continue */}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </View>
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
    dropdownList: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E1E1E1',
        marginBottom: 10,
        maxHeight: 250,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
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