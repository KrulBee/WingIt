package com.example.server.controller;

import com.example.server.service.FriendRequestService;
// import com.example.wingit.dto.FriendRequestDTO; // Example import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import org.springframework.http.ResponseEntity; // Example import
// import org.springframework.web.bind.annotation.*; // Example import
// import java.util.List; // Example import

@RestController
@RequestMapping("/api/v1/friend-requests")
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    @Autowired
    public FriendRequestController(FriendRequestService friendRequestService) {
        this.friendRequestService = friendRequestService;
    }

    // Define REST endpoints for FriendRequest operations here
}
