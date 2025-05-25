package com.example.server.repository;

import com.example.server.model.Entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedDateDesc(Long postId);
    List<Comment> findByUserIdOrderByCreatedDateDesc(Integer userId);
    long countByPostId(Long postId);
}