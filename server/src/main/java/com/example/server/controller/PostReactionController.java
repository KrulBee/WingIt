package com.example.server.controller;

import com.example.server.dto.PostReactionDTO;
import com.example.server.service.PostReactionService;
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
@RequestMapping("/api/v1/post-reactions")
public class PostReactionController {

    private final PostReactionService postReactionService;

    @Autowired
    public PostReactionController(PostReactionService postReactionService) {
        this.postReactionService = postReactionService;
    }

    @PostMapping("/posts/{postId}/react")
    public ResponseEntity<PostReactionDTO> addReaction(@PathVariable Long postId, 
                                                      @RequestParam Long reactionTypeId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            PostReactionDTO reaction = postReactionService.addReaction(postId, userId, reactionTypeId);
            return ResponseEntity.status(HttpStatus.CREATED).body(reaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/posts/{postId}/react")
    public ResponseEntity<Void> removeReaction(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            postReactionService.removeReaction(postId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<List<PostReactionDTO>> getReactionsByPostId(@PathVariable Long postId) {
        List<PostReactionDTO> reactions = postReactionService.getReactionsByPostId(postId);
        return ResponseEntity.ok(reactions);
    }

    @GetMapping("/posts/{postId}/user")
    public ResponseEntity<PostReactionDTO> getUserReactionForPost(@PathVariable Long postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        PostReactionDTO reaction = postReactionService.getUserReactionForPost(postId, userId);
        if (reaction != null) {
            return ResponseEntity.ok(reaction);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/posts/{postId}/count")
    public ResponseEntity<Map<String, Long>> getReactionCount(@PathVariable Long postId) {
        long count = postReactionService.getReactionCountByPostId(postId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postId}/count/{reactionTypeId}")
    public ResponseEntity<Map<String, Long>> getReactionCountByType(@PathVariable Long postId, 
                                                                   @PathVariable Long reactionTypeId) {
        long count = postReactionService.getReactionCountByPostIdAndType(postId, reactionTypeId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<List<PostReactionDTO>> getCurrentUserReactions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<PostReactionDTO> reactions = postReactionService.getReactionsByUserId(userId);
        return ResponseEntity.ok(reactions);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostReactionDTO>> getUserReactions(@PathVariable Integer userId) {
        List<PostReactionDTO> reactions = postReactionService.getReactionsByUserId(userId);
        return ResponseEntity.ok(reactions);
    }

    // Helper method to extract user ID from authentication
    private Integer getUserIdFromAuth(Authentication auth) {
        // Placeholder - implement based on your JWT setup
        return 1;
    }
}
