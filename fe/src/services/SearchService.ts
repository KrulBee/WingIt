"use client";

import UserService from './UserService';
import PostService from './PostService';
import { filterNonAdminUsers } from '@/utils/adminUtils';

// Define interfaces locally since they're not exported
interface UserData {
  id: number;
  username: string;
  password?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

// Define the actual PostData interface matching PostService
interface PostData {
  id: number;
  content: string;
  createdDate: string;
  updatedAt?: string;
  author: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
    bio?: string;
  };
  type?: {
    id: number;
    typeName: string;
  };
  location?: {
    id: number;
    location: string;
  };
  media?: Array<{
    id: number;
    mediaUrl: string;
  mediaType: string;
  }>;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  // Legacy fields for backward compatibility
  userId?: number;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  mediaUrls?: string[];
  reactionCount?: number;
  commentCount?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token');
  }
  return null;
};

// Helper function to create headers with auth
const createAuthHeaders = () => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// TypeScript interfaces for search results
export interface UserSearchResult {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  followersCount?: number;
}

export interface PostSearchResult {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;  };
  likesCount?: number;
  commentsCount?: number;
  viewCount?: number;
  createdDate: string;
  location?: {
    id: number;
    location: string;
  };
  postType?: {
    id: number;
    typeName: string;
  };
  media?: Array<{
    id: number;
    mediaUrl: string;
    mediaType: string;
  }>;
}

export interface TagSearchResult {
  name: string;
  postsCount: number;
}

export interface SearchResults {
  users: UserSearchResult[];
  posts: PostSearchResult[];
  tags: TagSearchResult[];
  totalResults: number;
}

// Helper function to extract hashtags from content
const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w]+/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
};

// Helper function to search users by query
const searchUsers = (users: UserData[], query: string, currentUserId?: number): UserSearchResult[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  
  // First filter out admin users
  const filteredUsers = filterNonAdminUsers(users);
  
  return filteredUsers
    .filter(user => 
      // Filter out current user from search results
      (currentUserId ? user.id !== currentUserId : true) &&
      (user.username?.toLowerCase().includes(searchTerm) ||
      user.displayName?.toLowerCase().includes(searchTerm) ||
      user.bio?.toLowerCase().includes(searchTerm))
    )
    .map((user: UserData) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followersCount: 0 // TODO: Get from friends/followers API when available
    }))
    .slice(0, 20); // Limit results
};

// Helper function to search posts by query
const searchPosts = (posts: any[], query: string): PostSearchResult[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return posts
    .filter(post => 
      post.content?.toLowerCase().includes(searchTerm)
    )    .map((post: PostData) => ({
      id: post.id,
      content: post.content,
      author: {
        id: post.author?.id || post.user?.id || post.userId || 0,
        username: post.author?.username || post.user?.username || 'không xác định',
        displayName: post.author?.displayName || post.user?.displayName,
        profilePicture: post.author?.profilePicture || post.user?.profilePicture      },
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      viewCount: 0, // ViewCount not available in current PostData structure
      createdDate: post.createdDate,
      location: post.location ? {
        id: post.location.id,
        location: post.location.location
      } : undefined,
      postType: post.type ? {
        id: post.type.id,
        typeName: post.type.typeName
      } : undefined,
      media: post.mediaUrls?.map((url, index) => ({
        id: index,
        mediaUrl: url,
        mediaType: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'IMAGE' : 'VIDEO'
      })) || post.media || []
    }))
    .slice(0, 20); // Limit results
};

// Helper function to search tags by query
const searchTags = (posts: PostData[], query: string): TagSearchResult[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  const tagCounts: { [key: string]: number } = {};
  
  posts.forEach((post: PostData) => {
    const hashtags = extractHashtags(post.content || '');
    hashtags.forEach(tag => {
      if (tag.includes(searchTerm)) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });
  });
  
  return Object.entries(tagCounts)
    .map(([name, postsCount]) => ({ name, postsCount }))
    .sort((a, b) => b.postsCount - a.postsCount)
    .slice(0, 10); // Limit results
};

