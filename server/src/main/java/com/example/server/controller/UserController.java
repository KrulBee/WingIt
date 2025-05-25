package com.example.server.controller;

import com.example.server.dto.UserDTO;
import com.example.server.dto.UpdateUserProfileRequest;
import com.example.server.dto.ChangePasswordRequest;
import com.example.server.service.UserService;
import com.example.server.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        try {
            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        try {
            UserDTO user = userService.getUserByUsername(username);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getCurrentUserProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            UserDTO user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateUserProfile(@RequestBody UpdateUserProfileRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            UserDTO updatedUser = userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUserProfileById(@PathVariable Integer id, @RequestBody UpdateUserProfileRequest request) {
        try {
            UserDTO updatedUser = userService.updateUserProfile(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            boolean success = userService.changePassword(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("message", "Password changed successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Current password is incorrect");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Upload a profile picture
     * 
     * @param file The image file to upload
     * @return The URL of the uploaded profile picture
     */
    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            // Upload to the "profiles" folder in Cloudinary
            String mediaUrl = cloudinaryService.uploadFile(file, "wingit/profiles");
            
            Map<String, String> response = new HashMap<>();
            response.put("url", mediaUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload profile picture: " + e.getMessage());
        }
    }

    /**
     * Delete a profile picture from Cloudinary
     * 
     * @param url The URL of the profile picture to delete
     * @return Success or error message
     */
    @DeleteMapping("/profile-picture")
    public ResponseEntity<?> deleteProfilePicture(@RequestParam("url") String url) {
        try {
            cloudinaryService.deleteFile(url);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete profile picture: " + e.getMessage());
        }
    }

    // Helper method to extract user ID from authentication
    private Integer getUserIdFromAuth(Authentication auth) {
        // Placeholder - implement based on your JWT setup
        return 1;
    }
}
