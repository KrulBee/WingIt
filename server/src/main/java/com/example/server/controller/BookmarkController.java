package com.example.server.controller;

import com.example.server.dto.BookmarkDTO;
import com.example.server.service.BookmarkService;
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
@RequestMapping("/api/v1/bookmarks")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @PostMapping("/posts/{postId}")
    public ResponseEntity<BookmarkDTO> addBookmark(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            BookmarkDTO bookmark = bookmarkService.addBookmark(postId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(bookmark);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> removeBookmark(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            bookmarkService.removeBookmark(postId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/{postId}/status")
    public ResponseEntity<Map<String, Boolean>> getBookmarkStatus(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            boolean isBookmarked = bookmarkService.isBookmarked(postId, userId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("isBookmarked", isBookmarked);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<BookmarkDTO>> getUserBookmarks() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            List<BookmarkDTO> bookmarks = bookmarkService.getUserBookmarks(userId);
            return ResponseEntity.ok(bookmarks);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/{postId}/count")
    public ResponseEntity<Map<String, Long>> getBookmarkCount(@PathVariable Long postId) {
        try {
            long count = bookmarkService.getBookmarkCount(postId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user.getId();
    }
}
