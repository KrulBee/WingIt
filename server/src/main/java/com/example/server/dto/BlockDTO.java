package com.example.server.dto;

import java.time.LocalDateTime;

public class BlockDTO {
    private Long id;
    private Integer userId;
    private Integer blockedUserId;
    private String blockedUsername;
    private String blockedDisplayName;
    private String blockedProfilePicture;
    private LocalDateTime createdAt;

    // Constructors
    public BlockDTO() {}

    public BlockDTO(Long id, Integer userId, Integer blockedUserId, String blockedUsername,
                   String blockedDisplayName, String blockedProfilePicture, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.blockedUserId = blockedUserId;
        this.blockedUsername = blockedUsername;
        this.blockedDisplayName = blockedDisplayName;
        this.blockedProfilePicture = blockedProfilePicture;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getBlockedUserId() {
        return blockedUserId;
    }

    public void setBlockedUserId(Integer blockedUserId) {
        this.blockedUserId = blockedUserId;
    }

    public String getBlockedUsername() {
        return blockedUsername;
    }

    public void setBlockedUsername(String blockedUsername) {
        this.blockedUsername = blockedUsername;
    }

    public String getBlockedDisplayName() {
        return blockedDisplayName;
    }

    public void setBlockedDisplayName(String blockedDisplayName) {
        this.blockedDisplayName = blockedDisplayName;
    }

    public String getBlockedProfilePicture() {
        return blockedProfilePicture;
    }

    public void setBlockedProfilePicture(String blockedProfilePicture) {
        this.blockedProfilePicture = blockedProfilePicture;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
