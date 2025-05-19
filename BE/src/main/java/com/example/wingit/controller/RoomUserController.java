package com.example.wingit.controller;

import com.example.wingit.service.RoomUserService;
// import com.example.wingit.dto.RoomUserDTO; // Example import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import org.springframework.http.ResponseEntity; // Example import
// import org.springframework.web.bind.annotation.*; // Example import
// import java.util.List; // Example import

@RestController
@RequestMapping("/api/v1/room-users")
public class RoomUserController {

    private final RoomUserService roomUserService;

    @Autowired
    public RoomUserController(RoomUserService roomUserService) {
        this.roomUserService = roomUserService;
    }

    // Define REST endpoints for RoomUser operations here
}
