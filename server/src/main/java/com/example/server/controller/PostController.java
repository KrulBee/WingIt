package com.example.server.controller;

import com.example.server.service.PostService;
import com.example.server.service.CloudinaryService;
import com.example.server.dto.*;
import com.example.server.repository.UserRepository;
import com.example.server.model.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;
    private final CloudinaryService cloudinaryService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public PostController(PostService postService, CloudinaryService cloudinaryService) {
        this.postService = postService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
        try {
            PostDTO post = postService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody CreatePostRequest request) {
        try {
            // Get current user ID from authentication
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            PostDTO createdPost = postService.createPost(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long id, @RequestBody CreatePostRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);

            PostDTO updatedPost = postService.updatePost(id, request, userId);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);

            postService.deletePost(id, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUserId(@PathVariable Integer userId) {
        List<PostDTO> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<PostDTO>> getPostsByLocationId(@PathVariable Integer locationId) {
        List<PostDTO> posts = postService.getPostsByLocationId(locationId);
        return ResponseEntity.ok(posts);
    }

    /**
     * Upload media files for a post
     * 
     * @param files The files to upload
     * @return A list of URLs for the uploaded files
     */
    @PostMapping("/upload-media")
    public ResponseEntity<?> uploadPostMedia(@RequestParam("files") List<MultipartFile> files, HttpServletRequest request) {
        try {
            // Debug authentication
            System.out.println("=== UPLOAD ENDPOINT DEBUG ===");
            System.out.println("Authorization Header: " + request.getHeader("Authorization"));
            System.out.println("Files count: " + files.size());
            System.out.println("Authentication: " + SecurityContextHolder.getContext().getAuthentication());

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("No authentication found in upload endpoint!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }

            System.out.println("User authenticated: " + auth.getName());
            List<String> mediaUrls = new ArrayList<>();
            
            for (MultipartFile file : files) {
                // Upload each file to the "posts" folder in Cloudinary
                String mediaUrl = cloudinaryService.uploadFile(file, "wingit/posts");
                mediaUrls.add(mediaUrl);
            }
            
            Map<String, List<String>> response = new HashMap<>();
            response.put("urls", mediaUrls);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload post media: " + e.getMessage());
        }
    }
    
    /**
     * Delete a post media from Cloudinary
     * 
     * @param url The URL of the media to delete
     * @return Success or error message
     */
    @DeleteMapping("/delete-media")
    public ResponseEntity<?> deletePostMedia(@RequestParam("url") String url) {
        try {
            cloudinaryService.deleteFile(url);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Media deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete media: " + e.getMessage());
        }
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
