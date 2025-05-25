import { createAuthHeaders } from './AuthService';

export interface PostType {
  id: number;
  typeName: string;
}

export interface PostTypeCreateRequest {
  typeName: string;
}

export interface PostTypeUpdateRequest {
  typeName: string;
}

class PostTypeService {
  private baseURL = 'http://localhost:8080/api/post-types';

  // Get all post types
  async getAllPostTypes(): Promise<PostType[]> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post types');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching post types:', error);
      throw error;
    }
  }

  // Get post type by ID
  async getPostTypeById(id: number): Promise<PostType> {
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
          throw new Error('Post type not found');
        }
        throw new Error('Failed to fetch post type');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching post type:', error);
      throw error;
    }
  }

  // Create a new post type (Admin only)
  async createPostType(postType: PostTypeCreateRequest): Promise<PostType> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(postType),
      });

      if (!response.ok) {
        throw new Error('Failed to create post type');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating post type:', error);
      throw error;
    }
  }

  // Update a post type (Admin only)
  async updatePostType(id: number, postType: PostTypeUpdateRequest): Promise<PostType> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(postType),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post type not found');
        }
        throw new Error('Failed to update post type');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating post type:', error);
      throw error;
    }
  }

  // Delete a post type (Admin only)
  async deletePostType(id: number): Promise<void> {
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
          throw new Error('Post type not found');
        }
        throw new Error('Failed to delete post type');
      }
    } catch (error) {
      console.error('Error deleting post type:', error);
      throw error;
    }
  }

  // Get post types by name pattern (for filtering/searching)
  async searchPostTypes(namePattern: string): Promise<PostType[]> {
    try {
      const allPostTypes = await this.getAllPostTypes();
      return allPostTypes.filter(postType => 
        postType.typeName.toLowerCase().includes(namePattern.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching post types:', error);
      throw error;
    }
  }

  // Check if a post type name exists
  async postTypeNameExists(typeName: string): Promise<boolean> {
    try {
      const allPostTypes = await this.getAllPostTypes();
      return allPostTypes.some(postType => 
        postType.typeName.toLowerCase() === typeName.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking post type name:', error);
      throw error;
    }
  }

  // Get default post types (common ones like "text", "image", "video")
  getDefaultPostTypes(): string[] {
    return ['text', 'image', 'video', 'poll', 'event', 'share'];
  }

  // Get post type display name (for UI)
  getPostTypeDisplayName(typeName: string): string {
    const displayNames: { [key: string]: string } = {
      'text': 'Text Post',
      'image': 'Photo Post',
      'video': 'Video Post',
      'poll': 'Poll',
      'event': 'Event',
      'share': 'Shared Post',
    };
    
    return displayNames[typeName.toLowerCase()] || typeName;
  }

  // Get post type icon (for UI)
  getPostTypeIcon(typeName: string): string {
    const icons: { [key: string]: string } = {
      'text': '📝',
      'image': '📷',
      'video': '🎥',
      'poll': '📊',
      'event': '📅',
      'share': '🔄',
    };
    
    return icons[typeName.toLowerCase()] || '📄';
  }
}

export default new PostTypeService();
