package com.example.wingit.repository;

import com.example.wingit.model.Entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomUserRepository extends JpaRepository<RoomUser, Integer> {
}