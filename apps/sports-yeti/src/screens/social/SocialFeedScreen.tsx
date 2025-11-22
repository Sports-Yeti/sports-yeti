import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Post } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentPosts } from '../../mocks/data';
import Button from '../../components/common/Button';

const SocialFeedScreen: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(getRecentPosts());
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleLikePost = (postId: string) => {
    // TODO: Implement like API call
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likesCount: post.likesCount + 1 } : post
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user) return;

    // TODO: Implement create post API call
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: user.id,
      content: newPostContent.trim(),
      mediaUrls: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      user,
      comments: [],
      likes: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);
    Alert.alert('Post Created', 'Your post has been shared!');
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.postAvatar} />
        <View style={styles.postUser}>
          <Text style={styles.postUserName}>
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text style={styles.postTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.mediaUrls.length > 0 && (
        <Image source={{ uri: item.mediaUrls[0] }} style={styles.postImage} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.postAction}
          onPress={() => handleLikePost(item.id)}
        >
          <Text style={styles.postActionIcon}>❤️</Text>
          <Text style={styles.postActionText}>{item.likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postAction}>
          <Text style={styles.postActionIcon}>💬</Text>
          <Text style={styles.postActionText}>{item.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postAction}>
          <Text style={styles.postActionIcon}>↗️</Text>
          <Text style={styles.postActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social Feed</Text>
        <TouchableOpacity onPress={() => setShowCreatePost(!showCreatePost)}>
          <Text style={styles.createButton}>{showCreatePost ? '✕' : '✎'}</Text>
        </TouchableOpacity>
      </View>

      {showCreatePost && (
        <View style={styles.createPostContainer}>
          <TextInput
            style={styles.createPostInput}
            placeholder="What's on your mind?"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            maxLength={500}
            placeholderTextColor="#8E8E93"
          />
          <View style={styles.createPostActions}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowCreatePost(false);
                setNewPostContent('');
              }}
              variant="outline"
              size="small"
              style={styles.createPostButton}
            />
            <Button
              title="Post"
              onPress={handleCreatePost}
              variant="primary"
              size="small"
              disabled={!newPostContent.trim()}
              style={styles.createPostButton}
            />
          </View>
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Be the first to share something!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  createButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  createPostContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  createPostInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  createPostButton: {
    minWidth: 80,
  },
  list: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postUser: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  postContent: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#e9ecef',
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionIcon: {
    fontSize: 18,
  },
  postActionText: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default SocialFeedScreen;
