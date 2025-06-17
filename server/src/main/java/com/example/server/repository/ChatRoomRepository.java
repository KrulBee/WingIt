package com.example.server.repository;

import com.example.server.model.Entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    ChatRoom findByRoomName(String roomName);
    
    // Find existing private chat between two users
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.isGroupChat = false AND " +
           "cr.id IN (SELECT ru1.chatRoom.id FROM RoomUser ru1 WHERE ru1.user.id = :userId1) AND " +
           "cr.id IN (SELECT ru2.chatRoom.id FROM RoomUser ru2 WHERE ru2.user.id = :userId2) AND " +
           "(SELECT COUNT(ru) FROM RoomUser ru WHERE ru.chatRoom.id = cr.id) = 2")
    ChatRoom findPrivateChatBetweenUsers(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);
}