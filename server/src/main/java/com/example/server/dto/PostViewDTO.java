package com.example.server.dto;

import com.example.server.model.Entity.PostView;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostViewDTO {
    private Long id;
    private Long postId;
    private Integer userId; // Can be null for anonymous views
    private String viewSource;
    private Long durationMs;
    private LocalDateTime viewedAt;
    private String sessionId;
    private String ipAddress;
    private String userAgent;
}