export const SearchService = {
  // Comprehensive search across all content types
  searchAll: async (query: string, currentUserId?: number): Promise<SearchResults> => {
    try {
      // Get all data in parallel
      const [users, posts] = await Promise.all([
        UserService.getAllUsers(),
        PostService.getAllPosts()
      ]);

      // Perform searches
      const userResults = searchUsers(users, query, currentUserId);
      const postResults = searchPosts(posts, query);
      const tagResults = searchTags(posts, query);

      return {
        users: userResults,
        posts: postResults,
        tags: tagResults,
        totalResults: userResults.length + postResults.length + tagResults.length
      };
    } catch (error) {
      console.error('Search all error:', error);
      // Return empty results on error
      return {
        users: [],
        posts: [],
        tags: [],
        totalResults: 0
      };
    }
  },

  // Search only users
  searchUsers: async (query: string, currentUserId?: number): Promise<UserSearchResult[]> => {
    try {
      const users = await UserService.getAllUsers();
      return searchUsers(users, query, currentUserId);
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  },

  // Search only posts
  searchPosts: async (query: string): Promise<PostSearchResult[]> => {
    try {
      const posts = await PostService.getAllPosts();
      return searchPosts(posts, query);
    } catch (error) {
      console.error('Search posts error:', error);
      return [];
    }
  },

  // Search only tags/hashtags
  searchTags: async (query: string): Promise<TagSearchResult[]> => {
    try {
      const posts = await PostService.getAllPosts();
      return searchTags(posts, query);
    } catch (error) {
      console.error('Search tags error:', error);
      return [];
    }
  },

  // Get trending tags (most used hashtags)
  getTrendingTags: async (limit: number = 10): Promise<TagSearchResult[]> => {
    try {
      const posts = await PostService.getAllPosts();
      const tagCounts: { [key: string]: number } = {};
      
      posts.forEach(post => {
        const hashtags = extractHashtags(post.content || '');
        hashtags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      return Object.entries(tagCounts)
        .map(([name, postsCount]) => ({ name, postsCount }))
        .sort((a, b) => b.postsCount - a.postsCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Get trending tags error:', error);
      return [];
    }
  },  // Get suggested users (friend-of-friend recommendations, then random)
  getSuggestedUsers: async (limit: number = 10, currentUserId?: number): Promise<UserSearchResult[]> => {
    try {
      const users = await UserService.getAllUsers();
      let suggestedUsers: UserSearchResult[] = [];
      
      if (currentUserId) {
        // Try to get friend-of-friend suggestions
        try {
          const friendOfFriendSuggestions = await SearchService.getFriendOfFriendSuggestions(currentUserId, limit);
          suggestedUsers = friendOfFriendSuggestions;
        } catch (error) {
          console.log('Could not get friend-of-friend suggestions, falling back to random users');
        }
      }
        // If we don't have enough suggestions from friends-of-friends, add random users
      if (suggestedUsers.length < limit) {
        const existingUserIds = new Set(suggestedUsers.map(u => u.id));
        
        // Filter out admin users first
        const filteredUsers = filterNonAdminUsers(users);
        
        const randomUsers = filteredUsers
          .filter(user => {
            return (!currentUserId || user.id !== currentUserId) && !existingUserIds.has(user.id);
          })
          .map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            profilePicture: user.profilePicture,
            followersCount: 0
          }))
          .sort(() => Math.random() - 0.5)
          .slice(0, limit - suggestedUsers.length);
        
        suggestedUsers = [...suggestedUsers, ...randomUsers];
      }
      
      return suggestedUsers.slice(0, limit);
    } catch (error) {
      console.error('Get suggested users error:', error);
      return [];
    }
  },

  // Get friend-of-friend suggestions
  getFriendOfFriendSuggestions: async (currentUserId: number, limit: number = 5): Promise<UserSearchResult[]> => {
    try {
      // Import FriendService dynamically to avoid circular dependency
      const FriendService = (await import('./FriendService')).default;
      
      // Get current user's friends
      const currentUserFriends = await FriendService.getFriends();
      const currentFriendIds = new Set(currentUserFriends.map(f => f.friend.id));
      
      // Get friends of friends
      const friendOfFriendIds = new Set<number>();
      for (const friend of currentUserFriends) {
        try {
          const friendsFriends = await FriendService.getFriendsByUserId(friend.friend.id);
          friendsFriends.forEach(ff => {
            // Don't suggest current user or existing friends
            if (ff.friend.id !== currentUserId && !currentFriendIds.has(ff.friend.id)) {
              friendOfFriendIds.add(ff.friend.id);
            }
          });
        } catch (error) {
          console.log(`Could not get friends for user ${friend.friend.id}`);
        }
      }
      
      // Convert to UserSearchResult format
      const suggestions: UserSearchResult[] = [];
      const allUsers = await UserService.getAllUsers();
      
      for (const userId of friendOfFriendIds) {
        const user = allUsers.find(u => u.id === userId);
        if (user && suggestions.length < limit) {
          suggestions.push({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            profilePicture: user.profilePicture,
            followersCount: 0
          });
        }
      }
      
      return suggestions;
    } catch (error) {
      console.error('Get friend-of-friend suggestions error:', error);
      return [];
    }
  },

  // Get random posts for the "all" tab
  getRandomPosts: async (limit: number = 5): Promise<PostSearchResult[]> => {
    try {
      const posts = await PostService.getAllPosts();
        return posts
        .sort(() => Math.random() - 0.5) // Random shuffle
        .slice(0, limit)        .map((post: PostData) => ({
          id: post.id,
          content: post.content,
          author: {
            id: post.author?.id || post.user?.id || post.userId || 0,
            username: post.author?.username || post.user?.username || 'không xác định',          displayName: post.author?.displayName || post.user?.displayName,
            profilePicture: post.author?.profilePicture || post.user?.profilePicture
          },
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
          createdDate: post.createdDate,
          media: post.mediaUrls?.map((url: string, index: number) => ({
            id: index,
            mediaUrl: url,
            mediaType: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'IMAGE' : 'VIDEO'
          })) || post.media || [],
          location: post.location,
          postType: post.type ? {
            id: post.type.id,
            typeName: post.type.typeName
          } : undefined,
          viewCount: 0
        }));
    } catch (error) {
      console.error('Get random posts error:', error);
      return [];
    }
  },// Search posts with media (photos/videos)
  searchMedia: async (query: string): Promise<PostSearchResult[]> => {
    try {
      const posts = await PostService.getAllPosts();
      
      // Filter posts that have media
      const postsWithMedia = posts.filter((post: PostData) => 
        (post.mediaUrls && post.mediaUrls.length > 0) || (post.media && post.media.length > 0)
      );
      
      // Apply search if query is provided
      if (query.trim()) {
        return searchPosts(postsWithMedia, query);
      }
        // Return all posts with media
      return postsWithMedia
        .map((post: PostData) => ({
          id: post.id,
          content: post.content,
          author: {
            id: post.author?.id || post.user?.id || post.userId || 0,
            username: post.author?.username || post.user?.username || 'không xác định',          displayName: post.author?.displayName || post.user?.displayName,
            profilePicture: post.author?.profilePicture || post.user?.profilePicture
          },
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
          createdDate: post.createdDate,
          media: post.mediaUrls?.map((url: string, index: number) => ({
            id: index,
            mediaUrl: url,
            mediaType: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'IMAGE' : 'VIDEO'
          })) || post.media || []
        }))
        .slice(0, 20); // Limit results
    } catch (error) {
      console.error('Search media error:', error);
      return [];
    }
  }
};

export default SearchService;
