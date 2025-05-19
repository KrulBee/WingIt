package com.example.wingit.repository;

import com.example.wingit.model.Entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Add custom query methods here if needed
}
