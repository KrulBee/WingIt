package com.example.wingit.repository;

import com.example.wingit.model.Entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    ChatRoom findByRoomName(String roomName);
}