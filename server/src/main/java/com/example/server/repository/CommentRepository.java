package com.example.server.repository;

import com.example.server.model.Entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedDateDesc(Long postId);
    List<Comment> findByPostIdAndIsReplyFalseOrderByCreatedDateDesc(Long postId); // Only root comments
    List<Comment> findByUserIdOrderByCreatedDateDesc(Integer userId);
    long countByPostId(Long postId);
    
    // Optimized query with JOIN FETCH to avoid N+1 issues
    @Query("SELECT DISTINCT c FROM Comment c " +
           "LEFT JOIN FETCH c.user u " +
           "LEFT JOIN FETCH u.userData " +
           "LEFT JOIN FETCH u.role " +
           "WHERE c.post.id = :postId AND c.isReply = false " +
           "ORDER BY c.createdDate DESC")
    List<Comment> findByPostIdWithDetailsAndIsReplyFalse(@Param("postId") Long postId);
    
    // Methods for cascade deletion
    List<Comment> findByPostId(Long postId);
    
    @Modifying
    void deleteByPostId(Long postId);
}