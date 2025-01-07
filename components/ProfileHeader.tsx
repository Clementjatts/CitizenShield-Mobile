import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, SafeAreaView, Animated, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonStyles } from '../constants/Styles';
import { useScaleAnimation } from '../hooks/useScaleAnimation';

const GRADIENT_COLORS = {
    header: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'] as const,
    avatar: (primary: string) => [`${primary}30`, `${primary}15`] as const,
};

const ProfileHeader: React.FC = () => {
    const { colors } = useTheme();
    const router = useRouter();
    const { scale, handlePressIn, handlePressOut } = useScaleAnimation();
    const notificationScale = useScaleAnimation();
    const addContactsScale = useScaleAnimation();
    const policeContactScale = useScaleAnimation();
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
                    const cityOnly = data.location?.address?.split(',')[0] || 'Location not set';
                    setUserData({
                        name: firstName,
                        avatar: data.profileImageUrl || null,
                        location: cityOnly
                    });
                }
            });
            return () => unsubscribe();
        }
    }, []);

    const navigateToProfile = () => router.push('/profile');
    const navigateToNotifications = () => router.push('/notifications');
    const navigateToEmergencyContacts = () => router.push('/emergency-contacts');
    const navigateToPoliceDatabase = () => router.push('/police-database');

    return (
        <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.95)', '#FFFFFF']}
                    style={styles.contentWrapper}
                >
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.profileTrigger}
                            onPress={navigateToProfile}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                        >
                            <Animated.View style={[styles.avatarContainer, { transform: [{ scale }] }]}>
                                <LinearGradient
                                    colors={[colors.primary + '30', colors.primary + '15']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.avatarGradient}
                                >
                                    <Image 
                                        source={userData.avatar ? { uri: userData.avatar } : require('../assets/images/avatar.png')} 
                                        style={styles.avatar}
                                    />
                                </LinearGradient>
                            </Animated.View>

                            <View style={styles.userInfo}>
                                <Text style={styles.greetingText}>Welcome back</Text>
                                <Text style={styles.userName}>{userData.name}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.topBarActions}>
                            <LinearGradient
                                colors={[colors.primary + '10', colors.primary + '05']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.locationCard}
                            >
                                <View style={styles.locationIcon}>
                                    <Ionicons name="location" size={18} color={colors.primary} />
                                </View>
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {userData.location}
                                </Text>
                            </LinearGradient>

                            <TouchableOpacity
                                onPress={navigateToNotifications}
                                onPressIn={notificationScale.handlePressIn}
                                onPressOut={notificationScale.handlePressOut}
                                style={styles.notificationButton}
                            >
                                <Animated.View style={[styles.notificationContent, { transform: [{ scale: notificationScale.scale }] }]}>
                                    <LinearGradient
                                        colors={[colors.primary + '15', colors.primary + '05']}
                                        style={styles.notificationGradient}
                                    >
                                        <Ionicons name="notifications" size={22} color={colors.primary} />
                                    </LinearGradient>
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Cards */}
                    <View style={styles.actionCards}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={navigateToEmergencyContacts}
                            onPressIn={addContactsScale.handlePressIn}
                            onPressOut={addContactsScale.handlePressOut}
                        >
                            <Animated.View style={[styles.actionCardContent, { transform: [{ scale: addContactsScale.scale }] }]}>
                                <LinearGradient
                                    colors={[colors.primary + '15', colors.primary + '05']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.actionCardGradient}
                                >
                                    <View style={styles.actionIconBox}>
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                                            style={styles.actionIconGradient}
                                        >
                                            <Ionicons name="person-add" size={22} color={colors.primary} />
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.actionTextContainer}>
                                        <Text style={styles.actionTitle}>Emergency Contacts</Text>
                                        <Text style={styles.actionSubtitle}>Manage your emergency contacts</Text>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={navigateToPoliceDatabase}
                            onPressIn={policeContactScale.handlePressIn}
                            onPressOut={policeContactScale.handlePressOut}
                        >
                            <Animated.View style={[styles.actionCardContent, { transform: [{ scale: policeContactScale.scale }] }]}>
                                <LinearGradient
                                    colors={[colors.primary + '15', colors.primary + '05']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.actionCardGradient}
                                >
                                    <View style={styles.actionIconBox}>
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                                            style={styles.actionIconGradient}
                                        >
                                            <Ionicons name="shield" size={22} color={colors.primary} />
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.actionTextContainer}>
                                        <Text style={styles.actionTitle}>Police Database</Text>
                                        <Text style={styles.actionSubtitle}>Access law enforcement contacts</Text>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>
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
    safeArea: {
        width: '100%',
    },
    contentWrapper: {
        paddingTop: Platform.OS === 'ios' ? 12 : 20,
        paddingBottom: 16,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    profileTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 8,
        paddingRight: 16,
        borderRadius: 16,
        flex: 0.4,
        marginRight: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatarGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
    },
    greetingText: {
        fontSize: 12,
        color: 'rgba(0,0,0,0.5)',
        marginBottom: 2,
        fontWeight: '500',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        letterSpacing: -0.3,
    },
    topBarActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 0.6,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 14,
        flex: 1,
    },
    locationIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#000',
        flex: 1,
    },
    notificationButton: {
        borderRadius: 14,
    },
    notificationContent: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    notificationGradient: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    actionCards: {
        paddingHorizontal: 16,
        gap: 8,
    },
    actionCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionCardContent: {
        width: '100%',
    },
    actionCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    actionIconBox: {
        marginRight: 16,
    },
    actionIconGradient: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: 'rgba(0,0,0,0.5)',
        fontWeight: '500',
    },
});

export default ProfileHeader;