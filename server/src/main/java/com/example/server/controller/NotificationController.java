package com.example.server.controller;

import com.example.server.dto.NotificationDTO;
import com.example.server.service.NotificationService;
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
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getCurrentUserNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<NotificationDTO> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Integer userId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = getUserIdFromAuth(auth);
        
        List<NotificationDTO> notifications = notificationService.getUnreadNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/create")
    public ResponseEntity<NotificationDTO> createNotification(@RequestParam Integer userId, 
                                                              @RequestParam Long postId, 
                                                              @RequestParam String type) {
        try {
            NotificationDTO notification = notificationService.createNotification(userId, postId, type);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification marked as read");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            notificationService.markAllAsRead(userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications marked as read");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Helper method to extract user ID from authentication
    private Integer getUserIdFromAuth(Authentication auth) {
        // Placeholder - implement based on your JWT setup
        return 1;
    }
}
