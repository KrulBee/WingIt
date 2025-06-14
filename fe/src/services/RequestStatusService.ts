import { createAuthHeaders } from './AuthService';

export interface RequestStatus {
  id: number;
  statusName: string;
}

export interface RequestStatusCreateRequest {
  statusName: string;
}

export interface RequestStatusUpdateRequest {
  statusName: string;
}

export enum RequestStatusType {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

class RequestStatusService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/request-statuses`;

  // Get all request statuses
  async getAllRequestStatuses(): Promise<RequestStatus[]> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request statuses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching request statuses:', error);
      throw error;
    }
  }

  // Get request status by ID
  async getRequestStatusById(id: number): Promise<RequestStatus> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Request status not found');
        }
        throw new Error('Failed to fetch request status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching request status:', error);
      throw error;
    }
  }

  // Create a new request status (Admin only)
  async createRequestStatus(requestStatus: RequestStatusCreateRequest): Promise<RequestStatus> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(requestStatus),
      });

      if (!response.ok) {
        throw new Error('Failed to create request status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating request status:', error);
      throw error;
    }
  }

  // Update a request status (Admin only)
  async updateRequestStatus(id: number, requestStatus: RequestStatusUpdateRequest): Promise<RequestStatus> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(requestStatus),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Request status not found');
        }
        throw new Error('Failed to update request status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  // Delete a request status (Admin only)
  async deleteRequestStatus(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Request status not found');
        }
        throw new Error('Failed to delete request status');
      }
    } catch (error) {
      console.error('Error deleting request status:', error);
      throw error;
    }
  }

  // Get request status by name
  async getRequestStatusByName(statusName: string): Promise<RequestStatus | null> {
    try {
      const allStatuses = await this.getAllRequestStatuses();
      return allStatuses.find(status => 
        status.statusName.toLowerCase() === statusName.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error fetching request status by name:', error);
      throw error;
    }
  }

  // Check if a request status exists
  async requestStatusExists(statusName: string): Promise<boolean> {
    try {
      const status = await this.getRequestStatusByName(statusName);
      return status !== null;
    } catch (error) {
      console.error('Error checking request status existence:', error);
      throw error;
    }
  }

  // Get pending status
  async getPendingStatus(): Promise<RequestStatus> {
    try {
      const status = await this.getRequestStatusByName(RequestStatusType.PENDING);
      if (!status) {
        throw new Error('Pending status not found');
      }
      return status;
    } catch (error) {
      console.error('Error getting pending status:', error);
      throw error;
    }
  }

  // Get accepted status
  async getAcceptedStatus(): Promise<RequestStatus> {
    try {
      const status = await this.getRequestStatusByName(RequestStatusType.ACCEPTED);
      if (!status) {
        throw new Error('Accepted status not found');
      }
      return status;
    } catch (error) {
      console.error('Error getting accepted status:', error);
      throw error;
    }
  }

  // Get declined status
  async getDeclinedStatus(): Promise<RequestStatus> {
    try {
      const status = await this.getRequestStatusByName(RequestStatusType.DECLINED);
      if (!status) {
        throw new Error('Declined status not found');
      }
      return status;
    } catch (error) {
      console.error('Error getting declined status:', error);
      throw error;
    }
  }

  // Get cancelled status
  async getCancelledStatus(): Promise<RequestStatus> {
    try {
      const status = await this.getRequestStatusByName(RequestStatusType.CANCELLED);
      if (!status) {
        throw new Error('Cancelled status not found');
      }
      return status;
    } catch (error) {
      console.error('Error getting cancelled status:', error);
      throw error;
    }
  }

  // Get default request statuses
  getDefaultRequestStatuses(): RequestStatusType[] {
    return [
      RequestStatusType.PENDING,
      RequestStatusType.ACCEPTED,
      RequestStatusType.DECLINED,
      RequestStatusType.CANCELLED,
      RequestStatusType.EXPIRED
    ];
  }

  // Get status display information
  getStatusDisplayInfo(statusName: string): { color: string; icon: string; displayName: string } {
    const statusInfo: { [key: string]: { color: string; icon: string; displayName: string } } = {
      [RequestStatusType.PENDING]: { 
        color: 'warning', 
        icon: '⏳', 
        displayName: 'Pending' 
      },
      [RequestStatusType.ACCEPTED]: { 
        color: 'success', 
        icon: '✅', 
        displayName: 'Accepted' 
      },
      [RequestStatusType.DECLINED]: { 
        color: 'danger', 
        icon: '❌', 
        displayName: 'Declined' 
      },
      [RequestStatusType.CANCELLED]: { 
        color: 'secondary', 
        icon: '🚫', 
        displayName: 'Cancelled' 
      },
      [RequestStatusType.EXPIRED]: { 
        color: 'default', 
        icon: '⏰', 
        displayName: 'Expired' 
      }
    };

    return statusInfo[statusName.toUpperCase()] || { 
      color: 'default', 
      icon: '❓', 
      displayName: statusName 
    };
  }

  // Check if status is final (cannot be changed)
  isFinalStatus(statusName: string): boolean {
    const finalStatuses = [
      RequestStatusType.ACCEPTED,
      RequestStatusType.DECLINED,
      RequestStatusType.CANCELLED,
      RequestStatusType.EXPIRED
    ];
    return finalStatuses.includes(statusName.toUpperCase() as RequestStatusType);
  }

  // Check if status is actionable (user can take action)
  isActionableStatus(statusName: string): boolean {
    return statusName.toUpperCase() === RequestStatusType.PENDING;
  }

  // Get next possible statuses from current status
  getNextPossibleStatuses(currentStatus: string): RequestStatusType[] {
    const currentStatusUpper = currentStatus.toUpperCase() as RequestStatusType;
    
    switch (currentStatusUpper) {
      case RequestStatusType.PENDING:
        return [RequestStatusType.ACCEPTED, RequestStatusType.DECLINED, RequestStatusType.CANCELLED];
      case RequestStatusType.ACCEPTED:
      case RequestStatusType.DECLINED:
      case RequestStatusType.CANCELLED:
      case RequestStatusType.EXPIRED:
        return []; // Final statuses cannot be changed
      default:
        return [];
    }
  }

  // Validate status transition
  canTransitionTo(fromStatus: string, toStatus: string): boolean {
    const possibleStatuses = this.getNextPossibleStatuses(fromStatus);
    return possibleStatuses.includes(toStatus.toUpperCase() as RequestStatusType);
  }

  // Validate status name
  validateStatusName(statusName: string): { valid: boolean; message?: string } {
    if (!statusName || statusName.trim().length === 0) {
      return { valid: false, message: 'Status name cannot be empty' };
    }

    if (statusName.trim().length < 2) {
      return { valid: false, message: 'Status name must be at least 2 characters long' };
    }

    if (statusName.trim().length > 50) {
      return { valid: false, message: 'Status name cannot exceed 50 characters' };
    }

    // Check for valid characters (letters, spaces, underscores)
    const validCharacterPattern = /^[a-zA-Z\s_]+$/;
    if (!validCharacterPattern.test(statusName)) {
      return { valid: false, message: 'Status name can only contain letters, spaces, and underscores' };
    }

    return { valid: true };
  }
}

export default new RequestStatusService();
