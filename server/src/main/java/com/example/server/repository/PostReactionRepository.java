package com.example.server.repository;

import com.example.server.model.Entity.PostReaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostReactionRepository extends JpaRepository<PostReaction, Integer> {
    PostReaction findByPostId(int postId);
}