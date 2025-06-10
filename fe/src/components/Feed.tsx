"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Post from "./Post";
import CreatePostForm from "./CreatePostForm";
import LocationFilter from "./LocationFilter";
import { PostService } from "@/services";
import { webSocketService } from "@/services/WebSocketService";
import { viewService } from "@/services";
import { Spinner, Button, Select, SelectItem } from "@nextui-org/react";
import { useFeedContext, SortOption } from "@/contexts/FeedContext";

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
  viewCount?: number;
  createdAt: Date;
  liked: boolean;
  disliked?: boolean;
}

interface FeedProps {
  highlightPostId?: string;
}

export default function Feed({ highlightPostId }: FeedProps) {
  const { selectedLocationId, setSelectedLocationId, sortBy, setSortBy } = useFeedContext();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState<string | undefined>(highlightPostId);
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const POSTS_PER_PAGE = 10;

  // Effect to handle post highlighting and scrolling
  useEffect(() => {
    if (highlightPostId && posts.length > 0) {
      setHighlightedPostId(highlightPostId);
      
      // Scroll to the highlighted post after a short delay to ensure it's rendered
      const timer = setTimeout(() => {
        const targetPostRef = postRefs.current[highlightPostId];
        if (targetPostRef) {
          targetPostRef.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);

      // Clear highlight after 3 seconds
      const highlightTimer = setTimeout(() => {
        setHighlightedPostId(undefined);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(highlightTimer);
      };
    }
  }, [highlightPostId, posts]);

  // Effect to set up intersection observer for view tracking
  useEffect(() => {
    console.log('🔍 DEBUG: Setting up intersection observer for view tracking');
    
    // Create intersection observer to track when posts come into view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        console.log(`🔍 DEBUG: Intersection observer triggered with ${entries.length} entries`);
        
        entries.forEach((entry) => {
          const postElement = entry.target as HTMLElement;
          const postId = postElement.dataset.postId;
          
          console.log(`🔍 DEBUG: Processing entry for post ${postId}, isIntersecting: ${entry.isIntersecting}, intersectionRatio: ${entry.intersectionRatio}`);
          
          if (entry.isIntersecting && postId) {
            console.log(`🔍 DEBUG: Post ${postId} is intersecting, setting up view tracking timer`);
            
            // Track view when post becomes visible for at least 1 second
            // Store the postId instead of relying on entry state
            const viewTimer = setTimeout(() => {
              console.log(`🔍 DEBUG: Timer triggered for post ${postId}, checking if still visible`);
              
              // Check if the element is still in view by getting current intersection ratio
              const currentEntry = entry.target.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const elementTop = currentEntry.top;
              const elementBottom = currentEntry.bottom;
              const elementHeight = currentEntry.height;
              
              // Calculate if at least 50% is still visible
              const visibleTop = Math.max(0, elementTop);
              const visibleBottom = Math.min(viewportHeight, elementBottom);
              const visibleHeight = Math.max(0, visibleBottom - visibleTop);
              const visibilityRatio = visibleHeight / elementHeight;
              
              console.log(`🔍 DEBUG: Post ${postId} visibility check - ratio: ${visibilityRatio}, threshold: 0.5`);
              
              if (visibilityRatio >= 0.5) {
                console.log(`🔍 DEBUG: Post ${postId} still visible after 1 second, tracking view`);
                viewService.trackView(postId, 'feed');
              } else {
                console.log(`🔍 DEBUG: Post ${postId} no longer visible, skipping view tracking`);
              }
            }, 1000);
            
            // Store timer reference on the element for cleanup
            (postElement as any).viewTimer = viewTimer;
          } else if (!entry.isIntersecting && postId) {
            console.log(`🔍 DEBUG: Post ${postId} is no longer intersecting, clearing timer if exists`);
            
            // Clear any pending view timer when post goes out of view
            const timer = (postElement as any).viewTimer;
            if (timer) {
              clearTimeout(timer);
              (postElement as any).viewTimer = null;
              console.log(`🔍 DEBUG: Cleared view timer for post ${postId}`);
            }
          }
        });
      },
      {
        threshold: 0.5, // Post must be at least 50% visible
        rootMargin: '0px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Effect to observe post elements when they're added
  useEffect(() => {
    console.log(`🔍 DEBUG: Posts updated, setting up observation for ${posts.length} posts`);
    
    if (observerRef.current) {
      // Disconnect all previous observations
      observerRef.current.disconnect();
      
      // Observe all current post elements
      let observedCount = 0;
      Object.entries(postRefs.current).forEach(([postId, element]) => {
        if (element) {
          console.log(`🔍 DEBUG: Observing post element for postId: ${postId}`);
          observerRef.current!.observe(element);
          observedCount++;
        } else {
          console.log(`🔍 DEBUG: No element found for postId: ${postId}`);
        }
      });
      
      console.log(`🔍 DEBUG: Successfully observing ${observedCount} post elements`);
    } else {
      console.warn('🔍 DEBUG: Observer not initialized when trying to observe posts');
    }
  }, [posts]);

  // Transform backend post data to frontend format
  const transformBackendPost = (post: any): PostData => {
    const mediaUrls = post.media?.map((m: any) => m.mediaUrl) || post.mediaUrls || [];
    return {
      id: post.id.toString(),
      authorName: post.author?.displayName || post.author?.username || 'Người dùng không xác định',
      authorUsername: post.author?.username || 'không xác định',
      authorAvatar: post.author?.profilePicture,
      content: post.content,
      image: mediaUrls[0], // Keep for backward compatibility
      images: mediaUrls.length > 0 ? mediaUrls : undefined, // Pass all media URLs
      likes: post.likesCount ?? post.reactionCount ?? 0,
      dislikes: post.dislikesCount ?? 0,
      comments: post.commentsCount ?? post.commentCount ?? 0,
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
  }, []);

  useEffect(() => {
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
      });

    // Cleanup WebSocket on unmount
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

  // Effect to refetch posts when location filter or sort option changes
  useEffect(() => {
    setPage(0);
    fetchPosts(0, false);
  }, [selectedLocationId, sortBy]);

  const fetchPosts = async (pageNum: number = 0, append: boolean = false) => {
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

      // Apply client-side sorting based on sortBy option
      if (sortBy !== 'latest') {
        response = [...response].sort((a, b) => {
          switch (sortBy) {
            case 'most_viewed':
              return (b.viewCount ?? 0) - (a.viewCount ?? 0);
            case 'most_loved':
              return (b.likesCount ?? b.reactionCount ?? 0) - (a.likesCount ?? a.reactionCount ?? 0);
            case 'most_commented':
              return (b.commentsCount ?? b.commentCount ?? 0) - (a.commentsCount ?? a.commentCount ?? 0);
            default:
              return 0;
          }
        });
      }
      
      // Simulate pagination for now (since API might not support it yet)
      const startIndex = pageNum * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedResponse = response.slice(startIndex, endIndex);

      // Use backend fields directly for performance
      const transformedPosts: PostData[] = paginatedResponse.map((post) => {
        const mediaUrls = post.media?.map((m: any) => m.mediaUrl) || post.mediaUrls || [];
        return {
          id: post.id.toString(),
          authorName: post.author?.displayName || post.author?.username || 'Người dùng không xác định',
          authorUsername: post.author?.username || 'không xác định',
          authorAvatar: post.author?.profilePicture,
          content: post.content,
          image: mediaUrls[0], // Keep for backward compatibility
          images: mediaUrls.length > 0 ? mediaUrls : undefined, // Pass all media URLs
          likes: post.likesCount ?? post.reactionCount ?? 0,
          comments: post.commentsCount ?? post.commentCount ?? 0,
          viewCount: post.viewCount ?? 0,
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
      setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
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

  const handleSortChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as SortOption;
    setSortBy(selectedKey);
  };

  const handleLocationChange = (locationId: number | null) => {
    setSelectedLocationId(locationId);
  };

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
      viewCount: 0,
      createdAt: new Date(newPost.createdDate),
      liked: false,
      disliked: false
    };
    
    setPosts(prev => [transformedPost, ...prev]);
  };

  const handleRetry = () => {
    fetchPosts();
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
  }

  return (
    <div className="space-y-6">
      <CreatePostForm onPostCreated={handlePostCreated} />
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <LocationFilter 
          selectedLocationId={selectedLocationId}
          onLocationChange={handleLocationChange}
          className="flex-1"
        />
        
        {/* Sort Filter */}
        <Select
          label="Sắp xếp theo"
          placeholder="Chọn cách sắp xếp..."
          selectedKeys={new Set([sortBy])}
          onSelectionChange={handleSortChange}
          className="flex-1 max-w-xs"
          size="sm"
        >
          <SelectItem key="latest">Mới nhất</SelectItem>
          <SelectItem key="most_viewed">Xem nhiều nhất</SelectItem>
          <SelectItem key="most_loved">Yêu thích nhất</SelectItem>
          <SelectItem key="most_commented">Bình luận nhiều nhất</SelectItem>
        </Select>
      </div>

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
            <div 
              key={post.id}
              data-post-id={post.id}
              ref={el => { postRefs.current[post.id] = el; }}
            >
              <Post 
                {...post}
                highlighted={highlightedPostId === post.id}
              />
            </div>
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
