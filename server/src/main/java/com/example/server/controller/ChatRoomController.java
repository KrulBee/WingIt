package com.example.server.controller;

import com.example.server.service.ChatRoomService;
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
@RequestMapping("/api/v1/chatrooms")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public ChatRoomController(ChatRoomService chatRoomService) {
        this.chatRoomService = chatRoomService;
    }

    @GetMapping
    public ResponseEntity<List<ChatRoomDTO>> getUserChatRooms() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<ChatRoomDTO> chatRooms = chatRoomService.getChatRoomsByUserId(userId);
        return ResponseEntity.ok(chatRooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatRoomDTO> getChatRoomById(@PathVariable Long id) {
        try {
            ChatRoomDTO chatRoom = chatRoomService.getChatRoomById(id);
            return ResponseEntity.ok(chatRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }    @PostMapping("/create")
    public ResponseEntity<ChatRoomDTO> createChatRoom(@RequestBody CreateChatRoomRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            ChatRoomDTO chatRoom = chatRoomService.createChatRoom(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(chatRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/private/{otherUserId}")
    public ResponseEntity<ChatRoomDTO> findOrCreatePrivateChat(@PathVariable Integer otherUserId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer currentUserId = getUserIdFromAuth(auth);
            
            ChatRoomDTO chatRoom = chatRoomService.findOrCreatePrivateChat(currentUserId, otherUserId);
            return ResponseEntity.ok(chatRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinChatRoom(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            chatRoomService.joinChatRoom(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveChatRoom(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            chatRoomService.leaveChatRoom(id, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDTO>> getChatRoomMessages(@PathVariable Long id) {
        try {
            List<MessageDTO> messages = chatRoomService.getChatRoomMessages(id);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDTO> sendMessage(@PathVariable Long id, @RequestBody CreateMessageRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            MessageDTO message = chatRoomService.sendMessage(id, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getId();
        }
        throw new RuntimeException("User not found in authentication context");
    }
}
