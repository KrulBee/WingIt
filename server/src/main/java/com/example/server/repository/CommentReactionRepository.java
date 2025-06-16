package com.example.server.repository;

import com.example.server.model.Entity.CommentReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    List<CommentReaction> findByCommentId(Long commentId);
    List<CommentReaction> findByUserId(Integer userId);
    Optional<CommentReaction> findByCommentIdAndUserId(Long commentId, Integer userId);
    
    @Query("SELECT COUNT(cr) FROM CommentReaction cr WHERE cr.comment.id = :commentId")
    long countByCommentId(@Param("commentId") Long commentId);
    
    @Query("SELECT COUNT(cr) FROM CommentReaction cr WHERE cr.comment.id = :commentId AND cr.reactionType.id = :reactionTypeId")
    long countByCommentIdAndReactionTypeId(@Param("commentId") Long commentId, @Param("reactionTypeId") Long reactionTypeId);
    
    // Method for cascade deletion
    void deleteByCommentId(Long commentId);
}
