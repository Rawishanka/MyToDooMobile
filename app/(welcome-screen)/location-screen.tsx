import { useCreateTaskStore } from '@/store/create-task-store';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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
    const [selectedMode, setSelectedMode] = useState<'Online' | 'In Person' | null>(null);
    const [suburb, setSuburb] = useState('');

    const { myTask, updateMyTask } = useCreateTaskStore();
    console.log('Current Task:', myTask);
    // Helper to update zustand store with correct type
    const handleContinue = () => {
        if (isRemoval) {
            // RemovalTask
            updateMyTask({
                ...myTask,
                isRemoval: true,
                pickupLocation: pickupCode,
                deliveryLocation: dropoffCode,
                isOnline: undefined,
                inPerson: undefined,
                suburb: undefined,
            });
        } else if (selectedMode === 'Online') {
            // OnlineTask
            updateMyTask({
                ...myTask,
                isRemoval: false,
                isOnline: true,
                inPerson: false,
                suburb: undefined,
                pickupLocation: undefined,
                deliveryLocation: undefined,
            });
        } else if (selectedMode === 'In Person') {
            // InPersonTask
            updateMyTask({
                ...myTask,
                isRemoval: false,
                isOnline: false,
                inPerson: true,
                suburb: suburb,
                pickupLocation: undefined,
                deliveryLocation: undefined,
            });
        }
        router.push('/budget-screen');
    };

    return (
        <View style={styles.container}>
            {/* Back Arrow */}
            <TouchableOpacity style={styles.backArrow}>
                <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Say where</Text>
            <Text style={styles.subtitle}>Where do you need it done?</Text>

            {/* Toggle */}
            <View style={styles.switchBox}>
                <Text style={styles.switchLabel}>Is this a removal task?</Text>
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
                    {/* Selection cards */}
                    <View style={styles.cardContainer}>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedMode === 'Online' && styles.selectedCard,
                            ]}
                            onPress={() => setSelectedMode('Online')}
                        >
                            <MaterialIcons
                                name="computer"
                                size={20}
                                color={selectedMode === 'Online' ? '#fff' : '#000'}
                                style={styles.icon}
                            />
                            <View>
                                <Text style={[styles.optionTitle, selectedMode === 'Online' && { color: '#fff' }]}>Online</Text>
                                <Text style={[styles.optionSubtitle, selectedMode === 'Online' && { color: '#fff' }]}> 
                                    They can do it from their home
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedMode === 'In Person' && styles.selectedCard,
                            ]}
                            onPress={() => setSelectedMode('In Person')}
                        >
                            <FontAwesome5
                                name="home"
                                size={20}
                                color={selectedMode === 'In Person' ? '#fff' : '#000'}
                                style={styles.icon}
                            />
                            <View>
                                <Text style={[styles.optionTitle, selectedMode === 'In Person' && { color: '#fff' }]}> 
                                    In Person
                                </Text>
                                <Text style={[styles.optionSubtitle, selectedMode === 'In Person' && { color: '#fff' }]}> 
                                    They need to show up at a place
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Suburb */}
                    {selectedMode === 'In Person' && (
                        <>
                            <Text style={styles.label}>Suburb</Text>
                            <View style={styles.inputBox}>
                                <Ionicons name="location-outline" size={20} color="#aaa" style={styles.icon} />
                                <TextInput
                                    placeholder="Enter postal code"
                                    value={suburb}
                                    onChangeText={setSuburb}
                                    style={styles.input}
                                />
                            </View>
                        </>
                    )}

                </>
            )}

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
        padding: 20,
        paddingTop: 50,
    },
    backArrow: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 30,
        color: '#1C1C1E',
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
    cardContainer: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 20,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    selectedCard: {
        backgroundColor: '#0057FF',
        borderColor: '#0057FF',
    },
    optionTitle: {
        fontWeight: '600',
        fontSize: 16,
    },
    optionSubtitle: {
        fontSize: 13,
        color: '#555',
    },
    continueButton: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 40,
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
