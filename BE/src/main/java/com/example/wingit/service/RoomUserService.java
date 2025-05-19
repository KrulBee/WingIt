package com.example.wingit.service;

import com.example.wingit.repository.RoomUserRepository;
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
