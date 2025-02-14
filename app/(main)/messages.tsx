import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView, StatusBar, View, Pressable, Image, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../components/Themed';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { auth, db } from '../../config/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, Timestamp, doc, getDoc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import NewMessage from '../../components/NewMessage';
import { useIsFocused } from '@react-navigation/native';
import { markMessagesAsRead } from '../../utils/messageUtils';

/**
 * Interface for a message in the chat list
 * Contains essential information for displaying message previews
 */
interface Message {
    id: string;
    sender: string;
    lastMessage: string;
    timestamp: Timestamp;
    unread: boolean;
    avatar: string | null;
}

/**
 * Interface for user profile data
 * Used to display sender information in messages
 */
interface UserData {
    fullName: string;
    profileImageUrl: string | null;
}

/**
 * Interface for chat data stored in Firestore
 * Contains chat metadata and participant information
 */
interface ChatData {
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    unread: boolean;
    participants: string[];
}

/**
 * Component for rendering individual message cards in the chat list
 * Displays sender info, message preview, timestamp, and unread status
 */
const MessageCard = ({ message, onPress }: { message: Message; onPress: () => void }) => {
    const { colors } = useTheme();
    const [imageError, setImageError] = useState(false);

    /**
     * Formats timestamp into human-readable format
     * Shows time for today's messages, relative time for recent messages,
     * and date for older messages
     */
    const formatTime = (timestamp: Timestamp) => {
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <Pressable
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={onPress}
        >
            <Image
                source={
                    message.avatar && !imageError
                        ? { uri: message.avatar }
                        : require('../../assets/images/avatar.png')
                }
                style={styles.avatar}
                onError={() => setImageError(true)}
            />
            <View style={styles.cardContent}>
                <View style={styles.senderTimeContainer}>
                    <Text style={[styles.sender, { color: colors.text }]} numberOfLines={1}>
                        {message.sender}
                    </Text>
                    {message.timestamp && (
                        <Text style={[styles.timestamp, { color: colors.text }]}>
                            {formatTime(message.timestamp)}
                        </Text>
                    )}
                </View>
                <View style={styles.lastMessageContainer}>
                    <Text
                        style={[
                            styles.preview,
                            { color: message.unread ? colors.primary : colors.text }
                        ]}
                        numberOfLines={1}
                    >
                        {message.lastMessage}
                    </Text>
                    {message.unread && (
                        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                </View>
            </View>
        </Pressable>
    );
};

/**
 * Main messages screen component
 * Displays a list of user's conversations with real-time updates
 * Handles message read status and navigation to individual chats
 */
export default function MessagesScreen() {
    const { colors } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showNewMessage, setShowNewMessage] = useState(false);
    const isFocused = useIsFocused();

    /**
     * Closes the new message modal
     */
    const handleModalClose = () => {
        setShowNewMessage(false);
    };

    useEffect(() => {
        if (isFocused) {
            // Mark all messages as read when the screen comes into focus
            markMessagesAsRead();
        }
    }, [isFocused]);

    useEffect(() => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to view messages.');
            router.replace('/login');
            return;
        }

        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('participants', 'array-contains', auth.currentUser.uid),
            orderBy('lastMessageTimestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            try {
                const fetchedMessages: Message[] = [];

                await Promise.all(querySnapshot.docs.map(async (docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
                    const chatData = docSnapshot.data() as ChatData;
                    const otherUserId = chatData.participants.find(
                        (id) => id !== auth.currentUser?.uid
                    );

                    if (otherUserId) {
                        const userDocRef = doc(db, 'users', otherUserId);
                        const userDocSnap = await getDoc(userDocRef);
                        const userData = userDocSnap.data() as UserData | undefined;

                        if (userData) {
                            fetchedMessages.push({
                                id: docSnapshot.id,
                                sender: userData.fullName || 'Unknown User',
                                lastMessage: chatData.lastMessage || '',
                                timestamp: chatData.lastMessageTimestamp,
                                unread: chatData.unread || false,
                                avatar: userData.profileImageUrl,
                            });
                        }
                    }
                }));

                setMessages(fetchedMessages);
                setLoading(false);
            } catch (error) {
                const errorMessage = handleFirebaseError(error);
                Alert.alert('Error', `Failed to fetch messages: ${errorMessage}`);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    /**
     * Handles opening a conversation
     * Marks messages as read and navigates to the chat screen
     */
    const handleConversationOpen = async (conversationId: string) => {
        // Mark messages from this specific conversation as read
        await markMessagesAsRead(conversationId);
        router.push(`/message/${conversationId}`);
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <StatusBar barStyle="light-content" />
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={messages}
                        renderItem={({ item }) => (
                            <MessageCard
                                message={item}
                                onPress={() => handleConversationOpen(item.id)}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
                    />
                </View>
            </SafeAreaView>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowNewMessage(true)}
                style={[styles.fab, { backgroundColor: colors.primary }]}
            >
                <Ionicons name="create" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {showNewMessage && (
                <View style={styles.modalContainer}>
                    <NewMessage onClose={handleModalClose} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        bottom: 120,
        right: 20,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 1000,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 16,
        padding: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    senderTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    sender: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
    },
    lastMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    preview: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});