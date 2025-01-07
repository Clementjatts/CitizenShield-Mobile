import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, SafeAreaView, Animated, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const ProfileHeader: React.FC = () => {
    const { colors } = useTheme();
    const router = useRouter();
    const avatarScale = useRef(new Animated.Value(1)).current;
    const [userData, setUserData] = useState({
        name: '',
        avatar: null,
        location: ''
    });

    useEffect(() => {
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    const firstName = data.fullName?.split(' ')[0] || 'User';
                    setUserData({
                        name: firstName,
                        avatar: data.profileImageUrl || null,
                        location: data.location?.address || 'Location not set'
                    });
                }
            });
            return () => unsubscribe();
        }
    }, []);

    const navigateToProfile = () => router.push('/profile');
    const navigateToNotifications = () => router.push('/notifications');

    const handlePressIn = () => {
        Animated.spring(avatarScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(avatarScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
                    style={styles.gradient}
                >
                    <View style={styles.contentWrapper}>
                        <View style={styles.topSection}>
                            <TouchableOpacity
                                style={styles.profileSection}
                                onPress={navigateToProfile}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                accessibilityLabel={`${userData.name}'s profile`}
                                accessibilityHint="Double tap to view your profile"
                            >
                                <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}>
                                    <LinearGradient
                                        colors={[colors.primary + '20', colors.primary + '10']}
                                        style={styles.avatarGradient}
                                    >
                                        {userData.avatar ? (
                                            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                                        ) : (
                                            <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
                                        )}
                                    </LinearGradient>
                                </Animated.View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.greetingText, { color: colors.text + '80' }]}>Welcome back,</Text>
                                    <Text style={[styles.nameText, { color: colors.text }]}>{userData.name}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.rightSection}>
                                <TouchableOpacity
                                    onPress={navigateToNotifications}
                                    style={styles.notificationButton}
                                >
                                    <BlurView intensity={80} tint="light" style={styles.notificationBlur}>
                                        <Ionicons name="notifications-outline" size={22} color={colors.text} />
                                        <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]} />
                                    </BlurView>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.bottomSection}>
                            <TouchableOpacity style={[styles.locationContainer, { backgroundColor: colors.primary + '08' }]}>
                                <Ionicons name="location-outline" size={16} color={colors.primary} style={styles.locationIcon} />
                                <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                                    {userData.location}
                                </Text>
                                <View style={styles.locationDot} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    gradient: {
        width: '100%',
        height: '100%',
    },
    safeArea: {
        width: '100%',
    },
    contentWrapper: {
        paddingTop: Platform.OS === 'ios' ? 12 : 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 15,
    },
    avatarGradient: {
        padding: 2,
        borderRadius: 30,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    textContainer: {
        justifyContent: 'center',
    },
    greetingText: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    nameText: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        marginLeft: 8,
    },
    notificationBlur: {
        padding: 10,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    bottomSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        maxWidth: '80%',
    },
    locationIcon: {
        marginRight: 6,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    locationDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#00000020',
        marginLeft: 8,
    },
});

export default ProfileHeader;