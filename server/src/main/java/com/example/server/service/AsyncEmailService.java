package com.example.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Async Email Service for Social Media Platform
 * Handles email sending in background without blocking user operations
 */
@Service
public class AsyncEmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Send password reset email asynchronously
     * Critical for social media user experience - don't block password reset
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> sendPasswordResetEmailAsync(String to, String resetToken, String baseUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("WingIt - Password Reset Request");
            message.setText("Click the link to reset your password: " + 
                          baseUrl + "/reset-password?token=" + resetToken + 
                          "\n\nThis link will expire in 1 hour.");
            
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + to);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Send email verification asynchronously
     * Important for user registration flow in social media
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> sendEmailVerificationAsync(String to, String verificationToken, String baseUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("WingIt - Email Verification");
            message.setText("Please verify your email by clicking this link: " + 
                          baseUrl + "/verify-email?token=" + verificationToken +
                          "\n\nWelcome to WingIt!");
            
            mailSender.send(message);
            System.out.println("Email verification sent successfully to: " + to);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            System.err.println("Failed to send email verification: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Send email change confirmation asynchronously
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> sendEmailChangeConfirmationAsync(String newEmail, String confirmationToken, String baseUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(newEmail);
            message.setSubject("WingIt - Email Change Confirmation");
            message.setText("Confirm your new email address by clicking this link: " + 
                          baseUrl + "/verify-email-change?token=" + confirmationToken +
                          "\n\nIf you didn't request this change, please ignore this email.");
            
            mailSender.send(message);
            System.out.println("Email change confirmation sent successfully to: " + newEmail);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            System.err.println("Failed to send email change confirmation: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Send weekly digest email asynchronously
     * Perfect for social media engagement emails
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> sendWeeklyDigestAsync(String to, String digestContent) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("WingIt - Your Weekly Digest");
            message.setText(digestContent);
            
            mailSender.send(message);
            System.out.println("Weekly digest sent successfully to: " + to);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            System.err.println("Failed to send weekly digest: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Send account security alert asynchronously
     */
    @Async("emailExecutor")
    public CompletableFuture<Void> sendSecurityAlertAsync(String to, String alertMessage) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("WingIt - Security Alert");
            message.setText("Security Alert: " + alertMessage + 
                          "\n\nIf this wasn't you, please secure your account immediately.");
            
            mailSender.send(message);
            System.out.println("Security alert sent successfully to: " + to);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            System.err.println("Failed to send security alert: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }
}
