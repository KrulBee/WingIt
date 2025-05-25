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

export interface ReactionType {
  id: number;
  typeName: string;
  iconUrl?: string;
  description?: string;
}

const ReactionTypeService = {
  // Get all reaction types
  getAllReactionTypes: async (): Promise<ReactionType[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reaction-types`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch reaction types');
      return await response.json();
    } catch (error) {
      console.error('Get all reaction types error:', error);
      throw error;
    }
  },

  // Get reaction type by ID
  getReactionTypeById: async (id: number): Promise<ReactionType> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reaction-types/${id}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch reaction type');
      return await response.json();
    } catch (error) {
      console.error('Get reaction type error:', error);
      throw error;
    }
  },

  // Cache for reaction types to avoid repeated API calls
  _reactionTypesCache: null as ReactionType[] | null,

  // Get cached reaction types or fetch from API
  getCachedReactionTypes: async (): Promise<ReactionType[]> => {
    if (ReactionTypeService._reactionTypesCache) {
      return ReactionTypeService._reactionTypesCache;
    }
    
    const reactionTypes = await ReactionTypeService.getAllReactionTypes();
    ReactionTypeService._reactionTypesCache = reactionTypes;
    return reactionTypes;
  },

  // Clear cache (useful when reaction types are updated)
  clearCache: (): void => {
    ReactionTypeService._reactionTypesCache = null;
  },

  // Get reaction type by name
  getReactionTypeByName: async (typeName: string): Promise<ReactionType | null> => {
    try {
      const reactionTypes = await ReactionTypeService.getCachedReactionTypes();
      return reactionTypes.find(type => type.typeName.toLowerCase() === typeName.toLowerCase()) || null;
    } catch (error) {
      console.error('Get reaction type by name error:', error);
      throw error;
    }
  },

  // Get default reaction types (commonly used ones)
  getDefaultReactionTypes: async (): Promise<ReactionType[]> => {
    try {
      const reactionTypes = await ReactionTypeService.getCachedReactionTypes();
      // Assuming common reaction types like 'like', 'love', 'angry', etc.
      const defaultTypes = ['like', 'love', 'angry', 'sad', 'laugh'];
      return reactionTypes.filter(type => 
        defaultTypes.includes(type.typeName.toLowerCase())
      );
    } catch (error) {
      console.error('Get default reaction types error:', error);
      throw error;
    }
  },
};

export default ReactionTypeService;
