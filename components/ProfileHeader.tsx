import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, SafeAreaView, Animated, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

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
                    // Extract first name from full name
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

    const navigateToProfile = () => {
        router.push('/profile');
    };

    const navigateToNotifications = () => {
        router.push('/notifications');
    };

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
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <SafeAreaView style={styles.safeArea}>
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
                                {userData.avatar ? (
                                    <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                                ) : (
                                    <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
                                )}
                            </Animated.View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.nameText, { color: colors.text }]}>Hello, {userData.name}!</Text>
                                <Text style={[styles.profileLink, { color: colors.primary }]}>View Profile</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={navigateToNotifications}
                            style={styles.notificationIcon}
                            accessibilityLabel="Notifications"
                            accessibilityHint="Double tap to view notifications"
                        >
                            <Ionicons name="notifications-outline" size={28} color={colors.text} />
                            <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bottomSection}>
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                        <View style={[styles.locationContainer, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="location-outline" size={16} color={colors.primary} style={styles.locationIcon} />
                            <Text style={[styles.locationText, { color: colors.primary }]} numberOfLines={1}>{userData.location}</Text>
                        </View>
                    </View>
                </View>
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
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    safeArea: {
        width: '100%',
    },
    contentWrapper: {
        paddingTop: Platform.OS === 'ios' ? 8 : 16,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    textContainer: {
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    profileLink: {
        fontSize: 13,
        fontWeight: '600',
    },
    notificationIcon: {
        padding: 5,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    bottomSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    separator: {
        height: 1,
        flex: 1,
        marginRight: 15,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    locationIcon: {
        marginRight: 6,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ProfileHeader;