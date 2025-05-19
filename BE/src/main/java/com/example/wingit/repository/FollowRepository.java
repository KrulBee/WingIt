package com.example.wingit.repository;

import com.example.wingit.model.Entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, Integer> {
    Follow findByFollowerId(int followerId);
}