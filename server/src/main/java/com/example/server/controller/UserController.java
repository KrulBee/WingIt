package com.example.server.controller;

import com.example.server.dto.UserDTO;
import com.example.server.dto.UpdateUserProfileRequest;
import com.example.server.dto.ChangePasswordRequest;
import com.example.server.dto.RequestEmailChangeRequest;
import com.example.server.dto.VerifyEmailChangeRequest;
import com.example.server.service.UserService;
import com.example.server.service.EmailChangeService;
import com.example.server.service.CloudinaryService;
import com.example.server.repository.UserRepository;
import com.example.server.model.Entity.User;
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
public class UserController {    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailChangeService emailChangeService;

    @Autowired
    private UserRepository userRepository;

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
    }    @PostMapping("/request-email-change")
    public ResponseEntity<?> requestEmailChange(@RequestBody RequestEmailChangeRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            emailChangeService.requestEmailChange(userId, request);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification email sent to your new email address");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-email-change")
    public ResponseEntity<?> verifyEmailChange(@RequestBody VerifyEmailChangeRequest request) {
        try {
            emailChangeService.verifyEmailChange(request);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email address changed successfully");
            return ResponseEntity.ok(response);
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

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteCurrentUserAccount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);

            userService.deleteUser(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Account deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
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
    }    /**
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

    /**
     * Upload a cover photo
     * 
     * @param file The image file to upload
     * @return The URL of the uploaded cover photo
     */
    @PostMapping("/cover-photo")
    public ResponseEntity<?> uploadCoverPhoto(@RequestParam("file") MultipartFile file) {
        try {
            // Upload to the "covers" folder in Cloudinary
            String mediaUrl = cloudinaryService.uploadFile(file, "wingit/covers");
            
            Map<String, String> response = new HashMap<>();
            response.put("url", mediaUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload cover photo: " + e.getMessage());
        }
    }

    /**
     * Delete a cover photo from Cloudinary
     * 
     * @param url The URL of the cover photo to delete
     * @return Success or error message
     */
    @DeleteMapping("/cover-photo")
    public ResponseEntity<?> deleteCoverPhoto(@RequestParam("url") String url) {
        try {
            cloudinaryService.deleteFile(url);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cover photo deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete cover photo: " + e.getMessage());
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
