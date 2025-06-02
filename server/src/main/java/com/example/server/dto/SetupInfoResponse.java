// filepath: c:\Study\2024-2025\DATN\Project\WingIt\server\src\main\java\com\example\server\dto\SetupInfoResponse.java
package com.example.server.dto;

/**
 * Response DTO for OAuth2 setup information
 */
public class SetupInfoResponse {
    private String email;
    private String displayName;
    private String profilePicture;
    private String provider;
    
    public SetupInfoResponse() {}
    
    public SetupInfoResponse(String email, String displayName, String profilePicture, String provider) {
        this.email = email;
        this.displayName = displayName;
        this.profilePicture = profilePicture;
        this.provider = provider;
    }
    
    // Getters and setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
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
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
}
