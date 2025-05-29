package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    private String text;
    private String content; // Add support for 'content' field from frontend
    private Long postId; // Add support for postId in request body
    
    // Helper method to get the actual text content
    public String getActualText() {
        return content != null ? content : text;
    }
}
