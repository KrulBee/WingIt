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

interface PostReaction {
  id: number;
  postId: number;
  userId: number;
  reactionTypeId: number;
  reactionType?: {
    id: number;
    name: string;
    icon?: string;
  };
  user?: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  createdDate: string;
}

interface ReactionCount {
  count: number;
}

const PostReactionService = {
  // Add a reaction to a post
  addReaction: async (postId: number, reactionTypeId: number): Promise<PostReaction> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/react?reactionTypeId=${reactionTypeId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to add reaction');
      }

      const reaction: PostReaction = await response.json();
      return reaction;
    } catch (error) {
      console.error('Add reaction error:', error);
      throw error;
    }
  },

  // Remove a reaction from a post
  removeReaction: async (postId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/react`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove reaction');
      }
    } catch (error) {
      console.error('Remove reaction error:', error);
      throw error;
    }
  },

  // Get all reactions for a post
  getReactionsByPostId: async (postId: number): Promise<PostReaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reactions');
      }

      const reactions: PostReaction[] = await response.json();
      return reactions;
    } catch (error) {
      console.error('Get reactions error:', error);
      throw error;
    }
  },

  // Get current user's reaction for a post
  getUserReactionForPost: async (postId: number): Promise<PostReaction | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/user`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // No reaction found
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user reaction');
      }

      const reaction: PostReaction = await response.json();
      return reaction;
    } catch (error) {
      console.error('Get user reaction error:', error);
      throw error;
    }
  },

  // Get total reaction count for a post
  getReactionCount: async (postId: number): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/count`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reaction count');
      }

      const result: ReactionCount = await response.json();
      return result.count;
    } catch (error) {
      console.error('Get reaction count error:', error);
      throw error;
    }
  },

  // Get reaction count by type for a post
  getReactionCountByType: async (postId: number, reactionTypeId: number): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/posts/${postId}/count/${reactionTypeId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reaction count by type');
      }

      const result: ReactionCount = await response.json();
      return result.count;
    } catch (error) {
      console.error('Get reaction count by type error:', error);
      throw error;
    }
  },

  // Get current user's reactions
  getCurrentUserReactions: async (): Promise<PostReaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/user`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user reactions');
      }

      const reactions: PostReaction[] = await response.json();
      return reactions;
    } catch (error) {
      console.error('Get user reactions error:', error);
      throw error;
    }
  },

  // Get reactions by user ID
  getUserReactions: async (userId: number): Promise<PostReaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post-reactions/user/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user reactions');
      }

      const reactions: PostReaction[] = await response.json();
      return reactions;
    } catch (error) {
      console.error('Get user reactions error:', error);
      throw error;
    }
  },
};

export default PostReactionService;
