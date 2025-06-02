package com.example.server.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_change_tokens")
@Data
@NoArgsConstructor
public class EmailChangeToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(nullable = false)
    private String newEmail;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private boolean used = false;
    
    @Column(nullable = false)
    private LocalDateTime createdDate;
    
    public EmailChangeToken(String token, String newEmail, User user) {
        this.token = token;
        this.newEmail = newEmail;
        this.user = user;
        this.expiryDate = LocalDateTime.now().plusHours(1); // 1 hour expiry
        this.createdDate = LocalDateTime.now();
        this.used = false;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
    
    public boolean isUsed() {
        return this.used;
    }
    
    public void markAsUsed() {
        this.used = true;
    }
}
