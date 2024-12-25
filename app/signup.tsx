import React, { useState } from 'react';
import { StyleSheet, TextInput, View, SafeAreaView, StatusBar, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { Text } from '../components/Themed';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { auth, db } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
    const { colors } = useTheme();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (fullName.trim() === '' || email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                fullName,
                email,
                createdAt: new Date(),
            });

            router.replace('/(main)/home');
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Signup Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.container}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Image
                                source={require('../assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                    <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                        <Ionicons name="person-outline" size={24} color={colors.text} style={styles.icon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Full Name"
                            placeholderTextColor={colors.text}
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
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
                    <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                        <Ionicons name="lock-closed-outline" size={24} color={colors.text} style={styles.icon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Password"
                            placeholderTextColor={colors.text}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                    <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                        <Ionicons name="lock-closed-outline" size={24} color={colors.text} style={styles.icon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Confirm Password"
                            placeholderTextColor={colors.text}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>
                    <CustomButton
                        title="Sign Up"
                        onPress={handleSignup}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                        variant="primary"
                    />
                    <Link href="/login" asChild>
                        <CustomButton
                            title="Already have an account? Log in"
                            onPress={() => { }}
                            style={styles.linkButton}
                            variant="outline"
                        />
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoCircle: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 20,
    },
    logo: {
        width: '70%',
        height: '70%',
        maxWidth: '70%',
        maxHeight: '70%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
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
        width: '100%',
        marginTop: 20,
    },
    linkButton: {
        marginTop: 15,
        width: '100%',
    },
});