package com.example.server.model.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
public class UserSettings {
    
    @Id
    @Column(name = "user_id")
    private Integer userId;
      @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;    @Column(name = "privacy_level", nullable = false, length = 20)
    private String privacyLevel = "public"; // User's privacy level: 'public', 'friends', or 'private'
    
    @Column(name = "show_online_status", nullable = false)
    private Boolean showOnlineStatus = true; // Whether to show user's online status to others
    
    @Column(name = "enable_notifications", nullable = false)
    private Boolean enableNotifications = true; // Enable notifications for the user
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Default constructor
    public UserSettings() {}    // Constructor with all fields
    public UserSettings(User user, String privacyLevel, Boolean showOnlineStatus, Boolean enableNotifications) {
        this.user = user;
        this.privacyLevel = privacyLevel;
        this.showOnlineStatus = showOnlineStatus;
        this.enableNotifications = enableNotifications;
    }
      @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        validatePrivacyLevel();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        validatePrivacyLevel();
    }
    
    public void validatePrivacyLevel() {
        if (privacyLevel != null && !privacyLevel.equals("public") && 
            !privacyLevel.equals("friends") && !privacyLevel.equals("private")) {
            throw new IllegalArgumentException("Privacy level must be 'public', 'friends', or 'private'");
        }
    }
      // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getPrivacyLevel() {
        return privacyLevel;
    }
    
    public void setPrivacyLevel(String privacyLevel) {
        this.privacyLevel = privacyLevel;
    }
    
    public Boolean getShowOnlineStatus() {
        return showOnlineStatus;
    }
    
    public void setShowOnlineStatus(Boolean showOnlineStatus) {
        this.showOnlineStatus = showOnlineStatus;
    }
      public Boolean getEnableNotifications() {
        return enableNotifications;
    }
    
    public void setEnableNotifications(Boolean enableNotifications) {
        this.enableNotifications = enableNotifications;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }    @Override
    public String toString() {
        return "UserSettings{" +
                "userId=" + userId +
                ", privacyLevel='" + privacyLevel + '\'' +
                ", showOnlineStatus=" + showOnlineStatus +
                ", enableNotifications=" + enableNotifications +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
