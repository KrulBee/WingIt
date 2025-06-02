export interface UserSettings {
  userId: number;
  privacyLevel: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowSearchEngines: boolean;
}

export interface UpdateSettingsRequest {
  privacyLevel?: 'public' | 'friends' | 'private';
  showOnlineStatus?: boolean;
  allowSearchEngines?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

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

class SettingsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }
  /**
   * Get user settings by user ID
   */
  async getUserSettings(userId: number): Promise<UserSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/settings`, {
        method: 'GET',
        headers: createAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const settings = await response.json();
      return settings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }
  /**
   * Update user settings
   */
  async updateUserSettings(userId: number, settings: UpdateSettingsRequest): Promise<UserSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/settings`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ ...settings, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedSettings = await response.json();
      return updatedSettings;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }
  /**
   * Update a specific setting
   */
  async updateSpecificSetting(
    userId: number,
    settingName: string,
    value: boolean | string
  ): Promise<UserSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/settings/${settingName}`, {
        method: 'PATCH',
        headers: createAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedSettings = await response.json();
      return updatedSettings;
    } catch (error) {
      console.error('Error updating specific setting:', error);
      throw error;
    }
  }
  /**
   * Reset user settings to defaults
   */
  async resetUserSettings(userId: number): Promise<UserSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/settings/reset`, {
        method: 'POST',
        headers: createAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const defaultSettings = await response.json();
      return defaultSettings;
    } catch (error) {
      console.error('Error resetting user settings:', error);
      throw error;
    }
  }
  /**
   * Delete user settings
   */
  async deleteUserSettings(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/settings`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting user settings:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
