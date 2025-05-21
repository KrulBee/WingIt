package com.example.server.service;

import com.example.server.repository.RoomUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomUserService {

    private final RoomUserRepository roomUserRepository;

    @Autowired
    public RoomUserService(RoomUserRepository roomUserRepository) {
        this.roomUserRepository = roomUserRepository;
    }

    // Add service methods related to RoomUser entity here
}
