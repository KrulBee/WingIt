package com.example.server.controller;

import com.example.server.service.CommentService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comments")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class CommentController {

    private final CommentService commentService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }    // New endpoint to match frontend API call: POST /api/v1/comments
    @PostMapping
    public ResponseEntity<?> createCommentFromBody(@RequestBody CreateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            // Extract postId from request body
            Long postId = request.getPostId();
            if (postId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Post ID is required",
                    "message", "Post ID is required"
                ));
            }
            
            CommentDTO createdComment = commentService.createComment(postId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            
            // Check if it's a profanity error
            if (errorMessage.contains("từ ngữ không phù hợp") || 
                errorMessage.contains("chứa từ ngữ không phù hợp")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "PROFANITY_DETECTED",
                    "message", errorMessage,
                    "isProfanityError", true
                ));
            }
            
            // Other errors (AI loading, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", errorMessage,
                "message", "Không thể tạo bình luận: " + errorMessage,
                "isProfanityError", false
            ));
        }
    }    @PostMapping("/post/{postId}")
    public ResponseEntity<?> createComment(@PathVariable Long postId, @RequestBody CreateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            CommentDTO createdComment = commentService.createComment(postId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            
            // Check if it's a profanity error
            if (errorMessage.contains("từ ngữ không phù hợp") || 
                errorMessage.contains("chứa từ ngữ không phù hợp")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "PROFANITY_DETECTED",
                    "message", errorMessage,
                    "isProfanityError", true
                ));
            }
            
            // Other errors (AI loading, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", errorMessage,
                "message", "Không thể tạo bình luận: " + errorMessage,
                "isProfanityError", false
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long id, @RequestBody CreateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);

            CommentDTO updatedComment = commentService.updateComment(id, request, userId);
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);

            commentService.deleteComment(id, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }    @PostMapping("/{commentId}/replies")
    public ResponseEntity<CommentDTO> createReply(@PathVariable Long commentId, @RequestBody CreateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            CommentDTO createdReply = commentService.createReply(commentId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReply);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<CommentDTO>> getRepliesByCommentId(@PathVariable Long commentId) {
        List<CommentDTO> replies = commentService.getRepliesByCommentId(commentId);
        return ResponseEntity.ok(replies);
    }private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getId();
        }
        throw new RuntimeException("User not found in authentication context");
    }
}
