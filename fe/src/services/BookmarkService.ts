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
  createdAt: string;
  post?: {
    id: number;
    content: string;
    userId: number;
    createdDate: string;
    user?: {
      id: number;
      username: string;
      displayName?: string;
      profilePicture?: string;
    };
    mediaUrls?: string[];
    likesCount?: number;
    dislikesCount?: number;
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

// Bookmark service using dedicated bookmark API endpoints
const BookmarkService = {
  // Add a bookmark
  addBookmark: async (postId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks/posts/${postId}`, {
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

  // Remove a bookmark
  removeBookmark: async (postId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks/posts/${postId}`, {
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

  // Get user's bookmarked posts
  getUserBookmarks: async (): Promise<BookmarkData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks/user`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const bookmarks = await response.json();
      return bookmarks;
    } catch (error) {
      console.error('Get bookmarks error:', error);
      throw error;
    }
  },

  // Check if a post is bookmarked by current user
  isPostBookmarked: async (postId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks/posts/${postId}/status`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to check bookmark status');
      }

      const result = await response.json();
      return result.isBookmarked || false;
    } catch (error) {
      console.error('Check bookmark status error:', error);
      return false; // Default to not bookmarked on error
    }
  },

  // Get bookmark count for a post
  getBookmarkCount: async (postId: number): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks/posts/${postId}/count`, {
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
