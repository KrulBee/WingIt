package com.example.server.controller;

import com.example.server.handler.WebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/websocket")
public class WebSocketController {

    @Autowired
    private WebSocketHandler webSocketHandler;

    @GetMapping("/status")
    public ResponseEntity<?> getWebSocketStatus() {
        try {
            int activeUsers = webSocketHandler.getActiveUserCount();
            return ResponseEntity.ok(Map.of(
                "status", "active",
                "activeUsers", activeUsers,
                "message", "WebSocket service is running"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", "WebSocket service error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/user-online/{username}")
    public ResponseEntity<?> checkUserOnlineStatus(@PathVariable String username) {
        try {
            boolean isOnline = webSocketHandler.isUserOnline(username);
            return ResponseEntity.ok(Map.of(
                "username", username,
                "isOnline", isOnline
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error checking user status: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/send-notification")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, String> request) {        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String targetUser = request.get("targetUser");
            String notificationType = request.get("notificationType");
            String content = request.get("content");

            if (targetUser == null || notificationType == null || content == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required fields: targetUser, notificationType, content"
                ));
            }

            webSocketHandler.sendNotificationToUser(targetUser, notificationType, content);
            
            return ResponseEntity.ok(Map.of(
                "message", "Notification sent successfully",
                "targetUser", targetUser,
                "notificationType", notificationType
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error sending notification: " + e.getMessage()
            ));
        }
    }
}
