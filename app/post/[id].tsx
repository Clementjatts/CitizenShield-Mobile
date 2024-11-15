import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView, StatusBar, View, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { Text } from '../../components/Themed';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { db, auth } from '../../config/firebaseConfig';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, Timestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    userId: string;
    isAdminComment?: boolean;
}

interface Post {
    id: string;
    title: string;
    author: string;
    content: string;
    createdAt: Date;
    state: string;
    locality: string;
    authorId: string;
    likes: number;
    likedBy: string[];
    isAdminPost?: boolean;
    comments: Comment[];
}

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const [post, setPost] = useState<Post | null>(null);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const flatListRef = useRef<FlatList | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserName(userData.fullName || 'Anonymous');
                        setIsAdmin(userData.role === 'admin');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        let unsubscribePost: (() => void) | undefined;
        let unsubscribeComments: (() => void) | undefined;

        const setupSubscriptions = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }

            const subscriptions = subscribeToPost();
            if (subscriptions) {
                unsubscribePost = subscriptions.unsubscribePost;
                unsubscribeComments = subscriptions.unsubscribeComments;
            }
        };

        setupSubscriptions();

        return () => {
            if (unsubscribePost) unsubscribePost();
            if (unsubscribeComments) unsubscribeComments();
        };
    }, [id]);

    const subscribeToPost = () => {
        if (!id || !auth.currentUser) return;

        const postRef = doc(db, 'posts', id as string);
        const commentsRef = collection(postRef, 'comments');
        const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'));

        let unsubscribeComments: (() => void) | undefined;

        const unsubscribePost = onSnapshot(postRef, {
            next: async (postDoc) => {
                try {
                    if (!postDoc.exists()) {
                        setError('Post not found');
                        setLoading(false);
                        return;
                    }

                    const postData = postDoc.data();
                    let authorName = 'Anonymous';
                    let isAdminPost = false;

                    if (postData.authorId) {
                        try {
                            const authorDoc = await getDoc(doc(db, 'users', postData.authorId));
                            if (authorDoc.exists()) {
                                const authorData = authorDoc.data();
                                authorName = authorData.fullName || 'Anonymous';
                                isAdminPost = authorData.role === 'admin';
                            }
                        } catch (error) {
                            console.error('Error fetching author:', error);
                        }
                    }

                    unsubscribeComments = onSnapshot(commentsQuery, {
                        next: async (commentsSnapshot) => {
                            if (!auth.currentUser) return;

                            const commentsWithAuthors = await Promise.all(
                                commentsSnapshot.docs.map(async (commentDoc) => {
                                    const commentData = commentDoc.data();
                                    let commentAuthorName = 'Anonymous';
                                    let isAdminComment = false;

                                    if (commentData.userId) {
                                        try {
                                            const commentUserDoc = await getDoc(doc(db, 'users', commentData.userId));
                                            if (commentUserDoc.exists()) {
                                                const commentUserData = commentUserDoc.data();
                                                commentAuthorName = commentUserData.fullName || 'Anonymous';
                                                isAdminComment = commentUserData.role === 'admin';
                                            }
                                        } catch (error) {
                                            console.error('Error fetching comment author:', error);
                                        }
                                    }

                                    return {
                                        id: commentDoc.id,
                                        author: commentAuthorName,
                                        content: commentData.content,
                                        timestamp: commentData.timestamp?.toDate() || new Date(),
                                        userId: commentData.userId,
                                        isAdminComment
                                    };
                                })
                            );

                            setPost(prevPost => ({
                                ...prevPost!,
                                comments: commentsWithAuthors
                            }));
                        },
                        error: (error) => {
                            if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
                                // Silently handle permission-denied errors
                                return;
                            }
                            console.error('Comments subscription error:', error);
                        }
                    });

                    setPost({
                        id: postDoc.id,
                        title: postData.title || 'Untitled Post',
                        author: authorName,
                        content: postData.content || '',
                        createdAt: postData.createdAt?.toDate() || new Date(),
                        state: postData.state || '',
                        locality: postData.locality || '',
                        authorId: postData.authorId || '',
                        likes: postData.likes || 0,
                        likedBy: postData.likedBy || [],
                        isAdminPost,
                        comments: []
                    });

                    setIsLiked(postData.likedBy?.includes(auth.currentUser?.uid) || false);
                    setLoading(false);
                } catch (error) {
                    const errorMessage = handleFirebaseError(error);
                    setError(errorMessage);
                    setLoading(false);
                }
            },
            error: (error) => {
                if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
                    // Silently handle permission-denied errors
                    return;
                }
                console.error('Post subscription error:', error);
                setError(handleFirebaseError(error));
                setLoading(false);
            }
        });

        return { unsubscribePost, unsubscribeComments };
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !auth.currentUser) {
            return;
        }

        setNewComment(''); // Clear input immediately
        Keyboard.dismiss();

        try {
            const batch = writeBatch(db);

            // Add the comment
            const commentRef = doc(collection(db, 'posts', id as string, 'comments'));
            batch.set(commentRef, {
                author: userName,
                content: newComment.trim(),
                timestamp: serverTimestamp(),
                userId: auth.currentUser.uid
            });

            // Update post's reply count
            const postRef = doc(db, 'posts', id as string);
            batch.update(postRef, {
                replies: increment(1)
            });

            await batch.commit();
        } catch (error) {
            console.error('Error adding comment:', error);
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', `Failed to add comment: ${errorMessage}`);

            // Revert the comment text if the operation failed
            setNewComment(newComment.trim());
        }
    };

    const handleLikePost = async () => {
        if (!post || !auth.currentUser) return;

        try {
            const postRef = doc(db, 'posts', post.id);
            const updatedLikes = isLiked ? post.likes - 1 : post.likes + 1;
            const likeUpdate = isLiked ?
                arrayRemove(auth.currentUser.uid) :
                arrayUnion(auth.currentUser.uid);

            await updateDoc(postRef, {
                likes: updatedLikes,
                likedBy: likeUpdate
            });

            setPost(prevPost => {
                if (!prevPost || !auth.currentUser?.uid) return prevPost;

                return {
                    ...prevPost,
                    likes: updatedLikes,
                    likedBy: isLiked
                        ? prevPost.likedBy.filter(id => id !== auth.currentUser?.uid)
                        : [...prevPost.likedBy, auth.currentUser.uid]
                };
            });

            setIsLiked(!isLiked);
        } catch (error) {
            const errorMessage = handleFirebaseError(error);
            Alert.alert('Error', `Failed to update like: ${errorMessage}`);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderItem = ({ item }: { item: Comment | Post }) => {
        if ('title' in item) {
            return (
                <View style={[styles.postContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.postHeader}>
                        <Text style={[styles.postTitle, { color: colors.text }]}>
                            {item.title}
                        </Text>
                        {item.isAdminPost && (
                            <View style={{
                                backgroundColor: colors.primary,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 12
                            }}>
                                <Text style={{ color: 'white', fontSize: 12 }}>Admin Post</Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.postContent, { color: colors.text }]}>
                        {item.content}
                    </Text>

                    <View style={styles.metadataContainer}>
                        <View style={styles.authorLocationContainer}>
                            <View style={styles.metadataRow}>
                                <Ionicons name="person-outline" size={16} color={colors.text} />
                                <Text style={[styles.authorName, { color: colors.text }]}>
                                    {item.author}
                                </Text>
                            </View>
                            {item.state && item.locality && (
                                <View style={styles.metadataRow}>
                                    <Ionicons name="location-outline" size={16} color={colors.text} />
                                    <Text style={[styles.locationText, { color: colors.text }]}>
                                        {item.state}, {item.locality}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.timestampContainer}>
                            <Ionicons name="time-outline" size={16} color={colors.text} />
                            <Text style={[styles.timestamp, { color: colors.text }]}>
                                {formatDate(item.createdAt)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.interactionBar}>
                        <Pressable
                            style={styles.likeButton}
                            onPress={handleLikePost}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={24}
                                color={isLiked ? colors.primary : colors.text}
                            />
                            <Text style={[styles.likeCount, { color: colors.text }]}>
                                {item.likes} {item.likes === 1 ? 'like' : 'likes'}
                            </Text>
                        </Pressable>
                        <View style={styles.commentCount}>
                            <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
                            <Text style={[styles.commentCountText, { color: colors.text }]}>
                                {item.comments.length} {item.comments.length === 1 ? 'comment' : 'comments'}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={[styles.commentContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.commentHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.commentAuthor, { color: colors.text }]}>
                                {item.author}
                            </Text>
                            {item.isAdminComment && (
                                <View style={{
                                    backgroundColor: colors.primary,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 12,
                                    marginLeft: 8
                                }}>
                                    <Text style={{ color: 'white', fontSize: 12 }}>Admin</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.commentTimestamp, { color: colors.text }]}>
                            {formatDate(item.timestamp)}
                        </Text>
                    </View>
                    <Text style={[styles.commentContent, { color: colors.text }]}>
                        {item.content}
                    </Text>
                </View>
            );
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (error || !post) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.text }]}>
                        {error || 'Failed to load post'}
                    </Text>
                    <Pressable
                        style={[styles.errorButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Pressable
                        onPress={() => router.push('/(main)/forum')}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Post Details</Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={[post, ...post.comments]}
                    renderItem={renderItem}
                    keyExtractor={(item) => ('title' in item ? `post-${item.id}` : `comment-${item.id}`)}
                    contentContainerStyle={styles.listContent}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                            placeholder="Add a comment..."
                            placeholderTextColor={colors.text}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            maxLength={1000}
                        />
                        <Pressable
                            style={[
                                styles.sendButton,
                                { backgroundColor: newComment.trim() ? colors.primary : colors.border }
                            ]}
                            onPress={handleAddComment}
                            disabled={!newComment.trim()}
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
    // Container styles
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },

    // Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },

    // Post styles
    postContainer: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 16,
    },
    postTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 16,
        lineHeight: 28,
    },
    deleteButton: {
        padding: 8,
    },
    deleteIcon: {
        marginLeft: 8,
    },
    postContent: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },

    // Metadata styles
    metadataContainer: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    authorLocationContainer: {
        marginBottom: 12,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    locationText: {
        fontSize: 14,
        marginLeft: 8,
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    timestamp: {
        fontSize: 13,
        marginLeft: 8,
        opacity: 0.8,
    },

    // Interaction bar styles
    interactionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    likeCount: {
        marginLeft: 8,
        fontSize: 14,
    },
    commentCount: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    commentCountText: {
        marginLeft: 8,
        fontSize: 14,
    },

    // Comment styles
    commentContainer: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
    },
    commentTimestamp: {
        fontSize: 12,
        opacity: 0.7,
    },
    commentContent: {
        fontSize: 14,
        lineHeight: 20,
    },

    // Input styles
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

    // Loading and error styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    errorButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    errorButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Divider styles
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 16,
    },

    // Section styles
    commentSection: {
        marginTop: 20,
    },
    commentSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    noComments: {
        textAlign: 'center',
        fontSize: 14,
        opacity: 0.7,
        marginTop: 20,
        marginBottom: 20,
    },

    // Utility styles
    loadingMore: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    scrollToTopButton: {
        position: 'absolute',
        right: 16,
        bottom: 80,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }
});