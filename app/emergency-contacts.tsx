import React, { useState, useCallback, useEffect } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    relationship: string;
    userId: string;
}

export default function EmergencyContactsScreen() {
    const { colors } = useTheme();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContacts = useCallback(async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to view contacts.');
            return;
        }

        setLoading(true);
        try {
            const q = query(collection(db, 'emergencyContacts'), where('userId', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            const fetchedContacts: Contact[] = [];
            querySnapshot.forEach((doc) => {
                fetchedContacts.push({ id: doc.id, ...doc.data() } as Contact);
            });
            setContacts(fetchedContacts);
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const deleteContact = useCallback(async (id: string) => {
        Alert.alert(
            'Delete Contact',
            'Are you sure you want to delete this contact?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'emergencyContacts', id));
                            setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
                        } catch (error: unknown) {
                            const errorMessage = handleFirebaseError(error);
                            Alert.alert('Error', errorMessage);
                        }
                    },
                },
            ]
        );
    }, []);

    const renderContact = useCallback(({ item }: { item: Contact }) => (
        <View style={[styles.contactItem, { backgroundColor: colors.card }]}>
            <View>
                <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.contactInfo, { color: colors.text }]}>+234 {item.phoneNumber}</Text>
                <Text style={[styles.contactInfo, { color: colors.text }]}>{item.relationship}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteContact(item.id)}>
                <Ionicons name="trash-outline" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    ), [colors, deleteContact]);

    const renderHeader = useCallback(() => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Contacts</Text>
        </View>
    ), [colors]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={contacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContainer}
                refreshing={loading}
                onRefresh={fetchContacts}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={colors.text} style={styles.emptyIcon} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No emergency contacts added yet</Text>
                        <Text style={[styles.emptySubText, { color: colors.text }]}>Add contacts who should be notified in case of emergency</Text>
                    </View>
                )}
            />
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/add-new-contact')}
            >
                <Ionicons name="add" size={24} color="white" style={styles.addIcon} />
                <Text style={styles.addButtonText}>Add New Contact</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flexGrow: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 8,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: Platform.OS === 'ios' ? 0 : 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    contactName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    contactInfo: {
        fontSize: 15,
        marginBottom: 4,
        opacity: 0.8,
    },
    addButton: {
        margin: 16,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    addIcon: {
        marginRight: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.7,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});