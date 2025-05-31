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

// Helper function to create headers for file upload
const createFileUploadHeaders = () => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// TypeScript interfaces matching backend DTOs
interface UserData {
  id: number;
  username: string;
  password?: string; // Only for internal use
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  dateOfBirth?: string; // ISO format: YYYY-MM-DD
}

interface UpdateUserProfileRequest {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  dateOfBirth?: string; // ISO format: YYYY-MM-DD
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const UserService = {
  // Get all users
  getAllUsers: async (): Promise<UserData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users: UserData[] = await response.json();
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<UserData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData: UserData = await response.json();
      return userData;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Get user by username
  getUserByUsername: async (username: string): Promise<UserData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/username/${username}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user by username');
      }

      const userData: UserData = await response.json();
      return userData;
    } catch (error) {
      console.error('Get user by username error:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUserProfile: async (): Promise<UserData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current user profile');
      }

      const userData: UserData = await response.json();
      return userData;
    } catch (error) {
      console.error('Get current user profile error:', error);
      throw error;
    }
  },

  // Update current user profile
  updateUserProfile: async (userData: UpdateUserProfileRequest): Promise<UserData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      const updatedUserData: UserData = await response.json();
      return updatedUserData;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  },

  // Update user profile by ID (admin function)
  updateUserProfileById: async (userId: number, userData: UpdateUserProfileRequest): Promise<UserData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      const updatedUserData: UserData = await response.json();
      return updatedUserData;
    } catch (error) {
      console.error('Update user profile by ID error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const request: ChangePasswordRequest = {
        currentPassword,
        newPassword,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/users/change-password`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile-picture`, {
        method: 'POST',
        headers: createFileUploadHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },
  // Delete profile picture
  deleteProfilePicture: async (url: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile-picture?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile picture');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete profile picture error:', error);
      throw error;
    }
  },

  // Upload cover photo
  uploadCoverPhoto: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/v1/users/cover-photo`, {
        method: 'POST',
        headers: createFileUploadHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload cover photo');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload cover photo error:', error);
      throw error;
    }
  },

  // Delete cover photo
  deleteCoverPhoto: async (url: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/cover-photo?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete cover photo');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete cover photo error:', error);
      throw error;
    }
  },

  // Delete user (admin function)
  deleteUser: async (userId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Backward compatibility methods
  getUserProfile: async (userId: number): Promise<UserData> => {
    return UserService.getUserById(userId);
  },

  searchUsers: async (query: string): Promise<UserData[]> => {
    try {
      // Note: This endpoint may need to be implemented on the backend
      const response = await fetch(`${API_BASE_URL}/api/v1/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const users: UserData[] = await response.json();
      return users;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  },
};

export default UserService;
