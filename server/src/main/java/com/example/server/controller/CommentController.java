package com.example.server.controller;

import com.example.server.service.CommentService;
import com.example.server.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<CommentDTO> createComment(@PathVariable Long postId, @RequestBody CreateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            CommentDTO createdComment = commentService.createComment(postId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long id, @RequestBody CreateCommentRequest request) {
        try {
            CommentDTO updatedComment = commentService.updateComment(id, request);
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<CommentReplyDTO> createReply(@PathVariable Long commentId, @RequestBody CreateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            CommentReplyDTO createdReply = commentService.createReply(commentId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReply);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<CommentReplyDTO>> getRepliesByCommentId(@PathVariable Long commentId) {
        List<CommentReplyDTO> replies = commentService.getRepliesByCommentId(commentId);
        return ResponseEntity.ok(replies);
    }

    private Integer getUserIdFromAuth(Authentication auth) {
        // Placeholder - implement based on your JWT setup
        return 1;
    }
}
