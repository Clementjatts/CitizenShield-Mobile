import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView, StatusBar, View, Image, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from '../../components/Themed';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db } from '../../config/firebaseConfig';
import { collection, query, orderBy, where, getDocs, DocumentData } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

/**
 * Interface defining the structure of a blog post
 * Contains all necessary fields for displaying blog content
 */
interface BlogPost {
    id: string;
    title: string;
    author: string;
    date: string;
    snippet: string;
    content: string;
    imageUrl?: string;
    published: boolean;
}

/**
 * Main blog screen component that displays a list of published blog posts
 * Handles loading states, error states, and pull-to-refresh functionality
 */
export default function BlogScreen() {
    const { colors } = useTheme();
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches published blog posts from Firestore
     * Orders posts by date in descending order and filters for published posts only
     * Transforms Firestore data into BlogPost format
     */
    const fetchBlogPosts = async () => {
        try {
            const blogPostsRef = collection(db, 'blogPosts');
            const q = query(
                blogPostsRef,
                where('published', '==', true),
                orderBy('date', 'desc')
            );
            const querySnapshot = await getDocs(q);

            const posts: BlogPost[] = querySnapshot.docs.map(doc => {
                const data = doc.data() as DocumentData;
                return {
                    id: doc.id,
                    title: data.title || '',
                    author: data.author || 'Anonymous',
                    date: data.date?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString(),
                    snippet: data.snippet || '',
                    content: data.content || '',
                    imageUrl: data.imageUrl || null,
                    published: data.published || false
                };
            });

            setBlogPosts(posts);
        } catch (err) {
            const errorMessage = handleFirebaseError(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    /**
     * Handles pull-to-refresh functionality
     * Triggers a fresh fetch of blog posts when user pulls down to refresh
     */
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchBlogPosts();
    }, []);

    /**
     * Renders an individual blog post card
     * Displays post image (or placeholder), title, snippet, author, and date
     * Handles navigation to full article view when pressed
     */
    const renderBlogPost = ({ item }: { item: BlogPost }) => (
        <Pressable
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push({
                pathname: '/article/[id]',
                params: { id: item.id }
            })}
        >
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            ) : (
                <View style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
                    <Ionicons name="newspaper-outline" size={40} color={colors.text} />
                </View>
            )}
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardSnippet, { color: colors.text }]} numberOfLines={2}>
                    {item.snippet}
                </Text>
                <View style={styles.cardFooter}>
                    <View style={styles.authorDateContainer}>
                        <Ionicons name="person-outline" size={14} color={colors.text} />
                        <Text style={[styles.cardAuthor, { color: colors.text }]}>{item.author}</Text>
                        <Ionicons name="calendar-outline" size={14} color={colors.text} />
                        <Text style={[styles.cardDate, { color: colors.text }]}>{item.date}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                </View>
            </View>
        </Pressable>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <StatusBar barStyle="light-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <StatusBar barStyle="light-content" />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchBlogPosts}>
                        <Text style={[styles.retryButtonText, { color: colors.primary }]}>Retry</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Blog</Text>
            </View>
            <FlatList
                data={blogPosts}
                renderItem={renderBlogPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]} // Android
                        tintColor={colors.primary} // iOS
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
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
    retryButton: {
        padding: 10,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
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
    card: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImage: {
        height: 200,
        width: '100%',
    },
    placeholderImage: {
        height: 200,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardSnippet: {
        fontSize: 14,
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardAuthor: {
        fontSize: 12,
        marginLeft: 4,
        marginRight: 8,
    },
    cardDate: {
        fontSize: 12,
        marginLeft: 4,
    },
});