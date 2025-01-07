import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, StatusBar } from 'react-native';
import { Text } from '../components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, or } from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';
import { User } from '../types';

interface NewMessageProps {
    onClose?: () => void;
}

const NewMessage: React.FC<NewMessageProps> = ({ onClose }) => {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    const searchUsers = useCallback(async (searchText: string) => {
        if (!searchText.trim() || searchText.length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const searchTerm = searchText.toLowerCase();

            const q = query(usersRef,
                or(
                    where('email', '>=', searchTerm),
                    where('email', '<=', searchTerm + '\uf8ff'),
                    where('fullName', '>=', searchTerm),
                    where('fullName', '<=', searchTerm + '\uf8ff')
                )
            );

            const querySnapshot = await getDocs(q);
            const users = new Map<string, User>();

            querySnapshot.forEach((doc) => {
                if (doc.id === auth.currentUser?.uid) return;

                const userData = doc.data();
                const fullName = userData.fullName?.toLowerCase() || '';
                const email = userData.email?.toLowerCase() || '';

                if (fullName.includes(searchTerm) || email.includes(searchTerm)) {
                    users.set(doc.id, {
                        id: doc.id,
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        profileImageUrl: userData.profileImageUrl || null
                    });
                }
            });

            setSearchResults(Array.from(users.values()));
        } catch (error) {
            console.error('Search error:', error);
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const findExistingChat = async (userId: string): Promise<string | null> => {
        if (!auth.currentUser) return null;

        try {
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('participants', 'array-contains', auth.currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            let existingChatId: string | null = null;

            querySnapshot.forEach((doc) => {
                const chatData = doc.data();
                if (chatData.participants.includes(userId)) {
                    existingChatId = doc.id;
                }
            });

            return existingChatId;
        } catch (error) {
            console.error('Error finding existing chat:', error);
            return null;
        }
    };

    const startConversation = async (user: User) => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to start a conversation.');
            return;
        }

        try {
            setLoading(true);

            // First, check if a chat already exists
            const existingChatId = await findExistingChat(user.id);

            if (existingChatId) {
                // If chat exists, navigate to it
                router.push(`/message/${existingChatId}`);
                return;
            }

            // If no existing chat, create a new one
            const content = "Hello!";
            const chatData = {
                participants: [auth.currentUser.uid, user.id],
                lastMessage: content,
                lastMessageTimestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            };

            const chatRef = await addDoc(collection(db, 'chats'), chatData);

            // Add the first message
            await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
                content,
                sender: auth.currentUser.uid,
                timestamp: serverTimestamp()
            });

            router.push(`/message/${chatRef.id}`);
        } catch (error) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', `Failed to start conversation: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Message</Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="search" size={20} color={colors.text} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search by name or email..."
                    placeholderTextColor={colors.text + '80'}
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        if (searchTimeoutRef.current) {
                            clearTimeout(searchTimeoutRef.current);
                        }
                        searchTimeoutRef.current = setTimeout(() => {
                            searchUsers(text);
                        }, 300);
                    }}
                    autoCapitalize="none"
                />
            </View>

            {loading ? (
                <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.userItem, { backgroundColor: colors.card }]}
                            onPress={() => startConversation(item)}
                        >
                            <Image
                                source={
                                    item.profileImageUrl
                                        ? { uri: item.profileImageUrl }
                                        : require('../assets/images/avatar.png')
                                }
                                style={styles.avatar}
                            />
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.text }]}>{item.fullName}</Text>
                                <Text style={[styles.userEmail, { color: colors.text }]}>{item.email}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            {searchQuery.length > 0
                                ? 'No users found'
                                : 'Type a name or email to search for users'}
                        </Text>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        margin: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        opacity: 0.7,
    },
    loader: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        paddingHorizontal: 32,
    },
});

export default NewMessage;