import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, SafeAreaView, StatusBar, Image, Pressable, Alert } from 'react-native';
import { Text } from '../components/Themed';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { handleFirebaseError } from '../utils/errorHandler';

export default function EditProfileScreen() {
    const { colors } = useTheme();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'No user is currently logged in.');
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setFullName(userData.fullName || '');
                setEmail(userData.email || '');
                setPhoneNumber(userData.phoneNumber || '');
                setProfileImageUri(userData.profileImageUrl || null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', `Failed to fetch user profile: ${errorMessage}`);
        }
    };

    const handleSave = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'No user is currently logged in.');
            return;
        }

        setLoading(true);

        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const updateData: any = { fullName, email, phoneNumber };

            if (profileImageUri) {
                const imageUrl = await uploadProfileImage(profileImageUri);
                updateData.profileImageUrl = imageUrl;
                await updateProfile(auth.currentUser, { photoURL: imageUrl });
            }

            await updateDoc(userRef, updateData);

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfileImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            Alert.alert('Error', `Failed to pick image: ${errorMessage}`);
        }
    };

    const uploadProfileImage = async (uri: string) => {
        if (!auth.currentUser) {
            throw new Error('User is not authenticated');
        }

        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileName = `profileImages/${auth.currentUser.uid}/profile.jpg`;
            const storageRef = ref(storage, fileName);

            const snapshot = await uploadBytes(storageRef, blob);
            console.log('Uploaded profile picture successfully');
            return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <View style={styles.container}>
                <View style={styles.profileImageContainer}>
                    <Image
                        style={styles.profileImage}
                        source={profileImageUri ? { uri: profileImageUri } : require('../assets/images/avatar.png')}
                    />
                    <CustomButton
                        title="Change Photo"
                        onPress={handleChangePhoto}
                        variant="outline"
                        style={styles.changePhotoButton}
                    />
                </View>
                <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="person-outline" size={24} color={colors.text} style={styles.icon} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Full Name"
                        placeholderTextColor={colors.text}
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>
                <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="mail-outline" size={24} color={colors.text} style={styles.icon} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Email"
                        placeholderTextColor={colors.text}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="call-outline" size={24} color={colors.text} style={styles.icon} />
                    <Text style={[styles.phonePrefix, { color: colors.text }]}>+234</Text>
                    <TextInput
                        style={[styles.input, styles.phoneInput, { color: colors.text }]}
                        placeholder="Phone Number"
                        placeholderTextColor={colors.text}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>
                <CustomButton
                    title="Save Changes"
                    onPress={handleSave}
                    style={styles.button}
                    loading={loading}
                    variant="primary"
                />
            </View>
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
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 10,
    },
    changePhotoButton: {
        width: 150,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
    },
    phonePrefix: {
        marginRight: 5,
        fontWeight: 'bold',
    },
    phoneInput: {
        flex: 1,
    },
    button: {
        marginTop: 20,
    },
});