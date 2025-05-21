package com.example.server.repository;

import com.example.server.model.Entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomUserRepository extends JpaRepository<RoomUser, Integer> {
}