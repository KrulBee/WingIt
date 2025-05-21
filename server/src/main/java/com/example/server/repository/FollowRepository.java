package com.example.server.repository;

import com.example.server.model.Entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, Integer> {
    Follow findByFollowerId(int followerId);
}