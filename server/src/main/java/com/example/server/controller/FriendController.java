package com.example.server.controller;

import com.example.server.service.FriendService;
import com.example.server.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
public class FriendController {

    private final FriendService friendService;

    @Autowired
    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @GetMapping
    public ResponseEntity<List<FriendDTO>> getCurrentUserFriends() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<FriendDTO> friends = friendService.getFriendsByUserId(userId);
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FriendDTO>> getFriendsByUserId(@PathVariable Integer userId) {
        List<FriendDTO> friends = friendService.getFriendsByUserId(userId);
        return ResponseEntity.ok(friends);
    }

    @PostMapping("/send-request/{receiverId}")
    public ResponseEntity<FriendRequestDTO> sendFriendRequest(@PathVariable Integer receiverId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer senderId = getUserIdFromAuth(auth);
            
            FriendRequestDTO request = friendService.sendFriendRequest(senderId, receiverId);
            return ResponseEntity.status(HttpStatus.CREATED).body(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendRequestDTO>> getSentFriendRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<FriendRequestDTO> requests = friendService.getSentFriendRequests(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/received")
    public ResponseEntity<List<FriendRequestDTO>> getReceivedFriendRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<FriendRequestDTO> requests = friendService.getReceivedFriendRequests(userId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/requests/{requestId}/accept")
    public ResponseEntity<FriendDTO> acceptFriendRequest(@PathVariable Long requestId) {
        try {
            FriendDTO friendship = friendService.acceptFriendRequest(requestId);
            return ResponseEntity.ok(friendship);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<Void> rejectFriendRequest(@PathVariable Long requestId) {
        try {
            friendService.rejectFriendRequest(requestId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Integer friendId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            friendService.removeFriend(userId, friendId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Integer getUserIdFromAuth(Authentication auth) {
        // Placeholder - implement based on your JWT setup
        return 1;
    }
}
