package com.example.wingit.repository;

import com.example.wingit.model.Entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    Comment findByPostId(int postId);
}