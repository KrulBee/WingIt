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
            helper.setSubject("Đặt lại mật khẩu - " + appName);
            
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
            helper.setSubject("Xác nhận địa chỉ email mới - " + appName);
            
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
            helper.setSubject("Địa chỉ email đã được thay đổi - " + appName);
            
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
                <title>Đặt lại mật khẩu</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .button:hover { background-color: #218838; }
                    .link { color:rgb(255, 255, 255); text-decoration: underline; word-break: break-all; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                    </div>
                    <div class="content">
                        <h2>Yêu cầu đặt lại mật khẩu</h2>
                        <p>Xin chào %s,</p>
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Nếu bạn đã thực hiện yêu cầu này, vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
                        <a href="%s" class="button">Đặt lại mật khẩu</a>
                        <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết này vào trình duyệt của mình:</p>
                        <p><a href="%s" class="link">%s</a></p>
                        <p>Liên kết này sẽ hết hạn sau 1 giờ vì lý do bảo mật.</p>
                        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này một cách an toàn. Mật khẩu của bạn sẽ không thay đổi.</p>
                    </div>
                    <div class="footer">
                        <p>Đây là tin nhắn tự động từ %s. Vui lòng không trả lời email này.</p>
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
                <title>Địa chỉ email đã được thay đổi</title>
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
                        <h2>Địa chỉ email đã được thay đổi thành công</h2>
                        <p>Xin chào %s,</p>
                        <p>Địa chỉ email của bạn đã được thay đổi thành công thành: <strong>%s</strong></p>
                        <p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi ngay lập tức.</p>
                        <p>Vì lý do bảo mật, bạn sẽ cần sử dụng địa chỉ email mới cho tất cả các lần đăng nhập và giao tiếp trong tương lai.</p>
                    </div>
                    <div class="footer">
                        <p>Đây là tin nhắn tự động từ %s. Vui lòng không trả lời email này.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(appName, username, newEmail, appName);
    }
      private String buildEmailChangeVerificationTemplate(String username, String verificationUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Xác nhận địa chỉ email mới</title>
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
                        <h2>Xác nhận địa chỉ email mới</h2>
                        <p>Xin chào %s,</p>
                        <p>Chúng tôi đã nhận được yêu cầu thay đổi địa chỉ email của bạn. Để hoàn tất việc thay đổi này, vui lòng xác nhận rằng bạn sở hữu địa chỉ email này bằng cách nhấp vào nút bên dưới:</p>
                        <a href="%s" class="button">Xác nhận địa chỉ email</a>
                        <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết này vào trình duyệt của mình:</p>
                        <p><a href="%s">%s</a></p>
                        <p><strong>Quan trọng:</strong> Liên kết xác nhận này sẽ hết hạn sau 1 giờ vì lý do bảo mật.</p>
                        <p>Nếu bạn không yêu cầu thay đổi email này, bạn có thể bỏ qua email này một cách an toàn. Email tài khoản của bạn sẽ không thay đổi.</p>
                    </div>
                    <div class="footer">
                        <p>Đây là tin nhắn tự động từ %s. Vui lòng không trả lời email này.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(appName, username, verificationUrl, verificationUrl, verificationUrl, appName);
    }
}
