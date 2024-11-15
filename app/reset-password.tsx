import React, { useState } from 'react';
import { StyleSheet, TextInput, View, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Text } from '../components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { auth } from '../config/firebaseConfig';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { handleFirebaseError } from '../utils/errorHandler';

export default function ResetPasswordScreen() {
    const { colors } = useTheme();
    const { oobCode } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (newPassword.trim() === '' || confirmPassword.trim() === '') {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await verifyPasswordResetCode(auth, oobCode as string);

            await confirmPasswordReset(auth, oobCode as string, newPassword);

            Alert.alert('Success', 'Your password has been reset successfully.');
            router.replace('/login');
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Password Reset Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>Enter your new password</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="lock-closed-outline" size={24} color={colors.text} style={styles.icon} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="New Password"
                        placeholderTextColor={colors.text}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />
                </View>
                <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="lock-closed-outline" size={24} color={colors.text} style={styles.icon} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Confirm New Password"
                        placeholderTextColor={colors.text}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
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
});