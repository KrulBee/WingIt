package com.example.server.repository;

import com.example.server.model.Entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    List<PostMedia> findByPostId(Long postId);
    List<PostMedia> findByPostIdOrderByUploadedAtAsc(Long postId);
}