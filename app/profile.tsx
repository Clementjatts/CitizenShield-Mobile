import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Image, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text } from '../components/Themed';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

interface UserData {
    fullName: string;
    email: string;
    profileImageUrl: string | null;
}

export default function ProfileScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        if (auth.currentUser) {
            try {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);
                }
            } catch (error: unknown) {
                const errorMessage = handleFirebaseError(error);
                Alert.alert('Error', errorMessage);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        Appearance.setColorScheme(darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const handleLogout = async () => {
        try {
            router.replace('/login');
            await signOut(auth);
        } catch (error: unknown) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Logout Failed', errorMessage);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const goBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
            </View>
            <ScrollView style={styles.container}>
                <View style={styles.profileHeader}>
                    {userData?.profileImageUrl ? (
                        <Image
                            style={styles.avatar}
                            source={{ uri: userData.profileImageUrl }}
                        />
                    ) : (
                        <Image
                            style={styles.avatar}
                            source={require('../assets/images/avatar.png')}
                        />
                    )}
                    <Text style={[styles.name, { color: colors.text }]}>{userData?.fullName || 'User'}</Text>
                    <Text style={[styles.email, { color: colors.text }]}>{userData?.email || 'email@example.com'}</Text>
                </View>

                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
                    <CustomButton
                        title="Edit Profile"
                        onPress={() => router.push('/edit-profile')}
                        variant="outline"
                        style={styles.button}
                    />
                    <CustomButton
                        title="Change Password"
                        onPress={() => router.push('/change-password')}
                        variant="outline"
                        style={styles.button}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={pushNotifications ? colors.card : "#f4f3f4"}
                        />
                    </View>
                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                        <Switch
                            value={darkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={darkMode ? colors.card : "#f4f3f4"}
                        />
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
                    <CustomButton
                        title="Privacy Policy"
                        onPress={() => router.push('/privacy-policy')}
                        variant="outline"
                        style={styles.button}
                    />
                    <CustomButton
                        title="Terms of Service"
                        onPress={() => router.push('/terms-of-service')}
                        variant="outline"
                        style={styles.button}
                    />
                    <CustomButton
                        title="Contact Support"
                        onPress={() => router.push('/contact-support')}
                        variant="outline"
                        style={styles.button}
                    />
                </View>

                <CustomButton
                    title="Log Out"
                    onPress={handleLogout}
                    variant="primary"
                    style={styles.logoutButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    container: {
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
    profileHeader: {
        alignItems: 'center',
        padding: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        opacity: 0.7,
    },
    section: {
        margin: 10,
        padding: 15,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    button: {
        marginBottom: 10,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    settingLabel: {
        fontSize: 16,
    },
    logoutButton: {
        marginHorizontal: 10,
        marginTop: 20,
        marginBottom: 30,
    },
});