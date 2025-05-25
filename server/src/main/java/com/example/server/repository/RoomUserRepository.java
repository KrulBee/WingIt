package com.example.server.repository;

import com.example.server.model.Entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    List<RoomUser> findByUserId(Integer userId);
    List<RoomUser> findByChatRoomId(Long chatRoomId);
    Optional<RoomUser> findByChatRoomIdAndUserId(Long chatRoomId, Integer userId);
    boolean existsByChatRoomIdAndUserId(Long chatRoomId, Integer userId);
}