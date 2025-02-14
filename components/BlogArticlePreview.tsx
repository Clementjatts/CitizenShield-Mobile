/**
 * BlogArticlePreview Component
 * Displays a preview card for a blog article with image, title, and snippet
 * Links to the full article when pressed
 */

import React from 'react';
import { StyleSheet, Pressable, View, Image } from 'react-native';
import { Text } from './Themed';
import { Link } from 'expo-router';
import { Article } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { CommonStyles } from '../constants/Styles';

/**
 * Props for the BlogArticlePreview component
 * @interface BlogArticlePreviewProps
 * @property {Article} article - The article data to display in the preview
 */
interface BlogArticlePreviewProps {
    article: Article;
}

/**
 * BlogArticlePreview Component
 * Renders a preview card for a blog article with:
 * - Featured image or placeholder icon
 * - Title (truncated to 2 lines)
 * - Content snippet (truncated to 2 lines)
 * - Metadata (author, date, etc.)
 * 
 * @param {BlogArticlePreviewProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export default function BlogArticlePreview({ article }: BlogArticlePreviewProps) {
    const { colors } = useTheme();

    return (
        <Link href={`/article/${article.id}`} asChild>
            <Pressable>
                <View style={[styles.container, { backgroundColor: colors.card }]}>
                    {/* Article image or placeholder */}
                    {article.imageUrl ? (
                        <Image
                            source={{ uri: article.imageUrl }}
                            style={styles.image}
                        />
                    ) : (
                        <View style={[styles.placeholderContainer, { backgroundColor: colors.border }]}>
                            <Ionicons name="newspaper-outline" size={32} color={colors.text} />
                        </View>
                    )}
                    
                    {/* Article content preview */}
                    <View style={styles.contentContainer}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                            {article.title}
                        </Text>
                        <Text style={[styles.snippet, { color: colors.text }]} numberOfLines={2}>
                            {article.snippet}
                        </Text>
                        
                        {/* Article metadata */}
                        <View style={styles.footer}>
                            <View style={styles.authorContainer}>
                                <Ionicons name="person-outline" size={14} color={colors.text} />
                                <Text style={[styles.author, { color: colors.text }]}>
                                    {article.author}
                                </Text>
                            </View>
                            <View style={styles.dateContainer}>
                                <Ionicons name="calendar-outline" size={14} color={colors.text} />
                                <Text style={[styles.date, { color: colors.text }]}>
                                    {article.date}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 12,
        ...CommonStyles.roundedCorners,
        ...CommonStyles.shadow,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
    },
    placeholderContainer: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        lineHeight: 20,
    },
    snippet: {
        fontSize: 14,
        lineHeight: 18,
        marginBottom: 8,
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    author: {
        fontSize: 12,
        marginLeft: 4,
    },
    date: {
        fontSize: 12,
        marginLeft: 4,
    },
});