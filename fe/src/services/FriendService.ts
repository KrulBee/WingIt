"use client";

import { filterNonAdminUsers } from '@/utils/adminUtils';

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
  } else {
    console.warn('No auth token found when creating headers');
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

// Backward compatibility interfaces (kept for potential future use)
// interface Friend {
//   id: number;
//   username: string;
//   displayName?: string;
//   profilePicture?: string;
//   friendshipDate?: string;
// }

// interface FriendRequest {
//   id: number;
//   sender: {
//     id: number;
//     username: string;
//     displayName?: string;
//     profilePicture?: string;
//   };
//   receiver: {
//     id: number;
//     username: string;
//     displayName?: string;
//     profilePicture?: string;
//   };
//   status: string;
//   requestDate: string;
//   responseDate?: string;
// }

const FriendService = {
  // Get current user's friends
  getFriends: async (): Promise<FriendDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {        let errorMessage = 'Failed to fetch friends';
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Ignore parsing errors
        }
        throw new Error(`${response.status}: ${errorMessage}`);
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
  },  // Send friend request
  sendFriendRequest: async (receiverId: number): Promise<FriendRequestDTO> => {
    try {
      // Validate input
      if (!receiverId || receiverId <= 0) {
        throw new Error('Invalid receiver ID provided');
      }

      // Check if user is authenticated
      const token = getAuthToken();
      if (!token) {
        throw new Error('User not authenticated. Please log in again.');
      }

      console.log('Sending friend request to user ID:', receiverId);
      console.log('API URL:', `${API_BASE_URL}/api/v1/friends/send-request/${receiverId}`);
      console.log('Auth token present:', !!token);

      const headers = createAuthHeaders();
      console.log('Request headers:', Object.fromEntries(Object.entries(headers)));

      const response = await fetch(`${API_BASE_URL}/api/v1/friends/send-request/${receiverId}`, {
        method: 'POST',
        headers: headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (parseError) {
          errorText = 'Unable to parse error response';
        }
        
        console.error('Friend request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: `${API_BASE_URL}/api/v1/friends/send-request/${receiverId}`,
          headers: Object.fromEntries(Object.entries(headers))
        });

        // Handle specific error cases
        if (response.status === 400) {
          if (errorText.includes('already exists') || errorText.includes('duplicate')) {
            throw new Error('Friend request already exists or you are already friends with this user.');
          } else if (errorText.includes('self') || errorText.includes('same user')) {
            throw new Error('Cannot send friend request to yourself.');
          } else if (errorText.includes('blocked')) {
            throw new Error('Unable to send friend request to this user.');
          } else {
            throw new Error(`Bad request: ${errorText || 'Invalid request data'}`);
          }
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to send friend requests.');
        } else if (response.status === 404) {
          throw new Error('User not found. They may have deleted their account.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait before sending another friend request.');
        } else {
          throw new Error(`Failed to send friend request: ${response.status} ${errorText || response.statusText}`);
        }
      }

      let request: FriendRequestDTO;
      try {
        request = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('Friend request sent successfully:', request);
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
        let errorMessage = 'Failed to remove friend';        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Ignore parsing errors
        }
        throw new Error(`${response.status}: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Remove friend error:', error);
      throw error;
    }
  },
  // Get friend suggestions
  getFriendSuggestions: async (): Promise<UserDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/friends/suggestions`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friend suggestions');
      }

      const suggestions: UserDTO[] = await response.json();
      
      // Filter out admin users from suggestions
      const filteredSuggestions = filterNonAdminUsers(suggestions);
      
      return filteredSuggestions;
    } catch (error) {
      console.error('Get friend suggestions error:', error);
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
