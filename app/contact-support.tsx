import React, { useState } from 'react';
import { StyleSheet, TextInput, View, SafeAreaView, StatusBar, Pressable, Alert, Modal, FlatList } from 'react-native';
import { Text } from '../components/Themed';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { router } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

const SUPPORT_SUBJECTS = [
    'Account Issues',
    'App Functionality',
    'Billing Problems',
    'Feature Request',
    'Other'
];

export default function ContactSupportScreen() {
    const { colors } = useTheme();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const handleSubmit = async () => {
        if (!subject || !message.trim()) {
            Alert.alert('Error', 'Please select a subject and enter your message');
            return;
        }
        setLoading(true);

        try {
            if (!auth.currentUser) {
                throw new Error('You must be logged in to submit a support request');
            }

            const supportRequest = {
                userId: auth.currentUser.uid,
                subject: subject,
                message: message,
                timestamp: new Date(),
                status: 'Open'
            };

            await addDoc(collection(db, 'supportRequests'), supportRequest);

            Alert.alert('Success', 'Your message has been sent to our support team');
            router.back();
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderSubjectItem = ({ item }: { item: string }) => (
        <Pressable
            style={[styles.subjectItem, { borderBottomColor: colors.border }]}
            onPress={() => {
                setSubject(item);
                setModalVisible(false);
            }}
        >
            <Text style={{ color: colors.text }}>{item}</Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Contact Support</Text>
            </View>
            <View style={styles.container}>
                <Pressable
                    style={[styles.subjectSelector, { backgroundColor: colors.card }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={{ color: subject ? colors.text : colors.border }}>
                        {subject || 'Select a subject'}
                    </Text>
                    <Ionicons name="chevron-down" size={24} color={colors.text} />
                </Pressable>
                <TextInput
                    style={[styles.messageInput, { color: colors.text, backgroundColor: colors.card }]}
                    placeholder="Enter your message here"
                    placeholderTextColor={colors.text}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                />
                <CustomButton
                    title="Submit"
                    onPress={handleSubmit}
                    style={styles.button}
                    loading={loading}
                    disabled={loading || !subject || !message.trim()}
                    variant="primary"
                />
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select a Subject</Text>
                        <FlatList
                            data={SUPPORT_SUBJECTS}
                            renderItem={renderSubjectItem}
                            keyExtractor={(item) => item}
                        />
                        <CustomButton
                            title="Cancel"
                            onPress={() => setModalVisible(false)}
                            variant="outline"
                            style={styles.cancelButton}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    subjectSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    messageInput: {
        height: 150,
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    button: {
        marginTop: 20,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        maxHeight: '80%',
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subjectItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    cancelButton: {
        marginTop: 20,
    },
});