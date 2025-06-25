package com.example.server.service;

import com.example.server.dto.*;
import com.example.server.model.Entity.Post;
import com.example.server.model.Entity.PostView;
import com.example.server.model.Entity.User;
import com.example.server.repository.PostRepository;
import com.example.server.repository.PostViewRepository;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Async;
import java.util.concurrent.CompletableFuture;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostViewService {

    private final PostViewRepository postViewRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    public PostViewService(PostViewRepository postViewRepository, 
                          PostRepository postRepository,
                          UserRepository userRepository) {
        this.postViewRepository = postViewRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PostViewDTO trackView(Long postId, Integer userId, CreatePostViewRequest request, String ipAddress, String userAgent) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElse(null); // Don't fail if user not found, allow anonymous tracking
        }

        PostView postView = new PostView();
        postView.setPost(post);
        postView.setUser(user);
        postView.setViewSource(PostView.ViewSource.valueOf(request.getViewSource()));
        postView.setDurationMs(request.getDurationMs());
        postView.setSessionId(request.getSessionId());
        postView.setIpAddress(ipAddress);
        postView.setUserAgent(userAgent);
        postView.setViewedAt(LocalDateTime.now());

        PostView savedView = postViewRepository.save(postView);
        return convertToDTO(savedView);
    }

    @Transactional
    public PostViewDTO updateViewDuration(Long viewId, Long durationMs) {
        PostView postView = postViewRepository.findById(viewId)
                .orElseThrow(() -> new RuntimeException("PostView not found with id: " + viewId));
        
        postView.setDurationMs(durationMs);
        PostView savedView = postViewRepository.save(postView);
        return convertToDTO(savedView);
    }

    public PostViewStatsDTO getPostViewStats(Long postId) {
        long totalViews = postViewRepository.countByPostId(postId);
        long uniqueViews = postViewRepository.countUniqueViewersByPostId(postId);
        Double averageDuration = postViewRepository.getAverageDurationByPostId(postId);

        // Get views by source for this post
        Map<String, Long> viewsBySource = new HashMap<>();
        for (PostView.ViewSource source : PostView.ViewSource.values()) {
            long count = postViewRepository.countByPostIdAndViewSource(postId, source);
            if (count > 0) {
                viewsBySource.put(source.name(), count);
            }
        }

        // Get recent views for this post
        List<PostView> recentViewEntities = postViewRepository.findByPostIdOrderByViewedAtDesc(postId);
        List<PostViewDTO> recentViews = recentViewEntities.stream()
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        PostViewStatsDTO stats = new PostViewStatsDTO();
        stats.setPostId(postId);
        stats.setTotalViews(totalViews);
        stats.setUniqueViews(uniqueViews);
        stats.setAverageDuration(averageDuration);
        stats.setViewsBySource(viewsBySource);
        stats.setRecentViews(recentViews);

        return stats;
    }    public ViewAnalyticsSummaryDTO getAnalyticsSummary(Integer userId) {
        LocalDateTime startOfDay = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        // Calculate start of this week (Monday)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(java.time.DayOfWeek.MONDAY).truncatedTo(ChronoUnit.DAYS);

        long totalViews;
        long totalPosts;
        long viewsToday;
        long viewsThisWeek;
        List<Object[]> sourceCountData;        List<PostView> recentViewEntities;
        
        if (userId != null) {
            // Get analytics for specific user
            totalViews = postViewRepository.countByUserId(userId);
            totalPosts = postViewRepository.countUniquePostsViewedByUser(userId);
            viewsToday = postViewRepository.countViewsTodayForUser(userId, startOfDay);
            viewsThisWeek = postViewRepository.countViewsThisWeekForUser(userId, startOfWeek);
            sourceCountData = postViewRepository.getViewCountBySourceForUser(userId);
            recentViewEntities = postViewRepository.findRecentViewsForUser(userId, 10);
        } else {
            // Get global analytics
            totalViews = postViewRepository.count();
            totalPosts = postViewRepository.findAll().stream()
                    .map(view -> view.getPost().getId())
                    .collect(Collectors.toSet()).size();
            viewsToday = postViewRepository.countViewsToday(startOfDay);
            viewsThisWeek = postViewRepository.countViewsThisWeek(startOfWeek);
            sourceCountData = postViewRepository.getViewCountBySource();
            recentViewEntities = postViewRepository.findRecentViews(10);
        }

        // Convert source count data to map
        Map<String, Long> viewsBySource = new HashMap<>();
        for (Object[] row : sourceCountData) {
            PostView.ViewSource source = (PostView.ViewSource) row[0];
            Long count = (Long) row[1];
            viewsBySource.put(source.name(), count);
        }

        // Convert recent views
        List<PostViewDTO> recentViews = recentViewEntities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        double averageViewsPerPost = totalPosts > 0 ? (double) totalViews / totalPosts : 0.0;

        ViewAnalyticsSummaryDTO summary = new ViewAnalyticsSummaryDTO();
        summary.setTotalPosts(totalPosts);
        summary.setTotalViews(totalViews);
        summary.setViewsToday(viewsToday);
        summary.setViewsThisWeek(viewsThisWeek);
        summary.setAverageViewsPerPost(averageViewsPerPost);
        summary.setViewsBySource(viewsBySource);
        summary.setRecentViews(recentViews);

        return summary;
    }

    public List<PostViewDTO> getViewsByPostId(Long postId) {
        List<PostView> views = postViewRepository.findByPostIdOrderByViewedAtDesc(postId);
        return views.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PostViewDTO> getViewsByUserId(Integer userId) {
        List<PostView> views = postViewRepository.findByUserIdOrderByViewedAtDesc(userId);
        return views.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearOldViews(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minus(daysOld, ChronoUnit.DAYS);
        postViewRepository.deleteByViewedAtBefore(cutoffDate);
    }    @Transactional
    public void clearAllViews() {
        postViewRepository.deleteAll();
    }

    /**
     * Get top locations by view count in the last month
     */
    public List<LocationViewStatsDTO> getTopLocationsByViews(int limit) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(1);
        Pageable pageable = PageRequest.of(0, limit);
        return postViewRepository.findTopLocationsByViews(startDate, pageable);
    }    /**
     * Get view statistics for a specific location
     */
    public LocationViewStatsDTO getLocationViewStats(Integer locationId) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(1);
        Long viewCount = postViewRepository.countViewsByLocationAndDateRange(locationId, startDate);
        
        // Create a basic DTO with the location ID and view count
        // The location name would be fetched separately if needed
        return new LocationViewStatsDTO(locationId, "Location " + locationId, viewCount, 0L);
    }

    private PostViewDTO convertToDTO(PostView postView) {
        PostViewDTO dto = new PostViewDTO();
        dto.setId(postView.getId());
        dto.setPostId(postView.getPost().getId());
        dto.setUserId(postView.getUser() != null ? postView.getUser().getId() : null);
        dto.setViewSource(postView.getViewSource().name());
        dto.setDurationMs(postView.getDurationMs());
        dto.setViewedAt(postView.getViewedAt());
        dto.setSessionId(postView.getSessionId());
        dto.setIpAddress(postView.getIpAddress());
        dto.setUserAgent(postView.getUserAgent());
        return dto;
    }

    /**
     * Async method for tracking post views - improves response time for users
     * Views are tracked in background without blocking the main request
     */
    @Async("analyticsExecutor")
    public CompletableFuture<PostViewDTO> trackViewAsync(Long postId, Integer userId, CreatePostViewRequest request, String ipAddress, String userAgent) {
        try {
            PostViewDTO result = trackView(postId, userId, request, ipAddress, userAgent);
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Async method for updating view duration - analytics processing in background
     */
    @Async("analyticsExecutor")
    public CompletableFuture<PostViewDTO> updateViewDurationAsync(Long viewId, Long durationMs) {
        try {
            PostViewDTO result = updateViewDuration(viewId, durationMs);
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Async method for batch processing view analytics
     * Useful for heavy analytics operations that shouldn't block user requests
     */
    @Async("analyticsExecutor")
    public CompletableFuture<Void> processViewAnalyticsBatch(List<Long> postIds) {
        try {
            // Process analytics for multiple posts in background
            for (Long postId : postIds) {
                getPostViewStats(postId);
                // Could add more complex analytics processing here
            }
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }
}
