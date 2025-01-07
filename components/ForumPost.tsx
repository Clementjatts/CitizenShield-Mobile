import React from 'react';
import { StyleSheet, Pressable, View, Platform } from 'react-native';
import { Text } from './Themed';
import { Link } from 'expo-router';
import { ForumPost } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { CommonStyles } from '../constants/Styles';

interface ForumPostProps {
    post: ForumPost;
}

export default function ForumPost({ post }: ForumPostProps) {
    const { colors } = useTheme();

    return (
        <Link href={`/post/${post.id}`} asChild>
            <Pressable>
                <View style={[styles.postContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.postHeader}>
                        <View style={styles.authorInfo}>
                            <Ionicons name="person-circle-outline" size={24} color={colors.text} />
                            <Text style={[styles.author, { color: colors.text }]}>{post.author}</Text>
                        </View>
                        <Text style={[styles.timestamp, { color: colors.text }]}>{post.date}</Text>
                    </View>

                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                        {post.title}
                    </Text>

                    {post.content && (
                        <Text style={[styles.preview, { color: colors.text }]} numberOfLines={2}>
                            {post.content}
                        </Text>
                    )}

                    <View style={styles.postFooter}>
                        <View style={styles.statContainer}>
                            <Ionicons name="chatbubble-outline" size={16} color={colors.text} />
                            <Text style={[styles.statText, { color: colors.text }]}>
                                {post.replies} {post.replies === 1 ? 'reply' : 'replies'}
                            </Text>
                        </View>

                        <View style={styles.statContainer}>
                            <Ionicons name="heart-outline" size={16} color={colors.text} />
                            <Text style={[styles.statText, { color: colors.text }]}>
                                {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    postContainer: {
        padding: 16,
        marginBottom: 12,
        ...CommonStyles.roundedCorners,
        ...CommonStyles.shadow,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    author: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.7,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 22,
    },
    preview: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
        opacity: 0.8,
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 8,
    },
    statContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        fontSize: 12,
        marginLeft: 4,
    },
});