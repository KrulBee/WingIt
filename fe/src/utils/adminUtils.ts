/**
 * Utility functions for checking admin status and filtering admin users
 */

import AdminService from '@/services/AdminService';

/**
 * Check if a user ID belongs to an admin user
 * This is a workaround since the user API doesn't return role information
 */
export const isUserAdmin = async (userId: number): Promise<boolean> => {
  try {
    // This is a workaround - we'll need to check if they have admin access
    // In a real scenario, this should be handled at the backend level
    // For now, we'll maintain a cache of known admin users
    const adminCache = getAdminCache();
    
    if (adminCache.has(userId)) {
      return adminCache.get(userId) === true;
    }

    // We can't easily check individual users without their token
    // So we'll rely on backend filtering
    return false;
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
};

/**
 * Simple cache for admin user status
 */
const adminUserCache = new Map<number, boolean>();

export const getAdminCache = () => adminUserCache;

export const markUserAsAdmin = (userId: number) => {
  adminUserCache.set(userId, true);
};

export const markUserAsNonAdmin = (userId: number) => {
  adminUserCache.set(userId, false);
};

/**
 * Filter out admin users from a list of users
 * This is a client-side filter that should ideally be done at the backend
 */
export const filterNonAdminUsers = <T extends { id: number; username: string }>(users: T[]): T[] => {
  return users.filter(user => {
    // Basic heuristic - exclude users with admin-like usernames
    // This is not perfect but provides some protection
    const adminPatterns = [
      /^admin/i,
      /administrator/i,
      /^root/i,
      /^super/i,
      /^mod/i,
      /moderator/i,
      /^system/i,
      /^support/i
    ];
    
    const hasAdminPattern = adminPatterns.some(pattern => pattern.test(user.username));
    
    // Also check our cache
    const cachedStatus = adminUserCache.get(user.id);
    const isCachedAdmin = cachedStatus === true;
    
    return !hasAdminPattern && !isCachedAdmin;
  });
};

/**
 * Check if current user has admin access and cache their status
 */
export const checkAndCacheCurrentUserAdminStatus = async (): Promise<boolean> => {
  try {
    const access = await AdminService.checkAdminAccess();
    
    // If we can get current user info, cache it
    const { AuthService } = await import('@/services');
    const currentUser = await AuthService.getCurrentUser();
    
    if (access.hasAdminAccess || access.hasFullAdminAccess) {
      markUserAsAdmin(currentUser.id);
      return true;
    } else {
      markUserAsNonAdmin(currentUser.id);
      return false;
    }  } catch {
    // Not an admin or error occurred
    return false;
  }
};
