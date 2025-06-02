package com.example.server.service;

import com.example.server.dto.RequestEmailChangeRequest;
import com.example.server.dto.VerifyEmailChangeRequest;
import com.example.server.model.Entity.EmailChangeToken;
import com.example.server.model.Entity.User;
import com.example.server.repository.EmailChangeTokenRepository;
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
public class EmailChangeService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailChangeService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailChangeTokenRepository emailChangeTokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    public void requestEmailChange(Integer userId, RequestEmailChangeRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        
        // Verify current password for security
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Check if new email is already in use
        String newEmail = request.getNewEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email is already in use by another account");
        }
        
        // Check if there's already a pending email change for this email
        if (emailChangeTokenRepository.existsByNewEmailAndUsedFalse(newEmail)) {
            throw new RuntimeException("There is already a pending email change for this address");
        }
        
        // Invalidate any existing tokens for this user
        emailChangeTokenRepository.deleteByUser(user);
        
        // Generate secure token
        String token = generateSecureToken();
        
        // Create new token
        EmailChangeToken changeToken = new EmailChangeToken(token, newEmail, user);
        emailChangeTokenRepository.save(changeToken);
        
        // Send verification email to NEW email address
        try {
            emailService.sendEmailChangeVerification(newEmail, token, user.getUsername());
            logger.info("Email change verification sent to: {} for user: {}", newEmail, user.getUsername());
        } catch (Exception e) {
            logger.error("Failed to send email change verification for user: {}", user.getUsername(), e);
            throw new RuntimeException("Failed to send verification email");
        }
    }
    
    public void verifyEmailChange(VerifyEmailChangeRequest request) {
        String token = request.getToken();
        
        Optional<EmailChangeToken> tokenOpt = emailChangeTokenRepository.findByTokenAndUsedFalse(token);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired verification token");
        }
        
        EmailChangeToken changeToken = tokenOpt.get();
        
        if (changeToken.isExpired()) {
            throw new RuntimeException("Verification token has expired");
        }
        
        if (changeToken.isUsed()) {
            throw new RuntimeException("Verification token has already been used");
        }
        
        User user = changeToken.getUser();
        String newEmail = changeToken.getNewEmail();
        
        // Double-check email is still available
        if (userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email is no longer available");
        }
        
        // Update user email
        user.setEmail(newEmail);
        userRepository.save(user);
        
        // Mark token as used
        changeToken.markAsUsed();
        emailChangeTokenRepository.save(changeToken);
        
        logger.info("Email successfully changed for user: {} to: {}", user.getUsername(), newEmail);
    }
    
    public boolean validateEmailChangeToken(String token) {
        Optional<EmailChangeToken> tokenOpt = emailChangeTokenRepository.findByTokenAndUsedFalse(token);
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        EmailChangeToken changeToken = tokenOpt.get();
        return !changeToken.isExpired() && !changeToken.isUsed();
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        emailChangeTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        logger.info("Cleaned up expired email change tokens");
    }
    
    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
