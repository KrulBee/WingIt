package com.example.wingit.repository;

import com.example.wingit.model.Entity.PostReaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostReactionRepository extends JpaRepository<PostReaction, Integer> {
    PostReaction findByPostId(int postId);
}