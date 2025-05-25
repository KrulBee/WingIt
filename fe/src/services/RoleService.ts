import { createAuthHeaders } from './AuthService';

export interface Role {
  id: number;
  roleName: string;
}

export interface RoleCreateRequest {
  roleName: string;
}

export interface RoleUpdateRequest {
  roleName: string;
}

export enum RoleType {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

class RoleService {
  private baseURL = 'http://localhost:8080/api/roles';

  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(id: number): Promise<Role> {
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
          throw new Error('Role not found');
        }
        throw new Error('Failed to fetch role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  // Create a new role (Admin only)
  async createRole(role: RoleCreateRequest): Promise<Role> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(role),
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Update a role (Admin only)
  async updateRole(id: number, role: RoleUpdateRequest): Promise<Role> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(role),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Role not found');
        }
        throw new Error('Failed to update role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  // Delete a role (Admin only)
  async deleteRole(id: number): Promise<void> {
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
          throw new Error('Role not found');
        }
        throw new Error('Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Get role by name
  async getRoleByName(roleName: string): Promise<Role | null> {
    try {
      const allRoles = await this.getAllRoles();
      return allRoles.find(role => 
        role.roleName.toLowerCase() === roleName.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error fetching role by name:', error);
      throw error;
    }
  }

  // Check if a role exists
  async roleExists(roleName: string): Promise<boolean> {
    try {
      const role = await this.getRoleByName(roleName);
      return role !== null;
    } catch (error) {
      console.error('Error checking role existence:', error);
      throw error;
    }
  }

  // Get user role (default role for new users)
  async getUserRole(): Promise<Role> {
    try {
      const role = await this.getRoleByName(RoleType.USER);
      if (!role) {
        throw new Error('User role not found');
      }
      return role;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  }

  // Get admin role
  async getAdminRole(): Promise<Role> {
    try {
      const role = await this.getRoleByName(RoleType.ADMIN);
      if (!role) {
        throw new Error('Admin role not found');
      }
      return role;
    } catch (error) {
      console.error('Error getting admin role:', error);
      throw error;
    }
  }

  // Get moderator role
  async getModeratorRole(): Promise<Role> {
    try {
      const role = await this.getRoleByName(RoleType.MODERATOR);
      if (!role) {
        throw new Error('Moderator role not found');
      }
      return role;
    } catch (error) {
      console.error('Error getting moderator role:', error);
      throw error;
    }
  }

  // Get default roles
  getDefaultRoles(): RoleType[] {
    return [RoleType.USER, RoleType.ADMIN, RoleType.MODERATOR];
  }

  // Get role display information
  getRoleDisplayInfo(roleName: string): { color: string; icon: string; displayName: string; description: string } {
    const roleInfo: { [key: string]: { color: string; icon: string; displayName: string; description: string } } = {
      [RoleType.USER]: { 
        color: 'primary', 
        icon: '👤', 
        displayName: 'User',
        description: 'Regular user with basic privileges'
      },
      [RoleType.ADMIN]: { 
        color: 'danger', 
        icon: '👑', 
        displayName: 'Administrator',
        description: 'Full system access and management privileges'
      },
      [RoleType.MODERATOR]: { 
        color: 'warning', 
        icon: '🛡️', 
        displayName: 'Moderator',
        description: 'Content moderation and user management privileges'
      }
    };

    return roleInfo[roleName.toLowerCase()] || { 
      color: 'default', 
      icon: '❓', 
      displayName: roleName,
      description: 'Custom role'
    };
  }

  // Check if role has admin privileges
  isAdminRole(roleName: string): boolean {
    return roleName.toLowerCase() === RoleType.ADMIN;
  }

  // Check if role has moderator privileges
  isModeratorRole(roleName: string): boolean {
    return roleName.toLowerCase() === RoleType.MODERATOR;
  }

  // Check if role has elevated privileges (admin or moderator)
  hasElevatedPrivileges(roleName: string): boolean {
    return this.isAdminRole(roleName) || this.isModeratorRole(roleName);
  }

  // Get role hierarchy level (higher number = more privileges)
  getRoleLevel(roleName: string): number {
    const levels: { [key: string]: number } = {
      [RoleType.USER]: 1,
      [RoleType.MODERATOR]: 2,
      [RoleType.ADMIN]: 3
    };
    
    return levels[roleName.toLowerCase()] || 0;
  }

  // Check if user can assign a role (can only assign roles of lower level)
  canAssignRole(userRole: string, targetRole: string): boolean {
    const userLevel = this.getRoleLevel(userRole);
    const targetLevel = this.getRoleLevel(targetRole);
    
    return userLevel > targetLevel;
  }

  // Get assignable roles for a user
  async getAssignableRoles(userRole: string): Promise<Role[]> {
    try {
      const allRoles = await this.getAllRoles();
      const userLevel = this.getRoleLevel(userRole);
      
      return allRoles.filter(role => {
        const roleLevel = this.getRoleLevel(role.roleName);
        return roleLevel < userLevel;
      });
    } catch (error) {
      console.error('Error getting assignable roles:', error);
      throw error;
    }
  }

  // Get role permissions (placeholder for future implementation)
  getRolePermissions(roleName: string): string[] {
    const permissions: { [key: string]: string[] } = {
      [RoleType.USER]: [
        'read_posts',
        'create_posts',
        'comment_posts',
        'react_posts',
        'send_messages',
        'add_friends',
        'update_profile'
      ],
      [RoleType.MODERATOR]: [
        'read_posts',
        'create_posts',
        'comment_posts',
        'react_posts',
        'send_messages',
        'add_friends',
        'update_profile',
        'moderate_posts',
        'moderate_comments',
        'ban_users',
        'view_reports'
      ],
      [RoleType.ADMIN]: [
        'read_posts',
        'create_posts',
        'comment_posts',
        'react_posts',
        'send_messages',
        'add_friends',
        'update_profile',
        'moderate_posts',
        'moderate_comments',
        'ban_users',
        'view_reports',
        'manage_users',
        'manage_roles',
        'system_settings',
        'view_analytics'
      ]
    };

    return permissions[roleName.toLowerCase()] || [];
  }

  // Check if role has specific permission
  hasPermission(roleName: string, permission: string): boolean {
    const rolePermissions = this.getRolePermissions(roleName);
    return rolePermissions.includes(permission);
  }

  // Validate role name
  validateRoleName(roleName: string): { valid: boolean; message?: string } {
    if (!roleName || roleName.trim().length === 0) {
      return { valid: false, message: 'Role name cannot be empty' };
    }

    if (roleName.trim().length < 2) {
      return { valid: false, message: 'Role name must be at least 2 characters long' };
    }

    if (roleName.trim().length > 50) {
      return { valid: false, message: 'Role name cannot exceed 50 characters' };
    }

    // Check for valid characters (letters, spaces, underscores, hyphens)
    const validCharacterPattern = /^[a-zA-Z\s_-]+$/;
    if (!validCharacterPattern.test(roleName)) {
      return { valid: false, message: 'Role name can only contain letters, spaces, underscores, and hyphens' };
    }

    return { valid: true };
  }
}

export default new RoleService();
