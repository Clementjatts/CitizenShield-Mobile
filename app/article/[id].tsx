import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Image, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '../../components/Themed';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

interface Article {
    id: string;
    title: string;
    author: string;
    date: string;
    content: string;
    imageUrl?: string;
}

export default function ArticleScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const docRef = doc(db, 'blogPosts', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setArticle({
                        id: docSnap.id,
                        title: data.title || '',
                        author: data.author || 'Anonymous',
                        date: data.date?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString(),
                        content: data.content || '',
                        imageUrl: data.imageUrl || null,
                    });
                } else {
                    setError('Article not found');
                }
            } catch (err) {
                const errorMessage = handleFirebaseError(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (error || !article) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Pressable
                        style={[styles.backButton, { backgroundColor: colors.card }]}
                        onPress={() => router.push('/(main)/blog')}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.text }]}>
                        {error || 'An unknown error occurred'}
                    </Text>
                    <Pressable
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.container}>
                {article.imageUrl ? (
                    <Image source={{ uri: article.imageUrl }} style={styles.image} />
                ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
                        <Ionicons name="newspaper-outline" size={64} color={colors.text} />
                    </View>
                )}
                <Pressable
                    style={[styles.backButton, { backgroundColor: colors.card }]}
                    onPress={() => router.push('/(main)/blog')}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
                    <View style={styles.metaInfo}>
                        <View style={styles.authorInfo}>
                            <Ionicons name="person-outline" size={16} color={colors.text} />
                            <Text style={[styles.metaText, { color: colors.text }]}>{article.author}</Text>
                        </View>
                        <View style={styles.dateInfo}>
                            <Ionicons name="calendar-outline" size={16} color={colors.text} />
                            <Text style={[styles.metaText, { color: colors.text }]}>{article.date}</Text>
                        </View>
                    </View>
                    <Text style={[styles.articleContent, { color: colors.text }]}>{article.content}</Text>
                </View>
            </ScrollView>
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
    image: {
        width: '100%',
        height: 250,
    },
    placeholderImage: {
        width: '100%',
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        padding: 8,
        borderRadius: 20,
        zIndex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 16,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        marginLeft: 5,
    },
    articleContent: {
        fontSize: 16,
        lineHeight: 24,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        padding: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        padding: 16,
    }
});