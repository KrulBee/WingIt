import { createAuthHeaders } from './AuthService';

export interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalPosts: number;
  newPostsThisMonth: number;
  totalComments: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  createdDate: string;
  role?: {
    id: number;
    roleName: string;
  };
}

export interface AdminPost {
  id: number;
  content: string;
  createdDate: string;
  updatedAt?: string;
  author: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  type: {
    id: number;
    typeName: string;
  };
  location: {
    id: number;
    location: string;
  };
  media?: Array<{
    id: number;
    mediaUrl: string;
    mediaType: string;
  }>;  likesCount: number;
  commentsCount: number;
}

export interface AdminReport {
  id: number;
  reportType: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  reportedBy: {
    id: number;
    username: string;
    displayName: string;
  };
  targetUser?: {
    id: number;
    username: string;
    displayName: string;
  };
  targetPost?: {
    id: number;
    content: string;
  };
  targetComment?: {
    id: number;
    content: string;
  };
  createdDate: string;
  resolvedDate?: string;
  resolvedBy?: {
    id: number;
    username: string;
    displayName: string;
  };
}

export interface SystemAnalytics {
  userGrowth: Record<string, number>;
  postGrowth: Record<string, number>;
  reportDistribution: Record<string, number>;
}

export interface AdminAccess {
  hasAdminAccess: boolean;
  hasFullAdminAccess: boolean;
  role?: string;
  roleId?: number;
}

export interface UpdateReportStatusRequest {
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  notes?: string;
}

class AdminService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin`;

  // Check admin access
  async checkAdminAccess(): Promise<AdminAccess> {
    try {
      const response = await fetch(`${this.baseURL}/check-access`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check admin access');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking admin access:', error);
      throw error;
    }
  }
  // Get dashboard statistics
  async getDashboardStats(): Promise<AdminStats> {
    try {
      console.log('AdminService: Making request to dashboard stats endpoint...');
      const headers = {
        'Content-Type': 'application/json',
        ...createAuthHeaders(),
      };
      console.log('AdminService: Request headers:', headers);
      
      const response = await fetch(`${this.baseURL}/dashboard/stats`, {
        method: 'GET',
        headers,
      });

      console.log('AdminService: Response status:', response.status);
      console.log('AdminService: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('AdminService: Error response body:', errorText);
        throw new Error(`Failed to fetch dashboard stats: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('AdminService: Dashboard stats data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get all users
  async getAllUsers(page: number = 0, size: number = 20): Promise<AdminUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/users?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId: number, roleId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Get all reports
  async getAllReports(status?: string, page: number = 0, size: number = 20): Promise<AdminReport[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await fetch(`${this.baseURL}/reports?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  // Update report status
  async updateReportStatus(reportId: number, request: UpdateReportStatusRequest): Promise<AdminReport> {
    try {
      const response = await fetch(`${this.baseURL}/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update report status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  // Delete report
  async deleteReport(reportId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  // Delete post
  async deletePost(postId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Get all posts
  async getAllPosts(page: number = 0, size: number = 20): Promise<AdminPost[]> {
    try {
      const response = await fetch(`${this.baseURL}/posts?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  // Get system analytics
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    try {
      const response = await fetch(`${this.baseURL}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  }
}

export default new AdminService();
