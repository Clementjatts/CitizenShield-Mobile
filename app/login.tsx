import React, { useState } from 'react';
import { StyleSheet, TextInput, View, SafeAreaView, StatusBar, Alert, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from '../components/Themed';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { auth, db } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (email.trim() === '' || password.trim() === '') {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);

        try {
            // First sign in the user
            await signInWithEmailAndPassword(auth, email, password);

            // After successful sign in, check if user is suspended
            if (auth.currentUser) {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                const userData = userDoc.data();

                if (userData?.suspended) {
                    // Sign out if suspended
                    await signOut(auth);
                    Alert.alert('Account Suspended', 'Your account has been suspended. Please contact support for assistance.');
                    return;
                }

                // If not suspended, proceed to home
                router.replace('/(main)/home');
            }
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Image
                                source={require('../assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
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
                            autoComplete="email"
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
                            autoComplete="password"
                        />
                    </View>
                    <CustomButton
                        title="Login"
                        onPress={handleLogin}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                        variant="primary"
                    />
                    <Link href="/signup" asChild>
                        <CustomButton
                            title="Don't have an account? Sign up"
                            onPress={() => { }}
                            style={styles.linkButton}
                            variant="outline"
                        />
                    </Link>
                    <Link href="/forgot-password" asChild>
                        <CustomButton
                            title="Forgot password?"
                            onPress={() => { }}
                            style={styles.linkButton}
                            variant="secondary"
                        />
                    </Link>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
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
        textAlign: 'center',
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
        fontSize: 16,
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