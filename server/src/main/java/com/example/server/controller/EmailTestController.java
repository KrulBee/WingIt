package com.example.server.controller;

import com.example.server.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EmailTestController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        try {
            String toEmail = request.get("email");
            if (toEmail == null || toEmail.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email address is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Send a test password reset email
            emailService.sendPasswordResetEmail(toEmail, "test-token-123", "TestUser");
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Test email sent successfully to " + toEmail);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to send test email: " + e.getMessage());
            response.put("details", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }
}
