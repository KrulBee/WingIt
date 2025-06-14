package com.example.server.controller;

import com.example.server.service.BlockService;
import com.example.server.dto.BlockDTO;
import com.example.server.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/blocks")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class BlockController {

    private final BlockService blockService;

    @Autowired
    public BlockController(BlockService blockService) {
        this.blockService = blockService;
    }

    @PostMapping("/{blockedUserId}")
    public ResponseEntity<?> blockUser(@PathVariable Integer blockedUserId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();

            BlockDTO result = blockService.blockUser(currentUsername, blockedUserId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{blockedUserId}")
    public ResponseEntity<?> unblockUser(@PathVariable Integer blockedUserId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();

            blockService.unblockUser(currentUsername, blockedUserId);
            return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/blocked")
    public ResponseEntity<List<UserDTO>> getBlockedUsers() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();

            List<UserDTO> blockedUsers = blockService.getBlockedUsers(currentUsername);
            return ResponseEntity.ok(blockedUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<Map<String, Boolean>> isUserBlocked(@PathVariable Integer userId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();

            boolean isBlocked = blockService.isUserBlocked(currentUsername, userId);
            return ResponseEntity.ok(Map.of("isBlocked", isBlocked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
