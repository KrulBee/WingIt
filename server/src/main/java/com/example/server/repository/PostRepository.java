package com.example.server.repository;

import com.example.server.model.Entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Optimized queries with JOIN FETCH to prevent N+1 problems
    @Query("SELECT DISTINCT p FROM Post p " +
           "LEFT JOIN FETCH p.user u " +
           "LEFT JOIN FETCH u.userData " +
           "LEFT JOIN FETCH u.role " +
           "LEFT JOIN FETCH p.location " +
           "LEFT JOIN FETCH p.type " +
           "ORDER BY p.createdDate DESC")
    List<Post> findAllWithDetailsOrderByCreatedDateDesc();
    
    @Query("SELECT DISTINCT p FROM Post p " +
           "LEFT JOIN FETCH p.user u " +
           "LEFT JOIN FETCH u.userData " +
           "LEFT JOIN FETCH u.role " +
           "LEFT JOIN FETCH p.location " +
           "LEFT JOIN FETCH p.type " +
           "WHERE p.id = :id")
    Optional<Post> findByIdWithDetails(Long id);
    
    @Query("SELECT DISTINCT p FROM Post p " +
           "LEFT JOIN FETCH p.user u " +
           "LEFT JOIN FETCH u.userData " +
           "LEFT JOIN FETCH u.role " +
           "LEFT JOIN FETCH p.location " +
           "LEFT JOIN FETCH p.type " +
           "WHERE p.user.id = :userId " +
           "ORDER BY p.createdDate DESC")
    List<Post> findByUserIdWithDetailsOrderByCreatedDateDesc(Integer userId);
    
    // Keep original methods for backward compatibility
    List<Post> findByUserIdOrderByCreatedDateDesc(Integer userId);
    List<Post> findByTypeIdOrderByCreatedDateDesc(Long typeId);
    List<Post> findAllByOrderByCreatedDateDesc();
    List<Post> findByLocationIdOrderByCreatedDateDesc(Integer locationId);
    
    // Admin analytics methods
    long countByCreatedDateAfter(LocalDateTime date);
    long countByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
