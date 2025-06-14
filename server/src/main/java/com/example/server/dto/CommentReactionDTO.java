package com.example.server.dto;

import java.time.LocalDateTime;

public class CommentReactionDTO {
    private Long id;
    private Long commentId;
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

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
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
