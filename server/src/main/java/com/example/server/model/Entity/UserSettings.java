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
    private User user;
      @Column(name = "privacy_level", nullable = false, length = 20)
    private String privacyLevel = "friends"; // User's privacy level: 'public', 'friends', or 'private'
    
    @Column(name = "show_online_status", nullable = false)
    private Boolean showOnlineStatus = true; // Whether to show user's online status to others
    
    @Column(name = "allow_search_engines", nullable = false)
    private Boolean allowSearchEngines = false; // Enable sound notifications (field repurposed from search engines)
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Default constructor
    public UserSettings() {}
      // Constructor with all fields
    public UserSettings(User user, String privacyLevel, Boolean showOnlineStatus, Boolean allowSearchEngines) {
        this.user = user;
        this.privacyLevel = privacyLevel;
        this.showOnlineStatus = showOnlineStatus;
        this.allowSearchEngines = allowSearchEngines;
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
    
    public Boolean getAllowSearchEngines() {
        return allowSearchEngines;
    }
    
    public void setAllowSearchEngines(Boolean allowSearchEngines) {
        this.allowSearchEngines = allowSearchEngines;
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
    }
      @Override
    public String toString() {
        return "UserSettings{" +
                "userId=" + userId +
                ", privacyLevel='" + privacyLevel + '\'' +
                ", showOnlineStatus=" + showOnlineStatus +
                ", allowSearchEngines=" + allowSearchEngines +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
