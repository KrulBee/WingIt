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

// TypeScript interfaces matching backend DTOs
interface UserDTO {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

interface FriendDTO {
  id: number;
  friend: UserDTO; // The other user in the friendship
  friendshipDate: string; // ISO date string
}

interface FriendRequestDTO {
  id: number;
  sender: UserDTO;
  receiver: UserDTO;
  status: string; // PENDING, ACCEPTED, DECLINED
  requestDate: string; // ISO date string
  responseDate?: string; // ISO date string
}

// Backward compatibility interfaces
interface Friend {
  id: number;
  username: string;
  displayName?: string;
  profilePicture?: string;
  friendshipDate?: string;
}

interface FriendRequest {
  id: number;
  sender: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  receiver: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  status: string;
  requestDate: string;
  responseDate?: string;
}

const FriendService = {
  // Get current user's friends
  getFriends: async (): Promise<FriendDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }

      const friends: FriendDTO[] = await response.json();
      return friends;
    } catch (error) {
      console.error('Get friends error:', error);
      throw error;
    }
  },

  // Get friends by user ID
  getFriendsByUserId: async (userId: number): Promise<FriendDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/user/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friends by user ID');
      }

      const friends: FriendDTO[] = await response.json();
      return friends;
    } catch (error) {
      console.error('Get friends by user ID error:', error);
      throw error;
    }
  },

  // Send friend request
  sendFriendRequest: async (receiverId: number): Promise<FriendRequestDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/send-request/${receiverId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }

      const request: FriendRequestDTO = await response.json();
      return request;
    } catch (error) {
      console.error('Send friend request error:', error);
      throw error;
    }
  },

  // Get sent friend requests
  getSentFriendRequests: async (): Promise<FriendRequestDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/requests/sent`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sent friend requests');
      }

      const requests: FriendRequestDTO[] = await response.json();
      return requests;
    } catch (error) {
      console.error('Get sent friend requests error:', error);
      throw error;
    }
  },

  // Get received friend requests
  getReceivedFriendRequests: async (): Promise<FriendRequestDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/requests/received`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch received friend requests');
      }

      const requests: FriendRequestDTO[] = await response.json();
      return requests;
    } catch (error) {
      console.error('Get received friend requests error:', error);
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: number): Promise<FriendDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }

      const friendship: FriendDTO = await response.json();
      return friendship;
    } catch (error) {
      console.error('Accept friend request error:', error);
      throw error;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (requestId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to reject friend request');
      }
    } catch (error) {
      console.error('Reject friend request error:', error);
      throw error;
    }
  },

  // Remove friend
  removeFriend: async (friendId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/${friendId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }
    } catch (error) {
      console.error('Remove friend error:', error);
      throw error;
    }
  },

  // Backward compatibility methods
  respondToFriendRequest: async (requestId: number, accept: boolean): Promise<FriendRequestDTO | FriendDTO> => {
    if (accept) {
      return await FriendService.acceptFriendRequest(requestId);
    } else {
      await FriendService.rejectFriendRequest(requestId);
      // Return a mock response for rejection since backend returns void
      return {
        id: requestId,
        sender: { id: 0, username: '', displayName: '', profilePicture: '' },
        receiver: { id: 0, username: '', displayName: '', profilePicture: '' },
        status: 'DECLINED',
        requestDate: new Date().toISOString(),
        responseDate: new Date().toISOString(),
      } as FriendRequestDTO;
    }
  },

  cancelFriendRequest: async (requestId: number): Promise<void> => {
    try {
      // Note: This endpoint may need to be implemented on the backend
      const response = await fetch(`${API_BASE_URL}/api/v1/friend-requests/${requestId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Cancel friend request error:', error);
      throw error;
    }
  },
};

export default FriendService;
