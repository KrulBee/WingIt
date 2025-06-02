package com.example.server.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String token;
    
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private boolean used = false;
    
    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.expiryDate = LocalDateTime.now().plusHours(1); // 1 hour expiry
        this.used = false;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
