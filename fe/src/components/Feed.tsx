"use client";
import React, { useState, useEffect, useCallback } from "react";
import Post from "./Post";
import CreatePostForm from "./CreatePostForm";
import LocationFilter from "./LocationFilter";
import { PostService } from "@/services";
import { webSocketService } from "@/services/WebSocketService";
import { Spinner, Button } from "@nextui-org/react";

interface PostData {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  images?: string[];
  likes: number;
  dislikes?: number;
  comments: number;
  shares: number;
  createdAt: Date;
  liked: boolean;
  disliked?: boolean;
}

export default function Feed() {
  const [posts, setPosts] = useState<PostData[]>([]);  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const POSTS_PER_PAGE = 10;  // Transform backend post data to frontend format
  const transformBackendPost = (post: any): PostData => {
    const mediaUrls = post.media?.map((m: any) => m.mediaUrl) || post.mediaUrls || [];
    return {
      id: post.id.toString(),
      authorName: post.author?.displayName || post.author?.username || 'Unknown User',
      authorUsername: post.author?.username || 'unknown',
      authorAvatar: post.author?.profilePicture,
      content: post.content,
      image: mediaUrls[0], // Keep for backward compatibility
      images: mediaUrls.length > 0 ? mediaUrls : undefined, // Pass all media URLs
      likes: post.likesCount ?? post.reactionCount ?? 0,
      dislikes: post.dislikesCount ?? 0,
      comments: post.commentsCount ?? post.commentCount ?? 0,
      shares: post.sharesCount ?? 0,
      createdAt: new Date(post.createdDate),
      liked: post.liked ?? false,
      disliked: post.disliked ?? false
    };
  };

  // Real-time post update handler
  const handlePostUpdate = useCallback((postData: any) => {
    try {
      const { action, post } = postData;
      
      switch (action) {
        case 'create':
          // Add new post to the beginning of the feed
          setPosts(prev => [transformBackendPost(post), ...prev]);
          break;
        case 'update':
          // Update existing post
          setPosts(prev => prev.map(p => 
            p.id === post.id ? transformBackendPost(post) : p
          ));
          break;
        case 'delete':
          // Remove deleted post
          setPosts(prev => prev.filter(p => p.id !== post.id));
          break;
      }
    } catch (err) {
      console.error('Error processing post update:', err);
    }
  }, []);

  // Real-time reaction update handler
  const handleReactionUpdate = useCallback((reactionData: any) => {
    try {
      const { postId, reactionCount, userReacted } = reactionData;
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: reactionCount, liked: userReacted }
          : post
      ));
    } catch (err) {
      console.error('Error processing reaction update:', err);
    }
  }, []);  useEffect(() => {
    fetchPosts();
      // Initialize WebSocket connection for real-time updates
    const wsService = webSocketService;
    let postUpdateSubscriptionId: string;
    let reactionSubscriptionId: string;
    
    wsService.connect()
      .then(() => {
        console.log('WebSocket connected for feed updates');
        setWsConnected(true);
        
        // Subscribe to real-time post updates
        postUpdateSubscriptionId = wsService.subscribe('post_update', handlePostUpdate);
        
        // Subscribe to real-time reaction updates
        reactionSubscriptionId = wsService.subscribe('reaction', handleReactionUpdate);
      })
      .catch((err: any) => {
        console.error('WebSocket connection failed:', err);
        setWsConnected(false);
      });    // Cleanup WebSocket on unmount
    return () => {
      if (wsService.isConnected()) {
        if (postUpdateSubscriptionId) {
          wsService.unsubscribe(postUpdateSubscriptionId);
        }
        if (reactionSubscriptionId) {
          wsService.unsubscribe(reactionSubscriptionId);
        }
      }
    };
  }, [handlePostUpdate, handleReactionUpdate]);

  // Effect to refetch posts when location filter changes
  useEffect(() => {
    setPage(0);
    fetchPosts(0, false);
  }, [selectedLocationId]);const fetchPosts = async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
        let response;
      // Fetch posts based on location filter
      if (selectedLocationId === null) {
        response = await PostService.getAllPosts();
      } else {
        response = await PostService.getPostsByLocationId(selectedLocationId);
      }
      
      // Simulate pagination for now (since API might not support it yet)
      const startIndex = pageNum * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedResponse = response.slice(startIndex, endIndex);      // Use backend fields directly for performance
      const transformedPosts: PostData[] = paginatedResponse.map((post) => {
        const mediaUrls = post.media?.map((m: any) => m.mediaUrl) || post.mediaUrls || [];
        return {
          id: post.id.toString(),
          authorName: post.author?.displayName || post.author?.username || 'Unknown User',
          authorUsername: post.author?.username || 'unknown',
          authorAvatar: post.author?.profilePicture,
          content: post.content,
          image: mediaUrls[0], // Keep for backward compatibility
          images: mediaUrls.length > 0 ? mediaUrls : undefined, // Pass all media URLs
          likes: post.likesCount ?? post.reactionCount ?? 0,
          comments: post.commentsCount ?? post.commentCount ?? 0,
          shares: post.sharesCount ?? 0,
          createdAt: new Date(post.createdDate),
          liked: post.liked ?? false
        };
      });
      
      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
      
      // Check if there are more posts
      setHasMore(transformedPosts.length === POSTS_PER_PAGE && endIndex < response.length);
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
      // Fallback to mock data only on first load
      if (!append) {
        setPosts(MOCK_POSTS);
      }    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  const handleLoadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchPosts(nextPage, true);
    }
  }, [page, loadingMore, hasMore]);
  const handlePostCreated = (newPost: any) => {
    // Add the new post to the beginning of the list
    const transformedPost: PostData = {
      id: newPost.id.toString(),
      authorName: newPost.user?.displayName || newPost.user?.username || 'You',
      authorUsername: newPost.user?.username || 'you',
      authorAvatar: newPost.user?.profilePicture,
      content: newPost.content,
      image: newPost.mediaUrls?.[0],
      likes: 0,
      dislikes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date(newPost.createdDate),
      liked: false,
      disliked: false
    };
    
    setPosts(prev => [transformedPost, ...prev]);
  };
  const handleRetry = () => {
    fetchPosts();
  };

  const handleLocationChange = (locationId: number | null) => {
    setSelectedLocationId(locationId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button 
          onClick={handleRetry}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }  return (
    <div className="space-y-6">
      <CreatePostForm onPostCreated={handlePostCreated} />
      
      {/* Location Filter */}
      <LocationFilter 
        selectedLocationId={selectedLocationId}
        onLocationChange={handleLocationChange}
      />
        {/* Real-time status */}
      <div className="flex justify-center items-center gap-4">
        {wsConnected && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span>Cập nhật trực tuyến</span>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <p>Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ điều gì đó!</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <Post 
              key={post.id} 
              {...post}
            />
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                color="primary"
                variant="ghost"
                onPress={handleLoadMore}
                isLoading={loadingMore}
                isDisabled={loadingMore}
              >
                {loadingMore ? 'Đang tải thêm...' : 'Tải thêm bài viết'}
              </Button>
            </div>
          )}
          
          {!hasMore && posts.length > 0 && (
            <div className="text-center text-gray-500 p-4">
              <p>Bạn đã xem hết tất cả bài viết!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Mock data for fallback
const MOCK_POSTS: PostData[] = [
  {
    id: "1",
    authorName: "Jane Smith",
    authorUsername: "janesmith",
    authorAvatar: "https://i.pravatar.cc/150?u=janesmith",
    content: "Just finished a great book on modern web development with Next.js and React. Highly recommend it! 📚",
    likes: 42,
    dislikes: 2,
    comments: 7,
    shares: 3,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    liked: true,
    disliked: false
  },
  {
    id: "2",
    authorName: "John Doe",
    authorUsername: "johndoe",
    authorAvatar: "https://i.pravatar.cc/150?u=johndoe",
    content: "Beautiful day for a hike! 🌲 Nature is the best therapy.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
    likes: 78,
    dislikes: 1,
    comments: 12,
    shares: 5,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    liked: false,
    disliked: false
  },
  {
    id: "3",
    authorName: "Alice Johnson",
    authorUsername: "alicej",
    authorAvatar: "https://i.pravatar.cc/150?u=alicej",
    content: "Just launched my new portfolio website! Check it out and let me know what you think. #webdevelopment #portfolio",
    likes: 56,
    dislikes: 3,
    comments: 8,
    shares: 2,
    createdAt: new Date(Date.now() - 10800000), // 3 hours ago
    liked: false,
    disliked: false
  },
  {
    id: "4",
    authorName: "Robert Wilson",
    authorUsername: "robertw",
    authorAvatar: "https://i.pravatar.cc/150?u=robertw",
    content: "Made some homemade pasta today. Italian cuisine at its finest! 🍝",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000",
    likes: 89,
    dislikes: 0,
    comments: 15,
    shares: 7,
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
    liked: true,
    disliked: false
  }
];
