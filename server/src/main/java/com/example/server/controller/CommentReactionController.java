package com.example.server.controller;

import com.example.server.dto.CommentReactionDTO;
import com.example.server.service.CommentReactionService;
import com.example.server.repository.UserRepository;
import com.example.server.model.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comment-reactions")
public class CommentReactionController {    private final CommentReactionService commentReactionService;
    
    @Autowired
    private UserRepository userRepository;

    public CommentReactionController(CommentReactionService commentReactionService) {
        this.commentReactionService = commentReactionService;
    }

    @PostMapping("/comments/{commentId}/react")
    public ResponseEntity<CommentReactionDTO> addReaction(@PathVariable Long commentId, 
                                                         @RequestParam Long reactionTypeId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            CommentReactionDTO reaction = commentReactionService.addReaction(commentId, userId, reactionTypeId);
            return ResponseEntity.status(HttpStatus.CREATED).body(reaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/comments/{commentId}/react")
    public ResponseEntity<Void> removeReaction(@PathVariable Long commentId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            commentReactionService.removeReaction(commentId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/comments/{commentId}")
    public ResponseEntity<List<CommentReactionDTO>> getReactionsByCommentId(@PathVariable Long commentId) {
        List<CommentReactionDTO> reactions = commentReactionService.getReactionsByCommentId(commentId);
        return ResponseEntity.ok(reactions);
    }

    @GetMapping("/comments/{commentId}/user")
    public ResponseEntity<CommentReactionDTO> getUserReactionForComment(@PathVariable Long commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        CommentReactionDTO reaction = commentReactionService.getUserReactionForComment(commentId, userId);
        if (reaction != null) {
            return ResponseEntity.ok(reaction);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/comments/{commentId}/count")
    public ResponseEntity<Map<String, Long>> getReactionCount(@PathVariable Long commentId) {
        long count = commentReactionService.getReactionCountByCommentId(commentId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/comments/{commentId}/count/{reactionTypeId}")
    public ResponseEntity<Map<String, Long>> getReactionCountByType(@PathVariable Long commentId, 
                                                                   @PathVariable Long reactionTypeId) {
        long count = commentReactionService.getReactionCountByCommentIdAndType(commentId, reactionTypeId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<List<CommentReactionDTO>> getCurrentUserReactions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<CommentReactionDTO> reactions = commentReactionService.getReactionsByUserId(userId);
        return ResponseEntity.ok(reactions);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommentReactionDTO>> getUserReactions(@PathVariable Integer userId) {
        List<CommentReactionDTO> reactions = commentReactionService.getReactionsByUserId(userId);
        return ResponseEntity.ok(reactions);
    }

    // Helper method to extract user ID from authentication
    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getId();
        }
        throw new RuntimeException("User not found in authentication context");
    }
}
