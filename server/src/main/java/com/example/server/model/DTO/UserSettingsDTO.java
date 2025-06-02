package com.example.server.model.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class UserSettingsDTO {
    
    @NotNull
    private Integer userId;
    
    @Pattern(regexp = "^(public|friends|private)$", message = "Privacy level must be 'public', 'friends', or 'private'")
    private String privacyLevel = "friends";
    
    private Boolean showOnlineStatus = true;
    
    private Boolean allowSearchEngines = false;
    
    // Default constructor
    public UserSettingsDTO() {}
    
    // Constructor with all fields
    public UserSettingsDTO(Integer userId, String privacyLevel, Boolean showOnlineStatus, Boolean allowSearchEngines) {
        this.userId = userId;
        this.privacyLevel = privacyLevel;
        this.showOnlineStatus = showOnlineStatus;
        this.allowSearchEngines = allowSearchEngines;
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
    
    public Boolean getAllowSearchEngines() {
        return allowSearchEngines;
    }
    
    public void setAllowSearchEngines(Boolean allowSearchEngines) {
        this.allowSearchEngines = allowSearchEngines;
    }
    
    @Override
    public String toString() {
        return "UserSettingsDTO{" +
                "userId=" + userId +
                ", privacyLevel='" + privacyLevel + '\'' +
                ", showOnlineStatus=" + showOnlineStatus +
                ", allowSearchEngines=" + allowSearchEngines +
                '}';
    }
}
