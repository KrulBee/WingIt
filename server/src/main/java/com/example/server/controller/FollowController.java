package com.example.server.controller;

import com.example.server.dto.FollowDTO;
import com.example.server.service.FollowService;
import com.example.server.service.FollowService.FollowStatsDTO;
import com.example.server.repository.UserRepository;
import com.example.server.model.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/follows")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class FollowController {

    private final FollowService followService;
    
    @Autowired
    private UserRepository userRepository;    public FollowController(FollowService followService) {
        this.followService = followService;
    }// Follow a user
    @PostMapping("/{userId}")
    public ResponseEntity<FollowDTO> followUser(@PathVariable Integer userId, Authentication authentication) {
        try {
            if (authentication == null) {
                System.err.println("Authentication is null");
                return ResponseEntity.badRequest().build();
            }
            
            Integer currentUserId = getUserIdFromAuth(authentication);
            FollowDTO follow = followService.followUser(currentUserId, userId);
            return ResponseEntity.ok(follow);
        } catch (Exception e) {
            System.err.println("Error following user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }    // Unfollow a user
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable Integer userId, Authentication authentication) {
        try {
            Integer currentUserId = getUserIdFromAuth(authentication);
            followService.unfollowUser(currentUserId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }    // Check if current user is following a specific user
    @GetMapping("/is-following/{userId}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(@PathVariable Integer userId, Authentication authentication) {
        try {
            if (authentication == null) {
                System.err.println("Authentication is null");
                return ResponseEntity.badRequest().build();
            }
            
            Integer currentUserId = getUserIdFromAuth(authentication);
            boolean isFollowing = followService.isFollowing(currentUserId, userId);
            return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
        } catch (Exception e) {
            System.err.println("Error checking follow status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }    // Get users current user is following
    @GetMapping("/following")
    public ResponseEntity<List<FollowDTO>> getFollowing(Authentication authentication) {
        try {
            Integer currentUserId = getUserIdFromAuth(authentication);
            List<FollowDTO> following = followService.getFollowing(currentUserId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }    // Get followers of current user
    @GetMapping("/followers")
    public ResponseEntity<List<FollowDTO>> getFollowers(Authentication authentication) {
        try {
            Integer currentUserId = getUserIdFromAuth(authentication);
            List<FollowDTO> followers = followService.getFollowers(currentUserId);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get followers of a specific user
    @GetMapping("/user/{userId}/followers")
    public ResponseEntity<List<FollowDTO>> getFollowersByUserId(@PathVariable Integer userId) {
        try {
            List<FollowDTO> followers = followService.getFollowers(userId);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get users a specific user is following
    @GetMapping("/user/{userId}/following")
    public ResponseEntity<List<FollowDTO>> getFollowingByUserId(@PathVariable Integer userId) {
        try {
            List<FollowDTO> following = followService.getFollowing(userId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }    // Get follow statistics for current user
    @GetMapping("/stats")
    public ResponseEntity<FollowStatsDTO> getFollowStats(Authentication authentication) {
        try {
            Integer currentUserId = getUserIdFromAuth(authentication);
            FollowStatsDTO stats = followService.getFollowStats(currentUserId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }    // Get follow statistics for a specific user
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<FollowStatsDTO> getFollowStatsByUserId(@PathVariable Integer userId) {
        try {
            FollowStatsDTO stats = followService.getFollowStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getId();
        }
        throw new RuntimeException("User not found in authentication context");
    }
}
