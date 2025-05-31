package com.example.server.repository;

import com.example.server.model.Entity.PostView;
import com.example.server.dto.LocationViewStatsDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {
    
    // Count total views for a post
    long countByPostId(Long postId);
    
    // Count unique viewers for a post
    @Query("SELECT COUNT(DISTINCT v.user.id) FROM PostView v WHERE v.post.id = :postId AND v.user IS NOT NULL")
    long countUniqueViewersByPostId(@Param("postId") Long postId);
    
    // Get views by post ID
    List<PostView> findByPostIdOrderByViewedAtDesc(Long postId);
    
    // Get views by user ID
    List<PostView> findByUserIdOrderByViewedAtDesc(Integer userId);
    
    // Get views by post ID and user ID
    List<PostView> findByPostIdAndUserId(Long postId, Integer userId);
    
    // Get views by post ID and view source
    @Query("SELECT COUNT(v) FROM PostView v WHERE v.post.id = :postId AND v.viewSource = :source")
    long countByPostIdAndViewSource(@Param("postId") Long postId, @Param("source") PostView.ViewSource source);
    
    // Get average duration for a post
    @Query("SELECT AVG(v.durationMs) FROM PostView v WHERE v.post.id = :postId AND v.durationMs IS NOT NULL")
    Double getAverageDurationByPostId(@Param("postId") Long postId);
    
    // Get views count by source
    @Query("SELECT v.viewSource, COUNT(v) FROM PostView v GROUP BY v.viewSource")
    List<Object[]> getViewCountBySource();
    
    // Get views count by source for a user
    @Query("SELECT v.viewSource, COUNT(v) FROM PostView v WHERE v.user.id = :userId GROUP BY v.viewSource")
    List<Object[]> getViewCountBySourceForUser(@Param("userId") Integer userId);
    
    // Get views today
    @Query("SELECT COUNT(v) FROM PostView v WHERE v.viewedAt >= :startOfDay")
    long countViewsToday(@Param("startOfDay") LocalDateTime startOfDay);
    
    // Get views this week
    @Query("SELECT COUNT(v) FROM PostView v WHERE v.viewedAt >= :startOfWeek")
    long countViewsThisWeek(@Param("startOfWeek") LocalDateTime startOfWeek);
    
    // Get views today for user
    @Query("SELECT COUNT(v) FROM PostView v WHERE v.user.id = :userId AND v.viewedAt >= :startOfDay")
    long countViewsTodayForUser(@Param("userId") Integer userId, @Param("startOfDay") LocalDateTime startOfDay);
    
    // Get views this week for user
    @Query("SELECT COUNT(v) FROM PostView v WHERE v.user.id = :userId AND v.viewedAt >= :startOfWeek")
    long countViewsThisWeekForUser(@Param("userId") Integer userId, @Param("startOfWeek") LocalDateTime startOfWeek);
    
    // Get total unique posts viewed by user
    @Query("SELECT COUNT(DISTINCT v.post.id) FROM PostView v WHERE v.user.id = :userId")
    long countUniquePostsViewedByUser(@Param("userId") Integer userId);
    
    // Get recent views with limit
    @Query("SELECT v FROM PostView v ORDER BY v.viewedAt DESC")
    List<PostView> findRecentViews(@Param("limit") int limit);
    
    // Get recent views for user with limit
    @Query("SELECT v FROM PostView v WHERE v.user.id = :userId ORDER BY v.viewedAt DESC")
    List<PostView> findRecentViewsForUser(@Param("userId") Integer userId, @Param("limit") int limit);
      // Delete old views (older than specified date)
    void deleteByViewedAtBefore(LocalDateTime cutoffDate);    // Get top locations by view count
    @Query("SELECT new com.example.server.dto.LocationViewStatsDTO(" +
           "l.id, l.location, COUNT(pv.id), COUNT(DISTINCT pv.user.id)) " +
           "FROM PostView pv " +
           "JOIN pv.post p " +
           "JOIN p.location l " +
           "WHERE pv.viewedAt >= :startDate " +
           "GROUP BY l.id, l.location " +
           "ORDER BY COUNT(pv.id) DESC")
    List<LocationViewStatsDTO> findTopLocationsByViews(@Param("startDate") LocalDateTime startDate, 
                                                       org.springframework.data.domain.Pageable pageable);
    
    // Get view count for specific location in date range
    @Query("SELECT COUNT(pv.id) " +
           "FROM PostView pv " +
           "JOIN pv.post p " +
           "JOIN p.location l " +
           "WHERE l.id = :locationId " +
           "AND pv.viewedAt >= :startDate")
    Long countViewsByLocationAndDateRange(@Param("locationId") Integer locationId, 
                                         @Param("startDate") LocalDateTime startDate);
}
