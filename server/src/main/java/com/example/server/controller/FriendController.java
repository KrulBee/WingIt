package com.example.server.controller;

import com.example.server.service.FriendService;
import com.example.server.dto.*;
import com.example.server.repository.UserRepository;
import com.example.server.model.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class FriendController {

    private final FriendService friendService;
    
    @Autowired
    private UserRepository userRepository;

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

    @GetMapping("/suggestions")
    public ResponseEntity<List<UserDTO>> getFriendSuggestions() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);

            List<UserDTO> suggestions = friendService.getFriendSuggestions(userId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }    @PostMapping("/send-request/{receiverId}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable Integer receiverId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer senderId = getUserIdFromAuth(auth);
            
            // Validate input
            if (receiverId == null || receiverId <= 0) {
                return ResponseEntity.badRequest().body("Invalid receiver ID");
            }
            
            if (senderId.equals(receiverId)) {
                return ResponseEntity.badRequest().body("Cannot send friend request to yourself");
            }
            
            FriendRequestDTO request = friendService.sendFriendRequest(senderId, receiverId);
            return ResponseEntity.status(HttpStatus.CREATED).body(request);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            System.err.println("Friend request error: " + errorMessage);
            
            // Handle specific error cases
            if (errorMessage != null) {
                if (errorMessage.contains("already friends")) {
                    return ResponseEntity.badRequest().body("You are already friends with this user");
                } else if (errorMessage.contains("already sent")) {
                    return ResponseEntity.badRequest().body("Friend request already sent to this user");
                } else if (errorMessage.contains("not found")) {
                    return ResponseEntity.badRequest().body("User not found");
                } else if (errorMessage.contains("yourself")) {
                    return ResponseEntity.badRequest().body("Cannot send friend request to yourself");
                }
            }
            
            return ResponseEntity.badRequest().body("Failed to send friend request: " + (errorMessage != null ? errorMessage : "Unknown error"));
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
    }    @PutMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long requestId) {
        try {
            FriendDTO friendship = friendService.acceptFriendRequest(requestId);
            return ResponseEntity.ok(friendship);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            System.err.println("Accept friend request error: " + errorMessage);
            return ResponseEntity.badRequest().body("Failed to accept friend request: " + (errorMessage != null ? errorMessage : "Unknown error"));
        }
    }

    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Long requestId) {
        try {
            friendService.rejectFriendRequest(requestId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            System.err.println("Reject friend request error: " + errorMessage);
            return ResponseEntity.badRequest().body("Failed to reject friend request: " + (errorMessage != null ? errorMessage : "Unknown error"));
        }
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<?> removeFriend(@PathVariable Integer friendId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            friendService.removeFriend(userId, friendId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            System.err.println("Remove friend error: " + errorMessage);
            return ResponseEntity.badRequest().body("Failed to remove friend: " + (errorMessage != null ? errorMessage : "Unknown error"));
        }
    }    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        System.out.println("DEBUG: Extracting user ID for username: " + username);
        
        User user = userRepository.findByUsername(username);
        if (user != null) {
            System.out.println("DEBUG: Found user with ID: " + user.getId() + " for username: " + username);
            return user.getId();
        }
        
        System.err.println("ERROR: User not found for username: " + username);
        System.out.println("DEBUG: All users in database:");
        userRepository.findAll().forEach(u -> 
            System.out.println("  - ID: " + u.getId() + ", Username: " + u.getUsername())
        );
        
        throw new RuntimeException("User not found in authentication context");
    }
}
