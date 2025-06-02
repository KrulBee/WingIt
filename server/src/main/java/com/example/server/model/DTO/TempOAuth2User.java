// filepath: c:\Study\2024-2025\DATN\Project\WingIt\server\src\main\java\com\example\server\model\DTO\TempOAuth2User.java
package com.example.server.model.DTO;

/**
 * Temporary storage for OAuth2 user data during account setup process
 */
public class TempOAuth2User {
    private String email;
    private String provider;
    private String providerId;
    private String displayName;
    private String profilePicture;
    
    public TempOAuth2User() {}
    
    public TempOAuth2User(String email, String provider, String providerId, String displayName, String profilePicture) {
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
        this.displayName = displayName;
        this.profilePicture = profilePicture;
    }
    
    // Getters and setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public String getProviderId() {
        return providerId;
    }
    
    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
