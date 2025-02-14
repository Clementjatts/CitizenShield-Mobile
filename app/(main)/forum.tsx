import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView, StatusBar, View, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text } from '../../components/Themed';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '../../config/firebaseConfig';
import { collection, query, orderBy, limit, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

/**
 * Interface defining the structure of a forum post
 * Contains all necessary fields for displaying post content and engagement metrics
 */
interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  authorId: string;
  date: string;
  replies: number;
  likes: number;
  likedBy: string[];
}

/**
 * Main forum screen component that displays a list of forum posts
 * Handles real-time updates, authentication checks, and pull-to-refresh functionality
 */
export default function ForumScreen() {
  const { colors } = useTheme();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches forum posts from Firestore with author details and comment counts
   * Requires authentication and handles error states
   * Limits to 20 most recent posts ordered by creation date
   */
  const fetchPosts = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to view the forum.');
      router.replace('/login');
      return;
    }

    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const postsPromises = snapshot.docs.map(async (docSnapshot) => {
        const postData = docSnapshot.data();
        let authorName = 'Anonymous';

        // Fetch author data with error handling
        if (postData.authorId) {
          try {
            const userDocRef = doc(db, 'users', postData.authorId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              authorName = userData.fullName || 'Anonymous';
            }
          } catch (error) {
            console.error('Error fetching author data:', error);
          }
        }

        // Get comments count
        const commentsSnapshot = await getDocs(
          collection(db, 'posts', docSnapshot.id, 'comments')
        );

        return {
          id: docSnapshot.id,
          title: postData.title || 'Untitled Post',
          author: authorName,
          content: postData.content || '',
          authorId: postData.authorId || '',
          date: postData.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          replies: commentsSnapshot.size,
          likes: postData.likes || 0,
          likedBy: postData.likedBy || [],
        };
      });

      const resolvedPosts = await Promise.all(postsPromises);
      setPosts(resolvedPosts);
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      console.error('Error processing posts:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Sets up real-time subscription to forum posts
   * Listens for changes in posts collection and updates UI accordingly
   * Handles authentication state and cleanup on unmount
   */
  useEffect(() => {
    let isSubscribed = true;
    let unsubscribeSnapshot: (() => void) | undefined;

    const setupSubscription = async () => {
      if (!auth.currentUser) {
        Alert.alert('Error', 'You must be logged in to view the forum.');
        router.replace('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
          if (!isSubscribed || !auth.currentUser) return;

          try {
            await fetchPosts();
          } catch (error) {
            if (!isSubscribed) return;
            const errorMessage = handleFirebaseError(error);
            console.error('Error processing posts:', errorMessage);
            setError(errorMessage);
          } finally {
            if (isSubscribed) {
              setLoading(false);
              setRefreshing(false);
            }
          }
        }, (error) => {
          if (!isSubscribed) return;
          if (error.code !== 'permission-denied' || auth.currentUser) {
            const errorMessage = handleFirebaseError(error);
            console.error('Snapshot error:', errorMessage);
            setError(errorMessage);
          }
          setLoading(false);
          setRefreshing(false);
        });
      } catch (error) {
        if (!isSubscribed) return;
        const errorMessage = handleFirebaseError(error);
        console.error('Setup error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        setRefreshing(false);
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  /**
   * Handles pull-to-refresh functionality
   * Triggers a fresh fetch of forum posts when user pulls down to refresh
   */
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  /**
   * Renders an individual forum post card
   * Displays post title, content preview, and handles navigation to full post view
   */
  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 16,
      }}
      onPress={() => router.push({
        pathname: '/post/[id]',
        params: { id: item.id }
      })}
    >
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 24,
        color: colors.text,
      }}>
        {item.title}
      </Text>
      <Text style={{
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
        color: colors.text,
      }} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons name="person-outline" size={14} color={colors.text} />
          <Text style={{
            fontSize: 12,
            marginLeft: 4,
            color: colors.text,
          }}>
            {item.author}
          </Text>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.text} />
            <Text style={{
              fontSize: 12,
              marginLeft: 4,
              color: colors.text,
            }}>
              {item.replies}
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 12,
          }}>
            <Ionicons name="heart" size={14} color={colors.text} />
            <Text style={{
              fontSize: 12,
              marginLeft: 4,
              color: colors.text,
            }}>
              {item.likes}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
      }}>
        <Text style={{
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 20,
          color: colors.text,
        }}>
          {error}
        </Text>
        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: colors.primary,
          }}
          onPress={fetchPosts}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Forum</Text>
        </View>
        <View style={{ flex: 1 }}>
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        </View>
      </SafeAreaView>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/create-post')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});