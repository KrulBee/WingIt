package com.example.server.service;

import com.example.server.dto.ForgotPasswordRequest;
import com.example.server.dto.ResetPasswordRequest;
import com.example.server.model.Entity.PasswordResetToken;
import com.example.server.model.Entity.User;
import com.example.server.repository.PasswordResetTokenRepository;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@Transactional
public class PasswordResetService {
    
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final SecureRandom secureRandom = new SecureRandom();
      public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        
        User user = userRepository.findByEmail(email);
        if (user == null) {
            // For security reasons, don't reveal if email exists or not
            logger.warn("Password reset requested for non-existent email: {}", email);
            return;
        }
        
        // Invalidate any existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);
        
        // Generate secure token
        String token = generateSecureToken();
        
        // Create new token
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(resetToken);
        
        // Send email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token, user.getUsername());
            logger.info("Password reset email sent for user: {}", user.getUsername());
        } catch (Exception e) {
            logger.error("Failed to send password reset email for user: {}", user.getUsername(), e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }
    
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken();
        String newPassword = request.getNewPassword();
        
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByTokenAndUsedFalse(token);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired reset token");
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired");
        }
        
        if (resetToken.isUsed()) {
            throw new RuntimeException("Reset token has already been used");
        }
        
        User user = resetToken.getUser();
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        
        logger.info("Password successfully reset for user: {}", user.getUsername());
    }
    
    public boolean validateResetToken(String token) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByTokenAndUsedFalse(token);
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        return !resetToken.isExpired() && !resetToken.isUsed();
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        logger.info("Cleaned up expired password reset tokens");
    }
    
    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
