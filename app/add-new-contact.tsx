import React, { useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

const relationshipOptions = ['Mother', 'Father', 'Husband', 'Wife', 'Sibling', 'Other'];

export default function AddNewContactScreen() {
    const { colors } = useTheme();
    const [newContact, setNewContact] = useState({
        name: '',
        phoneNumber: '',
        relationship: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (newContact.name && newContact.phoneNumber && newContact.relationship) {
            setLoading(true);
            try {
                if (!auth.currentUser) {
                    throw new Error('You must be logged in to add a contact.');
                }

                const contactData = {
                    ...newContact,
                    userId: auth.currentUser.uid,
                    createdAt: new Date()
                };

                await addDoc(collection(db, 'emergencyContacts'), contactData);

                Alert.alert('Success', 'Contact saved successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } catch (error: unknown) {
                const errorMessage = handleFirebaseError(error);
                Alert.alert('Error', errorMessage);
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Invalid Input', 'Please fill all fields');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Contact</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                                placeholder="Enter full name"
                                placeholderTextColor={colors.text + '80'}
                                value={newContact.name}
                                onChangeText={(text) => setNewContact(prev => ({ ...prev, name: text }))}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
                            <View style={styles.phoneInputWrapper}>
                                <View style={[styles.countryCodeContainer, { backgroundColor: colors.border }]}>
                                    <Text style={[styles.countryCode, { color: colors.text }]}>+234</Text>
                                </View>
                                <TextInput
                                    style={[styles.phoneInput, { color: colors.text, backgroundColor: colors.card }]}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={colors.text + '80'}
                                    value={newContact.phoneNumber}
                                    onChangeText={(text) => setNewContact(prev => ({ ...prev, phoneNumber: text }))}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Relationship</Text>
                            <View style={styles.relationshipOptions}>
                                {relationshipOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.relationshipOption,
                                            { borderColor: colors.border },
                                            newContact.relationship === option && { backgroundColor: colors.primary, borderColor: colors.primary },
                                        ]}
                                        onPress={() => setNewContact(prev => ({ ...prev, relationship: option }))}
                                    >
                                        <Text
                                            style={[
                                                styles.relationshipOptionText,
                                                { color: newContact.relationship === option ? 'white' : colors.text },
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.primary }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Saving...' : 'Save Contact'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    form: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryCodeContainer: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    countryCode: {
        fontSize: 16,
        fontWeight: '600',
    },
    phoneInput: {
        flex: 1,
        height: 50,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    relationshipOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    relationshipOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    relationshipOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});