import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, SafeAreaView, StatusBar, View, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import { Text } from '../../components/Themed';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { auth, db } from '../../config/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, DocumentData, doc, updateDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

/**
 * Interface defining the structure of a chat message
 * Contains message content and metadata for display
 */
interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
}

/**
 * Component for rendering individual message bubbles
 * Displays message content with different styles for sent vs received messages
 * Includes timestamp and handles message alignment
 */
const MessageBubble = ({ message, isCurrentUser }: { message: ChatMessage; isCurrentUser: boolean }) => {
    const { colors } = useTheme();

    return (
        <View style={[
            styles.messageContainer,
            // Owner's messages (isCurrentUser) on the left, received messages on the right
            isCurrentUser ? styles.ownerMessageContainer : styles.receivedMessageContainer
        ]}>
            <View style={[
                styles.messageBubble,
                isCurrentUser ?
                    [styles.ownerMessage, { backgroundColor: colors.card }] :
                    [styles.receivedMessage, { backgroundColor: colors.primary }]
            ]}>
                <Text style={[
                    styles.messageContent,
                    { color: isCurrentUser ? colors.text : colors.background }
                ]}>
                    {message.content}
                </Text>
                <Text style={[
                    styles.timestamp,
                    { color: isCurrentUser ? colors.text : colors.background }
                ]}>
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        </View>
    );
};

/**
 * Message detail screen component
 * Provides real-time chat functionality with message history
 * Includes message input, send functionality, and keyboard handling
 */
export default function MessageDetailScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList | null>(null);

    /**
     * Sets up real-time listener for chat messages when component mounts
     * Handles authentication state and message sorting
     * Cleans up listener on unmount
     */
    useEffect(() => {
        if (!auth.currentUser) {
            router.replace('/login');
            return;
        }

        const chatId = Array.isArray(id) ? id[0] : id;
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages: ChatMessage[] = snapshot.docs.map((doc) => {
                const data = doc.data() as DocumentData;
                return {
                    id: doc.id,
                    sender: data.sender,
                    content: data.content,
                    timestamp: data.timestamp?.toDate() || new Date(),
                };
            });
            setMessages(newMessages);
            setLoading(false);
        }, (error) => {
            const errorMessage = handleFirebaseError(error);
            console.error('Error fetching messages:', errorMessage);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    /**
     * Handles sending new messages
     * Updates both messages collection and chat metadata
     * Includes error handling and UI feedback
     */
    const handleSendMessage = async () => {
        if (newMessage.trim() && auth.currentUser) {
            const chatId = Array.isArray(id) ? id[0] : id;
            try {
                // Add the message
                await addDoc(collection(db, 'chats', chatId, 'messages'), {
                    sender: auth.currentUser.uid,
                    content: newMessage.trim(),
                    timestamp: serverTimestamp(),
                });

                // Update chat's last message
                await updateDoc(doc(db, 'chats', chatId), {
                    lastMessage: newMessage.trim(),
                    lastMessageTimestamp: serverTimestamp(),
                });

                setNewMessage('');
                Keyboard.dismiss();
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            } catch (error) {
                const errorMessage = handleFirebaseError(error);
                Alert.alert('Error sending message:', errorMessage);
            }
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <View style={[styles.header, { backgroundColor: colors.card }]}>
                    <Pressable
                        onPress={() => router.push('/(main)/messages')}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Chat</Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    inverted
                    renderItem={({ item }) => (
                        <MessageBubble
                            message={item}
                            isCurrentUser={item.sender === auth.currentUser?.uid}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.chatContainer}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.text}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={1000}
                        />
                        <Pressable
                            style={[
                                styles.sendButton,
                                { backgroundColor: newMessage.trim() ? colors.primary : colors.border }
                            ]}
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Ionicons name="send" size={24} color={colors.background} />
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
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
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    chatContainer: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    ownerMessageContainer: {
        alignSelf: 'flex-start',  // Owner's messages on the left
    },
    receivedMessageContainer: {
        alignSelf: 'flex-end',    // Received messages on the right
    },
    messageBubble: {
        borderRadius: 20,
        padding: 12,
        maxWidth: '100%',
    },
    ownerMessage: {
        borderBottomLeftRadius: 4,
    },
    receivedMessage: {
        borderBottomRightRadius: 4,
    },
    messageContent: {
        fontSize: 16,
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 12,
        alignSelf: 'flex-end',
        opacity: 0.8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
        maxHeight: 120,
        minHeight: 40,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});