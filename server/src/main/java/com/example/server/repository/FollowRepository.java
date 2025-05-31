package com.example.server.repository;

import com.example.server.model.Entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    // Find if a specific follow relationship exists
    Optional<Follow> findByFollowerIdAndFollowingId(Integer followerId, Integer followingId);
    
    // Find all users that a user is following
    List<Follow> findByFollowerId(Integer followerId);
    
    // Find all followers of a user
    List<Follow> findByFollowingId(Integer followingId);
    
    // Count followers of a user
    long countByFollowingId(Integer followingId);
    
    // Count users that a user is following
    long countByFollowerId(Integer followerId);
    
    // Check if user A is following user B
    boolean existsByFollowerIdAndFollowingId(Integer followerId, Integer followingId);
    
    // Get all follower IDs for a user (for notifications)
    @Query("SELECT f.follower.id FROM Follow f WHERE f.following.id = :userId")
    List<Integer> findFollowerIdsByUserId(@Param("userId") Integer userId);
}