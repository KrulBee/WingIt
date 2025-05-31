package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostViewRequest {
    private String viewSource;
    private Long durationMs;
    private String sessionId;
}
