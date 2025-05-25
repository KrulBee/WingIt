"use client";

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

// Types for bookmark functionality
export interface BookmarkData {
  id: number;
  postId: number;
  userId: number;
  createdDate: string;
  post?: {
    id: number;
    content: string;
    userId: number;
    user?: {
      id: number;
      username: string;
      displayName?: string;
      profilePicture?: string;
    };
    createdDate: string;
    updatedDate?: string;
    mediaUrls?: string[];
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
  };
}

export interface BookmarkCollectionData {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdDate: string;
  bookmarkCount?: number;
}

// Bookmark service using PostReactions API with bookmark reaction type
// Note: This assumes there's a reaction type for bookmarks (e.g., reactionTypeId = 3 for bookmarks)
const BOOKMARK_REACTION_TYPE_ID = 3; // This should be configured based on your backend setup

const BookmarkService = {
  // Add a bookmark (using post reactions)
  addBookmark: async (postId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/react?reactionTypeId=${BOOKMARK_REACTION_TYPE_ID}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to add bookmark');
      }
    } catch (error) {
      console.error('Add bookmark error:', error);
      throw error;
    }
  },

  // Remove a bookmark (using post reactions)
  removeBookmark: async (postId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/react`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }
    } catch (error) {
      console.error('Remove bookmark error:', error);
      throw error;
    }
  },

  // Get user's bookmarked posts (using post reactions)
  getUserBookmarks: async (): Promise<BookmarkData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/user`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const reactions = await response.json();
      
      // Filter only bookmark reactions and transform to BookmarkData
      const bookmarks = reactions
        .filter((reaction: any) => reaction.reactionType?.id === BOOKMARK_REACTION_TYPE_ID)
        .map((reaction: any): BookmarkData => ({
          id: reaction.id,
          postId: reaction.post.id,
          userId: reaction.user.id,
          createdDate: reaction.createdDate,
          post: reaction.post
        }));

      return bookmarks;
    } catch (error) {
      console.error('Get bookmarks error:', error);
      throw error;
    }
  },

  // Check if a post is bookmarked by current user
  isPostBookmarked: async (postId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/user`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (response.status === 404) {
        return false; // No reaction found
      }

      if (!response.ok) {
        throw new Error('Failed to check bookmark status');
      }

      const reaction = await response.json();
      return reaction.reactionType?.id === BOOKMARK_REACTION_TYPE_ID;
    } catch (error) {
      console.error('Check bookmark status error:', error);
      return false; // Default to not bookmarked on error
    }
  },

  // Get bookmark count for a post
  getBookmarkCount: async (postId: number): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/count/${BOOKMARK_REACTION_TYPE_ID}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        return 0; // Return 0 if can't fetch count
      }

      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Get bookmark count error:', error);
      return 0;
    }
  },

  // Mock collection management (for UI compatibility)
  // These would need dedicated backend endpoints for full implementation
  createCollection: async (name: string, description?: string): Promise<BookmarkCollectionData> => {
    // This is a mock implementation
    // In a real app, you'd need a dedicated collections API
    const mockCollection: BookmarkCollectionData = {
      id: Date.now(),
      name,
      description,
      userId: 1, // Should come from auth context
      createdDate: new Date().toISOString(),
      bookmarkCount: 0
    };
    
    // Store in localStorage for now
    const collections = JSON.parse(localStorage.getItem('bookmark-collections') || '[]');
    collections.push(mockCollection);
    localStorage.setItem('bookmark-collections', JSON.stringify(collections));
    
    return mockCollection;
  },

  getUserCollections: async (): Promise<BookmarkCollectionData[]> => {
    // Mock implementation using localStorage
    try {
      const collections = JSON.parse(localStorage.getItem('bookmark-collections') || '[]');
      return collections;
    } catch (error) {
      console.error('Get collections error:', error);
      return [];
    }
  },

  deleteCollection: async (collectionId: number): Promise<void> => {
    // Mock implementation using localStorage
    try {
      const collections = JSON.parse(localStorage.getItem('bookmark-collections') || '[]');
      const filteredCollections = collections.filter((c: BookmarkCollectionData) => c.id !== collectionId);
      localStorage.setItem('bookmark-collections', JSON.stringify(filteredCollections));
    } catch (error) {
      console.error('Delete collection error:', error);
      throw error;
    }
  },
};

export default BookmarkService;
