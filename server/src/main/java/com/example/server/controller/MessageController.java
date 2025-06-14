package com.example.server.controller;

import com.example.server.service.ChatRoomService;
import com.example.server.dto.MessageDTO;
import com.example.server.dto.CreateMessageRequest;
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
@RequestMapping("/api/v1/messages")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class MessageController {

    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository;

    public MessageController(ChatRoomService chatRoomService, UserRepository userRepository) {
        this.chatRoomService = chatRoomService;
        this.userRepository = userRepository;
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByRoom(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<MessageDTO> messages = chatRoomService.getChatRoomMessages(roomId);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }    @PostMapping("/{roomId}")
    public ResponseEntity<MessageDTO> sendMessage(@PathVariable Long roomId, @RequestBody CreateMessageRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            MessageDTO message = chatRoomService.sendMessage(roomId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (RuntimeException e) {
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
