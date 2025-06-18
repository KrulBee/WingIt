package com.example.server.controller;

import com.example.server.service.RoomUserService;
import com.example.server.dto.RoomUserDTO;
import com.example.server.config.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;

@RestController
@RequestMapping("/api/v1/room-users")
public class RoomUserController {    private final RoomUserService roomUserService;
    private final JwtService jwtService;

    public RoomUserController(RoomUserService roomUserService, JwtService jwtService) {
        this.roomUserService = roomUserService;
        this.jwtService = jwtService;
    }

    /**
     * Get users in a specific chat room with authentication
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<RoomUserDTO>> getRoomUsers(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        try {            // Extract and validate JWT token
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.getUsernameFromJWT(token);
            
            if (username == null || !jwtService.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            // Check if user is member of this room (simplified - you'll need to get userId from username)
            List<RoomUserDTO> roomUsers = roomUserService.getRoomUsers(roomId);
            
            return ResponseEntity.ok(roomUsers);
        } catch (Exception e) {
            return ResponseEntity.status(401).build(); // Authentication required
        }
    }    /**
     * Add user to chat room (only for group chats) - simplified
     */
    @PostMapping("/room/{roomId}/add")
    public ResponseEntity<RoomUserDTO> addUserToRoom(
            @PathVariable Long roomId,
            @RequestParam Integer userIdToAdd,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.getUsernameFromJWT(token);
            
            if (username == null || !jwtService.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            // Only allow adding users to group chats, not private chats
            if (!roomUserService.isGroupChat(roomId)) {
                return ResponseEntity.status(400).build(); // Bad request - private chat
            }

            RoomUserDTO newRoomUser = roomUserService.addUserToRoom(roomId, userIdToAdd);
            return ResponseEntity.ok(newRoomUser);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Remove user from chat room (only for group chats) - simplified
     */
    @DeleteMapping("/room/{roomId}/remove/{userId}")
    public ResponseEntity<Void> removeUserFromRoom(
            @PathVariable Long roomId,
            @PathVariable Integer userId,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.getUsernameFromJWT(token);
            
            if (username == null || !jwtService.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            // Only allow removing users from group chats
            if (!roomUserService.isGroupChat(roomId)) {
                return ResponseEntity.status(400).build(); // Bad request - private chat
            }

            roomUserService.removeUserFromRoom(roomId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
