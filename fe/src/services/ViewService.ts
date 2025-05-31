// ViewService.ts - Client-side view tracking system with backend integration
"use client";

interface PostView {
  postId: string;
  userId?: string;
  viewedAt: Date;
  duration?: number; // Time spent viewing (in milliseconds)
  source: 'feed' | 'modal' | 'profile' | 'search' | 'bookmark' | 'notification';
  sessionId?: string;
}

interface ViewSession {
  postId: string;
  startTime: Date;
  endTime?: Date;
  source: string;
  sessionId?: string;
}

interface ViewStats {
  totalViews: number;
  uniqueViews: number;
  viewsBySource: Record<string, number>;
  averageDuration: number;
  recentViews: PostView[];
}

interface BackendPostView {
  id?: number;
  postId: number;
  userId?: number;
  viewSource: string;
  durationMs?: number;
  viewedAt: string;
  sessionId?: string;
}

interface CreatePostViewRequest {
  viewSource: string;
  durationMs?: number;
  sessionId?: string;
}

class ViewService {
  private static instance: ViewService;
  private viewedPosts: Set<string> = new Set();
  private postViews: PostView[] = [];
  private activeSessions: Map<string, ViewSession> = new Map();
  private readonly STORAGE_KEY = 'wingit_post_views';
  private readonly SESSION_KEY = 'wingit_view_sessions';
  private readonly MAX_STORED_VIEWS = 1000; // Limit storage size
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  static getInstance(): ViewService {
    if (!ViewService.instance) {
      ViewService.instance = new ViewService();
    }
    return ViewService.instance;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  /**
   * Create headers with authentication
   */
  private createAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Track a post view with backend integration
   */async trackView(
    postId: string, 
    source: PostView['source'] = 'feed', 
    userId?: string
  ): Promise<void> {
    try {
      console.log(`🔍 DEBUG: trackView called with postId=${postId}, source=${source}, userId=${userId}`);
      const now = new Date();

      // Check if we've already tracked this view recently (within 5 minutes)
      const recentView = this.postViews.find(view => 
        view.postId === postId && 
        view.source === source &&
        (now.getTime() - view.viewedAt.getTime()) < 5 * 60 * 1000 // 5 minutes
      );

      if (!recentView) {
        console.log(`🔍 DEBUG: No recent view found, creating new view for post ${postId}`);
      } else {
        console.log(`🔍 DEBUG: Recent view found, skipping duplicate for post ${postId}`);
        return;
      }

      if (!recentView) {
        const sessionId = this.generateSessionId();
        const view: PostView = {
          postId,
          userId,
          viewedAt: now,
          source,
          sessionId
        };        // Track locally first (immediate feedback)
        this.postViews.push(view);
        this.viewedPosts.add(postId);
        
        console.log(`🔍 DEBUG: View added locally. Total views now: ${this.postViews.length}`);
        
        // Keep only recent views in memory
        if (this.postViews.length > this.MAX_STORED_VIEWS) {
          this.postViews = this.postViews.slice(-this.MAX_STORED_VIEWS);
        }

        this.saveToStorage();

        // Try to send to backend
        try {
          console.log(`🔍 DEBUG: Attempting to send view to backend: ${this.API_BASE_URL}/posts/${postId}`);
          const request: CreatePostViewRequest = {
            viewSource: source,
            sessionId
          };          const response = await fetch(`${this.API_BASE_URL}/api/v1/post-views/posts/${postId}`, {
            method: 'POST',
            headers: this.createAuthHeaders(),
            body: JSON.stringify(request)
          });if (response.ok) {
            const backendView: BackendPostView = await response.json();
            // Update local view with backend ID if needed
            view.sessionId = backendView.sessionId;
            console.log(`✅ DEBUG: View successfully sent to backend for post ${postId}`);
          } else {
            console.warn(`⚠️ DEBUG: Failed to track view on backend (${response.status}):`, response.statusText);
          }
        } catch (error) {
          console.warn('⚠️ DEBUG: Backend view tracking failed, using local tracking only:', error);
        }

        // Emit custom event for analytics
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('postView', {
            detail: { postId, source, timestamp: now }
          }));
        }

        console.log(`📊 View tracked: Post ${postId} from ${source}`);
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  /**
   * Track modal view with duration tracking and backend integration
   */
  async trackModalView(
    postId: string, 
    source: PostView['source'] = 'modal',
    userId?: string
  ): Promise<() => void> {
    const sessionId = this.generateSessionId();
    const session: ViewSession = {
      postId,
      startTime: new Date(),
      source,
      sessionId
    };

    this.activeSessions.set(postId, session);

    // Track the initial view
    await this.trackView(postId, source, userId);

    // Return cleanup function
    return async () => {
      const activeSession = this.activeSessions.get(postId);
      if (activeSession) {
        activeSession.endTime = new Date();
        const duration = activeSession.endTime.getTime() - activeSession.startTime.getTime();

        // Update local view with duration
        const localView = this.postViews.find(view => 
          view.postId === postId && view.sessionId === sessionId
        );
        if (localView) {
          localView.duration = duration;
        }

        // Try to update backend with duration
        try {
          const request: CreatePostViewRequest = {
            viewSource: source,
            durationMs: duration,
            sessionId
          };          const response = await fetch(`${this.API_BASE_URL}/api/v1/post-views/posts/${postId}`, {
            method: 'PUT',
            headers: this.createAuthHeaders(),
            body: JSON.stringify(request)
          });

          if (!response.ok) {
            console.warn('Failed to update view duration on backend:', response.statusText);
          }
        } catch (error) {
          console.warn('Backend duration update failed:', error);
        }

        this.activeSessions.delete(postId);
        this.saveToStorage();
      }
    };
  }

  /**
   * Start a view session (for tracking duration)
   */
  startViewSession(postId: string, source: string): void {
    try {
      const sessionKey = `${postId}-${source}`;
      
      if (!this.activeSessions.has(sessionKey)) {
        const session: ViewSession = {
          postId,
          startTime: new Date(),
          source
        };
        
        this.activeSessions.set(sessionKey, session);
        console.log(`📊 View session started: Post ${postId} from ${source}`);
      }
    } catch (error) {
      console.error('Error starting view session:', error);
    }
  }

  /**
   * End a view session and calculate duration
   */
  endViewSession(postId: string, source: string): number | null {
    try {
      const sessionKey = `${postId}-${source}`;
      const session = this.activeSessions.get(sessionKey);
      
      if (session) {
        const endTime = new Date();
        const duration = endTime.getTime() - session.startTime.getTime();
        
        session.endTime = endTime;
        
        // Update the corresponding view with duration
        const viewIndex = this.postViews.findIndex(view =>
          view.postId === postId &&
          view.source === source &&
          Math.abs(view.viewedAt.getTime() - session.startTime.getTime()) < 1000 // Within 1 second
        );
        
        if (viewIndex !== -1) {
          this.postViews[viewIndex].duration = duration;
          this.saveToStorage();
        }
        
        this.activeSessions.delete(sessionKey);
        
        console.log(`📊 View session ended: Post ${postId} from ${source}, Duration: ${duration}ms`);
        return duration;
      }
      
      return null;
    } catch (error) {
      console.error('Error ending view session:', error);
      return null;
    }
  }

  /**
   * Check if a post has been viewed
   */
  hasViewed(postId: string): boolean {
    return this.viewedPosts.has(postId);
  }

  /**
   * Get view count for a specific post
   */
  getViewCount(postId: string): number {
    return this.postViews.filter(view => view.postId === postId).length;
  }

  /**
   * Get detailed view stats for a post with backend integration
   */
  async getPostViewStats(postId: string): Promise<ViewStats> {
    // First get local stats
    const localPostViews = this.postViews.filter(view => view.postId === postId);
    const uniqueViewers = new Set(localPostViews.map(view => view.userId).filter(Boolean));
    
    const viewsBySource = localPostViews.reduce((acc, view) => {
      acc[view.source] = (acc[view.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const durationsWithValues = localPostViews
      .map(view => view.duration)
      .filter((duration): duration is number => duration !== undefined);
    
    const averageDuration = durationsWithValues.length > 0
      ? durationsWithValues.reduce((sum, duration) => sum + duration, 0) / durationsWithValues.length
      : 0;

    // Try to get enhanced stats from backend
    try {      const response = await fetch(`${this.API_BASE_URL}/api/v1/post-views/posts/${postId}/stats`, {
        method: 'GET',
        headers: this.createAuthHeaders()
      });

      if (response.ok) {
        const backendStats = await response.json();
        return {
          totalViews: backendStats.totalViews || localPostViews.length,
          uniqueViews: backendStats.uniqueViews || uniqueViewers.size,
          viewsBySource: backendStats.viewsBySource || viewsBySource,
          averageDuration: backendStats.averageDuration || averageDuration,
          recentViews: localPostViews.slice(-10) // Keep local recent views
        };
      }
    } catch (error) {
      console.warn('Failed to fetch backend stats, using local only:', error);
    }

    return {
      totalViews: localPostViews.length,
      uniqueViews: uniqueViewers.size,
      viewsBySource,
      averageDuration,
      recentViews: localPostViews.slice(-10) // Last 10 views
    };
  }

  /**
   * Get all viewed posts
   */
  getViewedPosts(): string[] {
    return Array.from(this.viewedPosts);
  }

  /**
   * Get recent views
   */
  getRecentViews(limit: number = 20): PostView[] {
    return this.postViews
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get view analytics summary with backend integration
   */
  async getAnalyticsSummary(): Promise<{
    totalPosts: number;
    totalViews: number;
    averageViewsPerPost: number;
    topSources: Array<{ source: string; count: number }>;
    viewsToday: number;
    viewsThisWeek: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate local stats
    const localViewsToday = this.postViews.filter(view => view.viewedAt >= todayStart).length;
    const localViewsThisWeek = this.postViews.filter(view => view.viewedAt >= weekStart).length;

    const localSourceStats = this.postViews.reduce((acc, view) => {
      acc[view.source] = (acc[view.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const localTopSources = Object.entries(localSourceStats)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Try to get enhanced analytics from backend
    try {      const response = await fetch(`${this.API_BASE_URL}/api/v1/post-views/analytics`, {
        method: 'GET',
        headers: this.createAuthHeaders()
      });

      if (response.ok) {
        const backendAnalytics = await response.json();
        return {
          totalPosts: backendAnalytics.totalPosts || this.viewedPosts.size,
          totalViews: backendAnalytics.totalViews || this.postViews.length,
          averageViewsPerPost: backendAnalytics.averageViewsPerPost || 
            (this.viewedPosts.size > 0 ? this.postViews.length / this.viewedPosts.size : 0),
          topSources: backendAnalytics.topSources || localTopSources,
          viewsToday: backendAnalytics.viewsToday || localViewsToday,
          viewsThisWeek: backendAnalytics.viewsThisWeek || localViewsThisWeek
        };
      }
    } catch (error) {
      console.warn('Failed to fetch backend analytics, using local only:', error);
    }

    return {
      totalPosts: this.viewedPosts.size,
      totalViews: this.postViews.length,
      averageViewsPerPost: this.viewedPosts.size > 0 ? this.postViews.length / this.viewedPosts.size : 0,
      topSources: localTopSources,
      viewsToday: localViewsToday,
      viewsThisWeek: localViewsThisWeek
    };
  }

  /**
   * Clear old views (older than 30 days) both locally and on backend
   */
  async clearOldViews(): Promise<void> {
    try {
      // Clear locally
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      this.postViews = this.postViews.filter(view => view.viewedAt > thirtyDaysAgo);
      
      // Rebuild viewed posts set
      this.viewedPosts.clear();
      this.postViews.forEach(view => this.viewedPosts.add(view.postId));
      
      this.saveToStorage();

      // Try to clear old views on backend
      try {        const response = await fetch(`${this.API_BASE_URL}/api/v1/post-views/old`, {
          method: 'DELETE',
          headers: this.createAuthHeaders()
        });

        if (!response.ok) {
          console.warn('Failed to clear old views on backend:', response.statusText);
        }
      } catch (error) {
        console.warn('Backend cleanup failed:', error);
      }

      console.log('📊 Old views cleared');
    } catch (error) {
      console.error('Error clearing old views:', error);
    }
  }

  /**
   * Export view data
   */
  exportViewData(): {
    views: PostView[];
    summary: ReturnType<ViewService['getAnalyticsSummary']>;
  } {
    return {
      views: this.postViews,
      summary: this.getAnalyticsSummary()
    };
  }
  /**
   * Clear all view data both locally and on backend
   */
  async clearAllViews(): Promise<void> {
    try {
      // Clear locally
      this.postViews = [];
      this.viewedPosts.clear();
      this.activeSessions.clear();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.SESSION_KEY);
      }

      // Try to clear all views on backend
      try {        const response = await fetch(`${this.API_BASE_URL}/api/v1/post-views/all`, {
          method: 'DELETE',
          headers: this.createAuthHeaders()
        });

        if (!response.ok) {
          console.warn('Failed to clear all views on backend:', response.statusText);
        }
      } catch (error) {
        console.warn('Backend clear all failed:', error);
      }
      
      console.log('📊 All views cleared');
    } catch (error) {
      console.error('Error clearing all views:', error);
    }
  }
  /**
   * Get top locations by view count (from backend with fallback)
   */
  async getTopLocationsByViews(limit: number = 5): Promise<Array<{
    locationId: number;
    locationName: string;
    viewCount: number;
    uniqueViewers: number;
  }>> {
    try {      const response = await fetch(`${this.API_BASE_URL}/api/v1/post-views/locations/top?limit=${limit}`, {
        method: 'GET',
        headers: this.createAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn('Failed to fetch top locations from backend:', response.statusText);
        // Return mock data as fallback
        return this.getMockLocationData(limit);
      }
    } catch (error) {
      console.warn('Failed to fetch top locations, using fallback data:', error);
      return this.getMockLocationData(limit);
    }
  }

  /**
   * Mock location data for fallback
   */
  private getMockLocationData(limit: number = 5): Array<{
    locationId: number;
    locationName: string;
    viewCount: number;
    uniqueViewers: number;
  }> {
    const mockLocations = [
      { locationId: 1, locationName: 'Hà Nội', viewCount: 150, uniqueViewers: 45 },
      { locationId: 2, locationName: 'Hồ Chí Minh', viewCount: 120, uniqueViewers: 38 },
      { locationId: 4, locationName: 'Đà Nẵng', viewCount: 89, uniqueViewers: 32 },
      { locationId: 3, locationName: 'Hải Phòng', viewCount: 67, uniqueViewers: 25 },
      { locationId: 5, locationName: 'Cần Thơ', viewCount: 54, uniqueViewers: 22 }
    ];
    return mockLocations.slice(0, limit);
  }

  /**
   * Load data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.postViews = data.views?.map((view: any) => ({
          ...view,
          viewedAt: new Date(view.viewedAt)
        })) || [];
        
        // Rebuild viewed posts set
        this.viewedPosts.clear();
        this.postViews.forEach(view => this.viewedPosts.add(view.postId));
      }
    } catch (error) {
      console.error('Error loading views from storage:', error);
      this.postViews = [];
      this.viewedPosts.clear();
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const data = {
          views: this.postViews,
          lastUpdated: new Date()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving views to storage:', error);
    }
  }

  /**
   * Track modal open duration (special case for dedicated post viewing) - LEGACY METHOD
   */
  trackModalViewLegacy(postId: string, onClose?: () => void): () => void {
    this.trackView(postId, 'modal');
    this.startViewSession(postId, 'modal');

    return () => {
      const duration = this.endViewSession(postId, 'modal');
      if (duration && duration > 1000) { // Only count if viewed for more than 1 second
        console.log(`📊 Modal view completed: ${duration}ms`);
      }
      onClose?.();
    };
  }

  /**
   * Setup intersection observer for automatic feed view tracking
   */
  setupIntersectionObserver(threshold: number = 0.5): IntersectionObserver | null {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postElement = entry.target as HTMLElement;
            const postId = postElement.dataset.postId;
            
            if (postId) {
              // Add a small delay to ensure the post is actually being viewed
              setTimeout(() => {
                if (entry.isIntersecting) {
                  this.trackView(postId, 'feed');
                }
              }, 1000);
            }
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -10% 0px' // Only trigger when post is at least 10% visible from bottom
      }
    );    return observer;
  }
}

// Export singleton instance
export const viewService = ViewService.getInstance();
export default ViewService;
