"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface AuthCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface UserData {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

interface LoginResponse extends AuthResponse {
  user?: UserData;
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

const AuthService = {  signin: async (credentials: AuthCredentials): Promise<LoginResponse> => {
    console.log('🌐 AuthService.signin called');
    console.log('🎯 API URL:', `${API_BASE_URL}/api/v1/auth/login`);
    console.log('📝 Credentials:', { username: credentials.username, password: '***' });
    
    try {
      console.log('📡 Making login request...');
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Add credentials for CORS
        body: JSON.stringify(credentials),
      });

      console.log('📡 Response received:');
      console.log('✅ Status:', response.status);
      console.log('✅ Status Text:', response.statusText);
      console.log('✅ Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('❌ Response not OK, parsing error...');
        let errorData;
        try {
          errorData = await response.text();
          console.log('❌ Error response body:', errorData);
        } catch (parseError) {
          console.log('❌ Could not parse error response:', parseError);
          errorData = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorData || 'Login failed');
      }

      console.log('✅ Parsing successful response...');
      let authData: AuthResponse;
      try {
        authData = await response.json();
        console.log('✅ Auth data parsed successfully');
        console.log('🎫 Token preview:', authData.token ? authData.token.substring(0, 20) + '...' : 'No token');
      } catch (parseError) {
        console.log('❌ JSON parsing failed:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        console.log('💾 Storing token in localStorage...');
        localStorage.setItem('auth-token', authData.token);
        console.log('✅ Token stored successfully');
      }

      // Get user data after successful login
      try {
        console.log('👤 Fetching current user data...');
        const userData = await AuthService.getCurrentUser();
        console.log('✅ User data retrieved:', userData);
        return {
          token: authData.token,
          user: userData,
        };
      } catch (userError) {
        console.log('⚠️ Failed to get user data, but login successful:', userError);
        // If getting user data fails, still return login success
        return authData;
      }
    } catch (error) {
      console.error('❌ AuthService signin error:', error);
      throw error;
    }
  },
    signup: async (credentials: RegisterCredentials): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Add credentials for CORS
        body: JSON.stringify(credentials),
      });if (!response.ok) {
        let errorData;
        try {
          errorData = await response.text();
        } catch (parseError) {
          errorData = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorData || 'Registration failed');
      }

      let result;
      try {
        result = await response.text();
      } catch (parseError) {
        throw new Error('Invalid response format from server');
      }
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  logout: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: createAuthHeaders(),
        credentials: 'include', // Add credentials for CORS
      });

      // Clear token regardless of response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }

      if (!response.ok) {
        console.warn('Logout request failed, but token cleared locally');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear token even if request fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
    }
  },  getCurrentUser: async (): Promise<UserData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: createAuthHeaders(),
        credentials: 'include', // Add credentials for CORS
      });if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token is invalid, clear it
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
          }
        }
        throw new Error(`Failed to get user data: ${response.status} ${response.statusText}`);
      }

      let userData: UserData;
      try {
        userData = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response format from server');
      }
      return userData;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  isAuthenticated: (): boolean => {
    return getAuthToken() !== null;
  },

  getToken: (): string | null => {
    return getAuthToken();
  },
};

export default AuthService;
export { createAuthHeaders };
