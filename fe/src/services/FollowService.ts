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

// TypeScript interfaces
interface UserDTO {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

interface FollowDTO {
  id: number;
  follower: UserDTO;
  following: UserDTO;
  followDate: string; // ISO date string
}

const FollowService = {
  // Follow a user
  followUser: async (userId: number): Promise<FollowDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follows/${userId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      const follow: FollowDTO = await response.json();
      return follow;
    } catch (error) {
      console.error('Follow user error:', error);
      throw error;
    }
  },

  // Unfollow a user
  unfollowUser: async (userId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follows/${userId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }
    } catch (error) {
      console.error('Unfollow user error:', error);
      throw error;
    }
  },

  // Get followers of current user
  getFollowers: async (): Promise<FollowDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follows/followers`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }

      const followers: FollowDTO[] = await response.json();
      return followers;
    } catch (error) {
      console.error('Get followers error:', error);
      throw error;
    }
  },

  // Get users current user is following
  getFollowing: async (): Promise<FollowDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follows/following`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch following');
      }

      const following: FollowDTO[] = await response.json();
      return following;
    } catch (error) {
      console.error('Get following error:', error);
      throw error;
    }
  },

  // Get followers of a specific user
  getFollowersByUserId: async (userId: number): Promise<FollowDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follows/user/${userId}/followers`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user followers');
      }

      const followers: FollowDTO[] = await response.json();
      return followers;
    } catch (error) {
      console.error('Get user followers error:', error);
      throw error;
    }
  },

  // Get users a specific user is following
  getFollowingByUserId: async (userId: number): Promise<FollowDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follows/user/${userId}/following`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user following');
      }

      const following: FollowDTO[] = await response.json();
      return following;
    } catch (error) {
      console.error('Get user following error:', error);
      throw error;
    }
  },

  // Check if current user is following a specific user
  isFollowing: async (userId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follows/is-following/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to check follow status');
      }

      const result = await response.json();
      return result.isFollowing || false;
    } catch (error) {
      console.error('Check follow status error:', error);
      throw error;
    }
  },

  // Get follow statistics (followers count, following count)
  getFollowStats: async (userId?: number): Promise<{ followersCount: number; followingCount: number }> => {
    try {
      const endpoint = userId 
        ? `${API_BASE_URL}/api/v1/follows/user/${userId}/stats`
        : `${API_BASE_URL}/api/v1/follows/stats`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch follow statistics');
      }

      const stats = await response.json();
      return stats;
    } catch (error) {
      console.error('Get follow stats error:', error);
      throw error;
    }
  },
};

export default FollowService;
