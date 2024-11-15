import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Animated, ViewStyle, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

interface SOSButtonProps {
    style?: ViewStyle;
    onActivate: (emergencyType: string, location: { latitude: number; longitude: number }) => void;
    selectedEmergencyType: string | null;
}

const getEmergencyTypeText = (typeId: string): string => {
    const emergencyTypes = {
        '1': 'Personal Safety Threat',
        '2': 'Law Enforcement Assistance',
        '3': 'Medical Emergency',
        '4': 'Fire',
        '5': 'Traffic Accident',
        '6': 'Natural Disaster',
        '7': 'Domestic Violence',
        '8': 'Mental Health Crisis'
    };
    return emergencyTypes[typeId as keyof typeof emergencyTypes] || 'Unknown Emergency';
};

const SOSButton: React.FC<SOSButtonProps> = ({ style, onActivate, selectedEmergencyType }) => {
    const [lastTap, setLastTap] = useState<number | null>(null);
    const scaleAnim = new Animated.Value(1);

    const fetchEmergencyContacts = async (userId: string) => {
        const contacts: string[] = [];
        try {
            const q = query(
                collection(db, 'emergencyContacts'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.phoneNumber) {
                    contacts.push(data.phoneNumber);
                }
            });
        } catch (error) {
            console.error('Error fetching emergency contacts:', error);
            throw new Error('Failed to fetch emergency contacts');
        }
        return contacts;
    };

    const sendEmergencySMS = async (
        emergencyTypeId: string,
        location: { latitude: number; longitude: number }
    ) => {
        if (!auth.currentUser) {
            throw new Error('You must be logged in to use emergency features');
        }

        const contacts = await fetchEmergencyContacts(auth.currentUser.uid);

        if (contacts.length === 0) {
            throw new Error('No emergency contacts found. Please add emergency contacts first.');
        }

        const emergencyTypeText = getEmergencyTypeText(emergencyTypeId);
        const message = `EMERGENCY ALERT: I need immediate assistance!\n\nType: ${emergencyTypeText}\n\nMy current location: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}\n\nThis is an automated emergency alert from CitizenShield.`;

        const isAvailable = await SMS.isAvailableAsync();
        if (!isAvailable) {
            throw new Error('SMS is not available on this device');
        }

        const result = await SMS.sendSMSAsync(contacts, message);
        return { result, contactCount: contacts.length };
    };

    const handlePress = async () => {
        const now = Date.now();
        if (lastTap && now - lastTap < 300) { // Double tap detected
            if (!selectedEmergencyType) {
                Alert.alert('Error', 'Please select an emergency type before activating SOS.');
                return;
            }

            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Location permission is required to send your location.');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});

                // Send SMS and get result
                const { contactCount } = await sendEmergencySMS(
                    selectedEmergencyType,
                    location.coords
                );

                // Call the onActivate callback with emergency type and location
                onActivate(selectedEmergencyType, {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                Alert.alert(
                    'Emergency Alert Activated',
                    `Emergency type: ${getEmergencyTypeText(selectedEmergencyType)}\n\nAlert sent to ${contactCount} emergency contact${contactCount !== 1 ? 's' : ''}.\n\nStay calm, help is on the way.`
                );
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to activate emergency';
                Alert.alert('Error', errorMessage);
            }
        }
        setLastTap(now);
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, style]}
        >
            <Animated.View
                style={[
                    styles.button,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={require('../assets/images/alarm-button.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
});

export default SOSButton;