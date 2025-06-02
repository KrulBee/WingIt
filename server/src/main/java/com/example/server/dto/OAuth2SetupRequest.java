// filepath: c:\Study\2024-2025\DATN\Project\WingIt\server\src\main\java\com\example\server\dto\OAuth2SetupRequest.java
package com.example.server.dto;

/**
 * Request DTO for completing OAuth2 account setup
 */
public class OAuth2SetupRequest {
    private String setupToken;
    private String username;
    private String password;
    
    public OAuth2SetupRequest() {}
    
    public OAuth2SetupRequest(String setupToken, String username, String password) {
        this.setupToken = setupToken;
        this.username = username;
        this.password = password;
    }
    
    // Getters and setters
    public String getSetupToken() {
        return setupToken;
    }
    
    public void setSetupToken(String setupToken) {
        this.setupToken = setupToken;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
