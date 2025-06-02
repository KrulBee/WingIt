package com.example.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.base-url}")
    private String baseUrl;
    
    @Value("${app.name}")
    private String appName;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendPasswordResetEmail(String toEmail, String resetToken, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - " + appName);
            
            String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
            
            String htmlContent = buildPasswordResetEmailTemplate(username, resetUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }    }
    
    public void sendEmailChangeVerification(String toEmail, String verificationToken, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your New Email Address - " + appName);
            
            String verificationUrl = baseUrl + "/verify-email-change?token=" + verificationToken;
            
            String htmlContent = buildEmailChangeVerificationTemplate(username, verificationUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Email change verification sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send email change verification to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email change verification", e);
        }
    }
    
    public void sendEmailChangeConfirmation(String toEmail, String username, String newEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Email Address Changed - " + appName);
            
            String htmlContent = buildEmailChangeConfirmationTemplate(username, newEmail);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Email change confirmation sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send email change confirmation to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email change confirmation", e);
        }
    }
    
    private String buildPasswordResetEmailTemplate(String username, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Password Reset</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                    </div>
                    <div class="content">
                        <h2>Password Reset Request</h2>
                        <p>Hello %s,</p>
                        <p>We received a request to reset your password. If you made this request, click the button below to reset your password:</p>
                        <a href="%s" class="button">Reset Password</a>
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p><a href="%s">%s</a></p>
                        <p>This link will expire in 1 hour for security reasons.</p>
                        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(appName, username, resetUrl, resetUrl, resetUrl, appName);
    }
    
    private String buildEmailChangeConfirmationTemplate(String username, String newEmail) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Email Address Changed</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                    </div>
                    <div class="content">
                        <h2>Email Address Successfully Changed</h2>
                        <p>Hello %s,</p>
                        <p>Your email address has been successfully changed to: <strong>%s</strong></p>
                        <p>If you didn't make this change, please contact our support team immediately.</p>
                        <p>For security reasons, you'll need to use your new email address for all future logins and communications.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>            """.formatted(appName, username, newEmail, appName);
    }
    
    private String buildEmailChangeVerificationTemplate(String username, String verificationUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Verify Your New Email Address</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #ffc107; color: black; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #ffc107; color: black; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                    </div>
                    <div class="content">
                        <h2>Verify Your New Email Address</h2>
                        <p>Hello %s,</p>
                        <p>We received a request to change your email address. To complete this change, please verify that you own this email address by clicking the button below:</p>
                        <a href="%s" class="button">Verify Email Address</a>
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p><a href="%s">%s</a></p>
                        <p><strong>Important:</strong> This verification link will expire in 1 hour for security reasons.</p>
                        <p>If you didn't request this email change, you can safely ignore this email. Your account email will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(appName, username, verificationUrl, verificationUrl, verificationUrl, appName);
    }
}
