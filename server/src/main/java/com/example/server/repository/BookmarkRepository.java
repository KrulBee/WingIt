package com.example.server.repository;

import com.example.server.model.Entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    
    // Find bookmark by user and post
    Optional<Bookmark> findByUserIdAndPostId(Integer userId, Long postId);
    
    // Check if bookmark exists
    boolean existsByUserIdAndPostId(Integer userId, Long postId);
    
    // Get all bookmarks for a user, ordered by creation date descending
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    // Count bookmarks for a post
    long countByPostId(Long postId);
    
    // Delete bookmark by user and post
    void deleteByUserIdAndPostId(Integer userId, Long postId);
    
    // Get bookmarks with post details for a user
    @Query("SELECT b FROM Bookmark b JOIN FETCH b.post p JOIN FETCH p.user WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Bookmark> findBookmarksWithPostsByUserId(@Param("userId") Integer userId);
}
