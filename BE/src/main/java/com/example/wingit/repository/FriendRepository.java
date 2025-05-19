package com.example.wingit.repository;

import com.example.wingit.model.Entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository extends JpaRepository<Friend, Integer> {
    Friend findByUser1IdOrUser2Id(int user1Id, int user2Id);
}