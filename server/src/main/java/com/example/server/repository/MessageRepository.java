package com.example.server.repository;

import com.example.server.model.Entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatRoomIdOrderByTimestampDesc(Long chatRoomId);
    List<Message> findByChatRoomIdOrderByTimestampAsc(Long chatRoomId);
    List<Message> findBySenderIdOrderByTimestampDesc(Integer senderId);
}