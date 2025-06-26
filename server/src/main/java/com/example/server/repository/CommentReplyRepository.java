package com.example.server.repository;

import com.example.server.model.Entity.CommentReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentReplyRepository extends JpaRepository<CommentReply, Long> {
    List<CommentReply> findByRootCommentIdOrderByCreatedDateAsc(Long rootCommentId);
    long countByRootCommentId(Long rootCommentId);
    
    // Optimized query with JOIN FETCH to avoid N+1 issues
    @Query("SELECT DISTINCT cr FROM CommentReply cr " +
           "LEFT JOIN FETCH cr.reply r " +
           "LEFT JOIN FETCH r.user u " +
           "LEFT JOIN FETCH u.userData " +
           "LEFT JOIN FETCH u.role " +
           "WHERE cr.rootComment.id = :rootCommentId " +
           "ORDER BY cr.createdDate ASC")
    List<CommentReply> findByRootCommentIdWithDetails(@Param("rootCommentId") Long rootCommentId);
}