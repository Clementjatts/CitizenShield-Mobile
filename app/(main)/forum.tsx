import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView, StatusBar, View, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text } from '../../components/Themed';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '../../config/firebaseConfig';
import { collection, query, orderBy, limit, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

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

export default function ForumScreen() {
  const { colors } = useTheme();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: ForumPost }) => (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push({
        pathname: '/post/[id]',
        params: { id: item.id }
      })}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.cardMessage, { color: colors.text }]} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.metadataContainer}>
          <View style={styles.authorContainer}>
            <Ionicons name="person-outline" size={14} color={colors.text} />
            <Text style={[styles.metadataText, { color: colors.text }]}>
              {item.author}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {item.replies}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {item.likes}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchPosts}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Forum</Text>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create-post')}
      >
        <Ionicons name="add" size={24} color={colors.background} />
      </Pressable>
    </SafeAreaView>
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
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
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
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});