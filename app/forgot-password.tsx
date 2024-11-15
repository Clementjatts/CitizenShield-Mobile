import React, { useState } from 'react';
import { StyleSheet, TextInput, View, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Text } from '../components/Themed';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { auth } from '../config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { handleFirebaseError } from '../utils/errorHandler';

export default function ForgotPasswordScreen() {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (email.trim() === '') {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
            router.back();
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>Enter your email to reset your password</Text>
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
                <CustomButton
                    title="Reset Password"
                    onPress={handleResetPassword}
                    style={styles.button}
                    loading={loading}
                    disabled={loading}
                    variant="primary"
                />
                <Link href="/login" asChild>
                    <CustomButton
                        title="Back to Login"
                        onPress={() => { }}
                        style={styles.linkButton}
                        variant="outline"
                    />
                </Link>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
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