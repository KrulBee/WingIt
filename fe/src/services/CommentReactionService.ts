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

interface CommentReaction {
  id: number;
  commentId: number;
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
  timestamp: string;
}

interface ReactionCount {
  count: number;
}

const CommentReactionService = {
  // Add a reaction to a comment
  addReaction: async (commentId: number, reactionTypeId: number): Promise<CommentReaction> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/comments/${commentId}/react?reactionTypeId=${reactionTypeId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to add reaction');
      }

      const reaction: CommentReaction = await response.json();
      return reaction;
    } catch (error) {
      console.error('Add comment reaction error:', error);
      throw error;
    }
  },

  // Remove a reaction from a comment
  removeReaction: async (commentId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/comments/${commentId}/react`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove reaction');
      }
    } catch (error) {
      console.error('Remove comment reaction error:', error);
      throw error;
    }
  },

  // Get all reactions for a comment
  getReactionsByCommentId: async (commentId: number): Promise<CommentReaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/comments/${commentId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reactions');
      }

      const reactions: CommentReaction[] = await response.json();
      return reactions;
    } catch (error) {
      console.error('Get comment reactions error:', error);
      throw error;
    }
  },

  // Get current user's reaction for a comment
  getUserReactionForComment: async (commentId: number): Promise<CommentReaction | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/comments/${commentId}/user`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // No reaction found
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user reaction');
      }

      const reaction: CommentReaction = await response.json();
      return reaction;
    } catch (error) {
      console.error('Get user comment reaction error:', error);
      throw error;
    }
  },

  // Get total reaction count for a comment
  getReactionCount: async (commentId: number): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/comments/${commentId}/count`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reaction count');
      }

      const result: ReactionCount = await response.json();
      return result.count;
    } catch (error) {
      console.error('Get comment reaction count error:', error);
      throw error;
    }
  },

  // Get reaction count by type for a comment
  getReactionCountByType: async (commentId: number, reactionTypeId: number): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/comments/${commentId}/count/${reactionTypeId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reaction count by type');
      }

      const result: ReactionCount = await response.json();
      return result.count;
    } catch (error) {
      console.error('Get comment reaction count by type error:', error);
      throw error;
    }
  },

  // Get current user's comment reactions
  getCurrentUserReactions: async (): Promise<CommentReaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/user`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user reactions');
      }

      const reactions: CommentReaction[] = await response.json();
      return reactions;
    } catch (error) {
      console.error('Get user comment reactions error:', error);
      throw error;
    }
  },

  // Get reactions by user ID
  getUserReactions: async (userId: number): Promise<CommentReaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-reactions/user/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user reactions');
      }

      const reactions: CommentReaction[] = await response.json();
      return reactions;
    } catch (error) {
      console.error('Get user comment reactions error:', error);
      throw error;
    }
  },
};

export default CommentReactionService;
