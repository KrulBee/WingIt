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
interface ReportData {
  id?: number;
  reporterId?: number;
  reportedUserId?: number;
  postId?: number;
  commentId?: number;
  reason: string;
  description?: string;
  status?: string; // PENDING, REVIEWED, RESOLVED, DISMISSED
  createdAt?: string;
  updatedAt?: string;
}

interface CreateReportRequest {
  reportedUserId?: number;
  postId?: number;
  commentId?: number;
  reason: string;
  description?: string;
}

const ReportService = {
  // Create a new report
  createReport: async (reportData: CreateReportRequest): Promise<ReportData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const report: ReportData = await response.json();
      return report;
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  },

  // Get all reports (admin function)
  getAllReports: async (): Promise<ReportData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const reports: ReportData[] = await response.json();
      return reports;
    } catch (error) {
      console.error('Get all reports error:', error);
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (reportId: number): Promise<ReportData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const report: ReportData = await response.json();
      return report;
    } catch (error) {
      console.error('Get report error:', error);
      throw error;
    }
  },

  // Delete report (admin function)
  deleteReport: async (reportId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  },

  // Report a user
  reportUser: async (userId: number, reason: string, description?: string): Promise<ReportData> => {
    const reportData: CreateReportRequest = {
      reportedUserId: userId,
      reason,
      description,
    };
    return await ReportService.createReport(reportData);
  },

  // Report a post
  reportPost: async (postId: number, reason: string, description?: string): Promise<ReportData> => {
    const reportData: CreateReportRequest = {
      postId,
      reason,
      description,
    };
    return await ReportService.createReport(reportData);
  },

  // Report a comment
  reportComment: async (commentId: number, reason: string, description?: string): Promise<ReportData> => {
    const reportData: CreateReportRequest = {
      commentId,
      reason,
      description,
    };
    return await ReportService.createReport(reportData);
  },

  // Get reports by status (admin function)
  getReportsByStatus: async (status: string): Promise<ReportData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/status/${status}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports by status');
      }

      const reports: ReportData[] = await response.json();
      return reports;
    } catch (error) {
      console.error('Get reports by status error:', error);
      throw error;
    }
  },

  // Update report status (admin function)
  updateReportStatus: async (reportId: number, status: string): Promise<ReportData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      const report: ReportData = await response.json();
      return report;
    } catch (error) {
      console.error('Update report status error:', error);
      throw error;
    }
  },
};

export default ReportService;
