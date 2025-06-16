package com.example.server.controller;

import com.example.server.dto.ForgotPasswordRequest;
import com.example.server.dto.ResetPasswordRequest;
import com.example.server.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/password-reset")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class PasswordResetController {
    
    @Autowired
    private PasswordResetService passwordResetService;
      @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.requestPasswordReset(request);
            return ResponseEntity.ok(Map.of(
                "message", "Nếu tài khoản với email đó tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu trong thời gian ngắn."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Không thể xử lý yêu cầu đặt lại mật khẩu"
            ));
        }
    }
      @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request);
            return ResponseEntity.ok(Map.of(
                "message", "Mật khẩu đã được đặt lại thành công"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Không thể đặt lại mật khẩu"
            ));
        }
    }
      @GetMapping("/validate/{token}")
    public ResponseEntity<?> validateResetToken(@PathVariable String token) {
        try {
            boolean isValid = passwordResetService.validateResetToken(token);
            return ResponseEntity.ok(Map.of(
                "valid", isValid
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "error", "Mã thông báo không hợp lệ"
            ));
        }
    }
}
