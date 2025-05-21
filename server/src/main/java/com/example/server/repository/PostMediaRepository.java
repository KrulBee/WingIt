package com.example.server.repository;

import com.example.server.model.Entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMediaRepository extends JpaRepository<PostMedia, Integer> {
    PostMedia findByPostId(int postId);
}