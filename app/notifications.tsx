import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, RefreshControl } from 'react-native';
import { Text } from '../components/Themed';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, Timestamp, or } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';
import NotificationItem from '../components/NotificationItem';

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Timestamp;
    targetUserId?: string;
    read: boolean;
}

const NotificationsScreen = () => {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to view notifications.');
            router.replace('/login');
            return;
        }

        const notificationsRef = collection(db, 'notifications');
        // Query that will work with existing index
        const q = query(
            notificationsRef,
            orderBy('timestamp', 'desc')
        );

        return onSnapshot(
            q,
            (querySnapshot) => {
                try {
                    const notificationsList: Notification[] = [];
                    querySnapshot.forEach((doc) => {
                        const notificationData = doc.data();
                        // Filter notifications client-side to include:
                        // 1. Notifications with no targetUserId (general)
                        // 2. Notifications targeted to the current user
                        if (!notificationData.targetUserId ||
                            notificationData.targetUserId === auth.currentUser?.uid) {
                            notificationsList.push({
                                id: doc.id,
                                ...notificationData,
                            } as Notification);
                        }
                    });
                    setNotifications(notificationsList);
                } catch (error) {
                    const errorMessage = handleFirebaseError(error);
                    Alert.alert('Error', `Failed to load notifications: ${errorMessage}`);
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            (error) => {
                const errorMessage = handleFirebaseError(error);
                Alert.alert('Error', `Failed to load notifications: ${errorMessage}`);
                setLoading(false);
                setRefreshing(false);
            }
        );
    };

    useEffect(() => {
        const unsubscribe = fetchNotifications();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <NotificationItem
            title={item.title}
            message={item.message}
            timestamp={item.timestamp.toDate().toISOString()}
            isGeneral={!item.targetUserId}
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="notifications-outline"
                            size={48}
                            color={colors.text}
                            style={styles.emptyIcon}
                        />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            No notifications yet
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.7,
    },
});

export default NotificationsScreen;