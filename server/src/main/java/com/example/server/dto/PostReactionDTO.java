package com.example.server.dto;

import com.example.server.model.Entity.ReactionType;
import java.time.LocalDateTime;

public class PostReactionDTO {
    private Long id;
    private Long postId;
    private Long userId;
    private Long reactionTypeId;
    private LocalDateTime timestamp;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getReactionTypeId() {
        return reactionTypeId;
    }

    public void setReactionTypeId(Long reactionTypeId) {
        this.reactionTypeId = reactionTypeId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
