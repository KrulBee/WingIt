package com.example.server.repository;

import com.example.server.model.Entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserIdOrderByCreatedDateDesc(Integer userId);
    List<Post> findByTypeIdOrderByCreatedDateDesc(Long typeId);
    List<Post> findAllByOrderByCreatedDateDesc();
    List<Post> findByLocationIdOrderByCreatedDateDesc(Integer locationId);
    
    // Admin analytics methods
    long countByCreatedDateAfter(LocalDateTime date);
    long countByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
