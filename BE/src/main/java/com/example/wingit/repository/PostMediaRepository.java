package com.example.wingit.repository;

import com.example.wingit.model.Entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMediaRepository extends JpaRepository<PostMedia, Integer> {
    PostMedia findByPostId(int postId);
}