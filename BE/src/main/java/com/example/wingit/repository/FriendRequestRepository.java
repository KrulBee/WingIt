package com.example.wingit.repository;

import com.example.wingit.model.Entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    // Add custom query methods here if needed
}