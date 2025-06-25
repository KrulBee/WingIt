package com.example.server.model.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class UserSettingsDTO {
      @NotNull
    private Integer userId;    @Pattern(regexp = "^(public|friends|private)$", message = "Privacy level must be 'public', 'friends', or 'private'")
    private String privacyLevel = "public"; // User's privacy level setting
    
    private Boolean showOnlineStatus = true; // Whether to show user's online status to others
    
    private Boolean enableNotifications = true; // Enable notifications for the user
    
    // Default constructor
    public UserSettingsDTO() {}
      // Constructor with all fields
    public UserSettingsDTO(Integer userId, String privacyLevel, Boolean showOnlineStatus, Boolean enableNotifications) {
        this.userId = userId;
        this.privacyLevel = privacyLevel;
        this.showOnlineStatus = showOnlineStatus;
        this.enableNotifications = enableNotifications;
    }
      // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
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
      @Override
    public String toString() {
        return "UserSettingsDTO{" +
                "userId=" + userId +
                ", privacyLevel='" + privacyLevel + '\'' +
                ", showOnlineStatus=" + showOnlineStatus +
                ", enableNotifications=" + enableNotifications +
                '}';
    }
}
