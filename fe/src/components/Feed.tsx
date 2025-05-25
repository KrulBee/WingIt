"use client";
import React, { useState, useEffect } from "react";
import Post from "./Post";
import CreatePostForm from "./CreatePostForm";
import { PostService } from "@/services";
import { Spinner } from "@nextui-org/react";

interface PostData {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  liked: boolean;
}

export default function Feed() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PostService.getAllPosts();
      // Use backend fields directly for performance
      const transformedPosts: PostData[] = response.map((post) => ({
        id: post.id.toString(),
        authorName: post.user?.displayName || post.user?.username || 'Unknown User',
        authorUsername: post.user?.username || 'unknown',
        authorAvatar: post.user?.profilePicture,
        content: post.content,
        image: post.mediaUrls?.[0], // Use first media URL if available
        likes: post.likesCount ?? post.reactionCount ?? 0,
        comments: post.commentsCount ?? post.commentCount ?? 0,
        shares: post.sharesCount ?? 0,
        createdAt: new Date(post.createdDate),
        liked: post.liked ?? false
      }));
      setPosts(transformedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
      // Fallback to mock data
      setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
    }
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
      comments: 0,
      shares: 0,
      createdAt: new Date(newPost.createdDate),
      liked: false
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
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePostForm onPostCreated={handlePostCreated} />
      
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        posts.map(post => (
          <Post 
            key={post.id} 
            {...post}
          />
        ))
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
    comments: 7,
    shares: 3,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    liked: true
  },
  {
    id: "2",
    authorName: "John Doe",
    authorUsername: "johndoe",
    authorAvatar: "https://i.pravatar.cc/150?u=johndoe",
    content: "Beautiful day for a hike! 🌲 Nature is the best therapy.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
    likes: 78,
    comments: 12,
    shares: 5,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    liked: false
  },
  {
    id: "3",
    authorName: "Alice Johnson",
    authorUsername: "alicej",
    authorAvatar: "https://i.pravatar.cc/150?u=alicej",
    content: "Just launched my new portfolio website! Check it out and let me know what you think. #webdevelopment #portfolio",
    likes: 56,
    comments: 8,
    shares: 2,
    createdAt: new Date(Date.now() - 10800000), // 3 hours ago
    liked: false
  },
  {
    id: "4",
    authorName: "Robert Wilson",
    authorUsername: "robertw",
    authorAvatar: "https://i.pravatar.cc/150?u=robertw",
    content: "Made some homemade pasta today. Italian cuisine at its finest! 🍝",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000",
    likes: 89,
    comments: 15,
    shares: 7,
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
    liked: true
  }
];
