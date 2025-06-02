package com.example.server.controller;

import com.example.server.model.DTO.UserSettingsDTO;
import com.example.server.service.UserSettingsService;
import com.example.server.repository.UserRepository;
import com.example.server.model.Entity.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserSettingsController {
    
    @Autowired
    private UserSettingsService userSettingsService;
    
    @Autowired
    private UserRepository userRepository;    /**
     * Get user settings by user ID
     * @param userId the user ID
     * @return ResponseEntity with user settings or error message
     */
    @GetMapping("/{userId}/settings")
    public ResponseEntity<?> getUserSettings(@PathVariable Integer userId) {
        try {
            // Get authenticated user's ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer authenticatedUserId = getUserIdFromAuth(auth);
            
            // Check if the authenticated user is trying to access their own settings
            if (!authenticatedUserId.equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. You can only access your own settings.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            UserSettingsDTO settings = userSettingsService.getUserSettings(userId);
            return ResponseEntity.ok(settings);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
      /**
     * Update user settings
     * @param userId the user ID
     * @param userSettingsDTO the settings to update
     * @return ResponseEntity with updated settings or error message
     */
    @PutMapping("/{userId}/settings")
    public ResponseEntity<?> updateUserSettings(
            @PathVariable Integer userId,
            @Valid @RequestBody UserSettingsDTO userSettingsDTO) {
        try {
            // Get authenticated user's ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer authenticatedUserId = getUserIdFromAuth(auth);
            
            // Check if the authenticated user is trying to update their own settings
            if (!authenticatedUserId.equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. You can only update your own settings.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Ensure the userId in path matches the one in DTO
            userSettingsDTO.setUserId(userId);
            
            UserSettingsDTO updatedSettings = userSettingsService.updateUserSettings(userSettingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }    /**
     * Reset user settings to defaults
     * @param userId the user ID
     * @return ResponseEntity with default settings or error message
     */
    @PostMapping("/{userId}/settings/reset")
    public ResponseEntity<?> resetUserSettings(@PathVariable Integer userId) {
        try {
            // Get authenticated user's ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer authenticatedUserId = getUserIdFromAuth(auth);
            
            // Check if the authenticated user is trying to reset their own settings
            if (!authenticatedUserId.equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. You can only reset your own settings.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            UserSettingsDTO defaultSettings = userSettingsService.resetToDefaults(userId);
            return ResponseEntity.ok(defaultSettings);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
      /**
     * Delete user settings
     * @param userId the user ID
     * @return ResponseEntity with success message or error
     */
    @DeleteMapping("/{userId}/settings")
    public ResponseEntity<?> deleteUserSettings(@PathVariable Integer userId) {
        try {
            // Get authenticated user's ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer authenticatedUserId = getUserIdFromAuth(auth);
            
            // Check if the authenticated user is trying to delete their own settings
            if (!authenticatedUserId.equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. You can only delete your own settings.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            userSettingsService.deleteUserSettings(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User settings deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }    /**
     * Update specific setting field
     * @param userId the user ID
     * @param settingName the name of the setting to update
     * @param request the request body containing the new value
     * @return ResponseEntity with updated settings or error message
     */
    @PatchMapping("/{userId}/settings/{settingName}")
    public ResponseEntity<?> updateSpecificSetting(
            @PathVariable Integer userId,
            @PathVariable String settingName,
            @RequestBody Map<String, Object> request) {
        try {
            // Get authenticated user's ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer authenticatedUserId = getUserIdFromAuth(auth);
            
            // Check if the authenticated user is trying to update their own settings
            if (!authenticatedUserId.equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. You can only update your own settings.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Get current settings
            UserSettingsDTO currentSettings = userSettingsService.getUserSettings(userId);
            
            // Update specific field
            Object value = request.get("value");
            switch (settingName.toLowerCase()) {
                case "privacylevel":
                    currentSettings.setPrivacyLevel((String) value);
                    break;
                case "showonlinestatus":
                    currentSettings.setShowOnlineStatus((Boolean) value);
                    break;
                case "allowsearchengines":
                    currentSettings.setAllowSearchEngines((Boolean) value);
                    break;
                default:
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid setting name: " + settingName);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            UserSettingsDTO updatedSettings = userSettingsService.updateUserSettings(currentSettings);
            return ResponseEntity.ok(updatedSettings);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
      /**
     * Helper method to extract user ID from authentication
     * @param auth the authentication object
     * @return user ID
     */
    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        System.out.println("DEBUG: Extracting user ID for username: " + username);
        
        User user = userRepository.findByUsername(username);
        if (user != null) {
            System.out.println("DEBUG: Found user with ID: " + user.getId() + " for username: " + username);
            return user.getId();
        }
        
        System.err.println("ERROR: User not found for username: " + username);
        System.out.println("DEBUG: All users in database:");
        userRepository.findAll().forEach(u -> 
            System.out.println("  - ID: " + u.getId() + ", Username: " + u.getUsername())
        );
        
        throw new RuntimeException("User not found in authentication context");
    }
}
