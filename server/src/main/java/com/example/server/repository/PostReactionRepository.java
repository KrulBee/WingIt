package com.example.server.repository;

import com.example.server.model.Entity.PostReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    List<PostReaction> findByPostId(Long postId);
    List<PostReaction> findByUserId(Integer userId);
    Optional<PostReaction> findByPostIdAndUserId(Long postId, Integer userId);
    
    @Query("SELECT COUNT(pr) FROM PostReaction pr WHERE pr.post.id = :postId")
    long countByPostId(@Param("postId") Long postId);
    
    @Query("SELECT COUNT(pr) FROM PostReaction pr WHERE pr.post.id = :postId AND pr.reactionType.id = :reactionTypeId")
    long countByPostIdAndReactionTypeId(@Param("postId") Long postId, @Param("reactionTypeId") Long reactionTypeId);
    
    // Method for cascade deletion
    void deleteByPostId(Long postId);
}